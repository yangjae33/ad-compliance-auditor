"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Building2,
  CreditCard,
  TrendingUp,
  Shield,
  AlertTriangle,
  Eye,
  Send,
  RefreshCw,
  User,
  Calendar,
  ClipboardList,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import { useCompliance } from "@/stores/ComplianceContext";
import { DraftDocument, DraftStatus, Sector } from "@/data/mockData";
import ChecklistPanel from "@/components/ChecklistPanel";
import {
  ChecklistReview,
  CheckResult,
  createInitialChecklistReview,
  getChecklistSummary,
} from "@/data/checklist/bankChecklist";

interface AICheckResult {
  itemId: string;
  result: "적정" | "부적정" | "해당없음";
  reason: string;
  confidence: number;
}

const sectorIcons: Record<Sector, React.ReactNode> = {
  "은행": <Building2 className="w-4 h-4" />,
  "카드": <CreditCard className="w-4 h-4" />,
  "증권": <TrendingUp className="w-4 h-4" />,
  "라이프": <Shield className="w-4 h-4" />,
};

const statusConfig: Record<DraftStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: "소비자보호부 검토 대기",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: <Clock className="w-4 h-4" />,
  },
  consumer_approved: {
    label: "준법감시인 검토 대기",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <Clock className="w-4 h-4" />,
  },
  approved: {
    label: "최종 승인",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: "반려됨",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <XCircle className="w-4 h-4" />,
  },
  review_requested: {
    label: "수정 요청",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
};

export default function ComplianceOfficerPage() {
  const router = useRouter();
  const { drafts, getComplianceOfficerPendingCount, updateDraftStatus } = useCompliance();
  const [filterStatus, setFilterStatus] = useState<DraftStatus | "all">("all");
  const [filterSector, setFilterSector] = useState<Sector | "all">("all");
  const [selectedDraft, setSelectedDraft] = useState<DraftDocument | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);
  const [checklistReview, setChecklistReview] = useState<ChecklistReview>(createInitialChecklistReview());
  const [isClient, setIsClient] = useState(false);
  
  // AI 자동 검토 관련 상태
  const [aiResults, setAiResults] = useState<AICheckResult[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isAIReviewing, setIsAIReviewing] = useState(false);
  const [aiReviewCompleted, setAiReviewCompleted] = useState(false);
  
  // 사전심사필 번호 팝업 관련 상태
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNumber, setApprovalNumber] = useState("");

  // 준법감시인 검토 대기 건수 (consumer_approved 상태)
  const pendingCount = getComplianceOfficerPendingCount();

  const checklistSummary = useMemo(() => getChecklistSummary(checklistReview), [checklistReview]);

  // Hydration 에러 방지를 위해 클라이언트 렌더링 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 선택된 기안이 변경되면 체크리스트 초기화
  useEffect(() => {
    if (selectedDraft) {
      setChecklistReview(createInitialChecklistReview());
      setReviewComment("");
      setAiResults([]);
      setAiSummary("");
      setAiReviewCompleted(false);
    }
  }, [selectedDraft?.id]);

  // 준법감시인 대시보드에서는 pending(소비자보호부 심사 대기) 상태는 제외
  const filteredDrafts = drafts.filter(d => {
    // pending 상태는 준법감시인 대시보드에서 보여주지 않음
    if (d.status === "pending") return false;
    const statusMatch = filterStatus === "all" || d.status === filterStatus;
    const sectorMatch = filterSector === "all" || d.sector === filterSector;
    return statusMatch && sectorMatch;
  });

  // AI 자동 검토 실행
  const runAIReview = useCallback(async () => {
    if (!selectedDraft || selectedDraft.sector !== "은행") return;
    
    setIsAIReviewing(true);
    try {
      const response = await fetch("/api/agent/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adContent: selectedDraft.content,
          sector: selectedDraft.sector,
        }),
      });
      
      if (!response.ok) {
        throw new Error("AI 검토 실패");
      }
      
      const data = await response.json();
      setAiResults(data.results);
      setAiSummary(data.summary);
      
      // AI 결과를 체크리스트에 자동 반영
      setChecklistReview(prev => ({
        ...prev,
        items: prev.items.map(item => {
          const aiResult = data.results.find((r: AICheckResult) => r.itemId === item.id);
          if (aiResult) {
            return {
              ...item,
              result: aiResult.result as CheckResult,
              comment: aiResult.reason,
            };
          }
          return item;
        }),
      }));
      
      setAiReviewCompleted(true);
    } catch (error) {
      console.error("AI review error:", error);
      alert("AI 자동 검토 중 오류가 발생했습니다.");
    } finally {
      setIsAIReviewing(false);
    }
  }, [selectedDraft]);

  // 은행 그룹사이고 아직 AI 검토가 안됐으면 자동으로 실행
  useEffect(() => {
    if (selectedDraft && selectedDraft.sector === "은행" && (selectedDraft.status === "pending" || selectedDraft.status === "consumer_approved") && !aiReviewCompleted && !isAIReviewing) {
      runAIReview();
    }
  }, [selectedDraft, aiReviewCompleted, isAIReviewing, runAIReview]);

  const handleUpdateChecklistItem = (itemId: string, result: CheckResult, comment: string) => {
    setChecklistReview(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, result, comment } : item
      ),
    }));
  };

  const handleUpdateGeneralComment = (comment: string) => {
    setChecklistReview(prev => ({
      ...prev,
      generalComment: comment,
    }));
  };

  // 사전심사필 번호 생성 함수
  const generateApprovalNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5자리 랜덤 숫자
    const subNum = Math.floor(1 + Math.random() * 9); // 1-9 사이 숫자
    return `준법감시인 사전심사필 제${year}-${randomNum}-${subNum}호`;
  };

  const handleApprove = async () => {
    if (!selectedDraft) return;
    
    // 체크리스트 완료 여부 확인 (은행인 경우)
    if (selectedDraft.sector === "은행" && !checklistSummary.isComplete) {
      alert("모든 체크리스트 항목을 검토해주세요.");
      return;
    }
    
    // 부적정 항목이 있는 경우 경고
    if (checklistSummary.inappropriate > 0) {
      const confirmResult = window.confirm(
        `부적정 항목이 ${checklistSummary.inappropriate}건 있습니다. 그래도 승인하시겠습니까?`
      );
      if (!confirmResult) return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 사전심사필 번호 생성
    const generatedNumber = generateApprovalNumber();
    setApprovalNumber(generatedNumber);
    
    // 체크리스트 결과를 코멘트에 포함
    const checklistNote = selectedDraft.sector === "은행" 
      ? `\n[체크리스트] 적정: ${checklistSummary.appropriate}, 부적정: ${checklistSummary.inappropriate}, 해당없음: ${checklistSummary.notApplicable}`
      : "";
    
    updateDraftStatus(selectedDraft.id, "approved", "준법감시인", (reviewComment || "승인 완료") + checklistNote, generatedNumber);
    setIsProcessing(false);
    setShowApprovalModal(true);
  };
  
  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setApprovalNumber("");
    setSelectedDraft(null);
  };

  const handleReject = async () => {
    if (!selectedDraft || !reviewComment.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }
    
    // 부적정 항목이 있으면 자동으로 포함
    let rejectComment = reviewComment;
    if (checklistSummary.inappropriate > 0) {
      const inappropriateItems = checklistReview.items
        .filter(item => item.result === "부적정")
        .map(item => `- ${item.checkPoint}${item.comment ? `: ${item.comment}` : ""}`)
        .join("\n");
      rejectComment += `\n\n[부적정 항목]\n${inappropriateItems}`;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(selectedDraft.id, "rejected", "준법감시인", rejectComment);
    setIsProcessing(false);
    setSelectedDraft(null);
  };

  const handleRequestRevision = async () => {
    if (!selectedDraft || !reviewComment.trim()) {
      alert("수정 요청 사유를 입력해주세요.");
      return;
    }
    
    // 부적정 항목이 있으면 자동으로 포함
    let revisionComment = reviewComment;
    if (checklistSummary.inappropriate > 0) {
      const inappropriateItems = checklistReview.items
        .filter(item => item.result === "부적정")
        .map(item => `- ${item.checkPoint}${item.comment ? `: ${item.comment}` : ""}`)
        .join("\n");
      revisionComment += `\n\n[수정 필요 항목]\n${inappropriateItems}`;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(selectedDraft.id, "review_requested", "준법감시인", revisionComment);
    setIsProcessing(false);
    setSelectedDraft(null);
  };

  const formatDate = (date: Date) => {
    if (!isClient) return "";
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isBankSector = selectedDraft?.sector === "은행";

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="bg-purple-600 p-2 rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">준법감시인 대시보드</h1>
                <p className="text-sm text-gray-500">기안 문서 검토 및 승인 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <div className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {pendingCount}건 검토 대기
                </div>
              )}
              <div className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                준법감시인
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div 
            className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("consumer_approved")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">검토 대기</p>
                <p className="text-2xl font-bold text-blue-600">
                  {drafts.filter(d => d.status === "consumer_approved").length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div 
            className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("approved")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">승인됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {drafts.filter(d => d.status === "approved").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div 
            className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("rejected")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">반려됨</p>
                <p className="text-2xl font-bold text-red-600">
                  {drafts.filter(d => d.status === "rejected").length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Draft List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  기안 문서 목록
                  <span className="text-sm font-normal text-gray-500">
                    ({filteredDrafts.length}건)
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value as Sector | "all")}
                    className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체 그룹사</option>
                    <option value="은행">은행</option>
                    <option value="카드">카드</option>
                    <option value="증권">증권</option>
                    <option value="라이프">라이프</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as DraftStatus | "all")}
                    className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체 상태</option>
                    <option value="consumer_approved">검토 대기</option>
                    <option value="approved">승인됨</option>
                    <option value="rejected">반려됨</option>
                  </select>
                  {(filterStatus !== "all" || filterSector !== "all") && (
                    <button
                      onClick={() => {
                        setFilterStatus("all");
                        setFilterSector("all");
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredDrafts.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-1">해당 상태의 기안 문서가 없습니다</p>
                    <p className="text-sm">다른 필터를 선택해보세요</p>
                  </div>
                ) : (
                  filteredDrafts.map((draft) => {
                    const status = statusConfig[draft.status];
                    return (
                      <div
                        key={draft.id}
                        onClick={() => setSelectedDraft(draft)}
                        className={`p-4 cursor-pointer hover:bg-purple-50 transition-colors ${
                          selectedDraft?.id === draft.id ? "bg-purple-50 border-l-4 border-purple-500" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {sectorIcons[draft.sector]}
                                {draft.sector}
                              </span>
                              {draft.analysisResult.riskLevel === "High" && (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3" />
                                  고위험
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-800 mb-1 truncate">{draft.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{draft.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>기안자: {draft.createdBy}</span>
                              <span>{formatDate(draft.createdAt)}</span>
                              {draft.analysisResult.violations.length > 0 && (
                                <span className="text-red-500">
                                  위반사항 {draft.analysisResult.violations.length}건
                                </span>
                              )}
                            </div>
                          </div>
                          <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedDraft ? (
              <div className="bg-white rounded-xl shadow-sm border sticky top-6">
                <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">기안 검토</h3>
                      <p className="text-purple-200 text-sm truncate">{selectedDraft.title}</p>
                    </div>
                    {isBankSector && (
                      <div className="flex items-center gap-2">
                        {(selectedDraft.status === "pending" || selectedDraft.status === "consumer_approved") && (
                          <button
                            onClick={runAIReview}
                            disabled={isAIReviewing}
                            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors bg-purple-500 text-white hover:bg-purple-400 disabled:opacity-50"
                          >
                            {isAIReviewing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            {isAIReviewing ? "검토중" : "AI"}
                          </button>
                        )}
                        <button
                          onClick={() => setShowChecklist(!showChecklist)}
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                            showChecklist
                              ? "bg-white text-purple-700"
                              : "bg-purple-500 text-white"
                          }`}
                        >
                          <ClipboardList className="w-3 h-3" />
                          점검표
                          {checklistSummary.inappropriate > 0 && (
                            <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                              {checklistSummary.inappropriate}
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Draft Info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                      {sectorIcons[selectedDraft.sector]}
                      {selectedDraft.sector}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {selectedDraft.createdBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selectedDraft.createdAt)}
                    </span>
                  </div>

                  {/* Ad Image */}
                  {selectedDraft.imageUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        광고 이미지
                      </h4>
                      <div className="bg-gray-50 p-2 rounded border border-gray-200">
                        <img
                          src={selectedDraft.imageUrl}
                          alt="광고 이미지"
                          className="max-w-full max-h-32 mx-auto rounded object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Ad Content */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">광고 내용</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {selectedDraft.content}
                    </div>
                  </div>

                  {/* Corrected Content */}
                  {selectedDraft.correctedContent && selectedDraft.correctedContent !== selectedDraft.content && (
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-1 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        자동 수정본
                      </h4>
                      <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto border border-green-200">
                        {selectedDraft.correctedContent}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">AI 분석</h4>
                    <div className={`p-3 rounded-lg ${
                      selectedDraft.analysisResult.status === "승인" ? "bg-green-100" :
                      selectedDraft.analysisResult.status === "조건부 승인" ? "bg-amber-100" : "bg-red-100"
                    }`}>
                      <p className={`text-sm font-medium ${
                        selectedDraft.analysisResult.status === "승인" ? "text-green-700" :
                        selectedDraft.analysisResult.status === "조건부 승인" ? "text-amber-700" : "text-red-700"
                      }`}>
                        {selectedDraft.analysisResult.status === "승인" ? "✓ 승인 권고" :
                         selectedDraft.analysisResult.status === "조건부 승인" ? "△ 조건부 승인 권고" : "✕ 반려 권고"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        위험도: {selectedDraft.analysisResult.riskLevel === "High" ? "높음" : "낮음"}
                      </p>
                    </div>
                  </div>

                  {/* Violations */}
                  {selectedDraft.analysisResult.violations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        위반사항 ({selectedDraft.analysisResult.violations.length})
                      </h4>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <ul className="text-xs text-red-600 space-y-1">
                          {selectedDraft.analysisResult.violations.slice(0, 3).map((v, i) => (
                            <li key={i}>• {v}</li>
                          ))}
                          {selectedDraft.analysisResult.violations.length > 3 && (
                            <li className="text-red-400">외 {selectedDraft.analysisResult.violations.length - 3}건</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {selectedDraft.analysisResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-600 mb-1">권고사항</h4>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <ul className="text-xs text-blue-600 space-y-1">
                          {selectedDraft.analysisResult.suggestions.slice(0, 3).map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                          {selectedDraft.analysisResult.suggestions.length > 3 && (
                            <li className="text-blue-400">외 {selectedDraft.analysisResult.suggestions.length - 3}건</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Checklist Summary - Bank Sector */}
                  {isBankSector && showChecklist && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">점검표 요약</h4>
                      <div className="flex items-center gap-3 text-xs mb-2">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          적정 {checklistSummary.appropriate}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-3 h-3" />
                          부적정 {checklistSummary.inappropriate}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          해당없음 {checklistSummary.notApplicable}
                        </span>
                      </div>
                      {checklistSummary.inappropriate > 0 && (
                        <div className="p-2 bg-red-50 rounded-lg border border-red-100 max-h-40 overflow-y-auto">
                          <p className="text-xs font-medium text-red-700 mb-1">부적정 항목 ({checklistSummary.inappropriate}건):</p>
                          <ul className="text-xs text-red-600 space-y-1">
                            {checklistReview.items
                              .filter(item => item.result === "부적정")
                              .map((item, i) => (
                                <li key={i} className="flex flex-col">
                                  <span className="font-medium">• {item.checkPoint}</span>
                                  {item.comment && (
                                    <span className="ml-3 text-red-500 text-xs">{item.comment}</span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Previous Review */}
                  {selectedDraft.reviewComment && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-700 mb-1">이전 검토 의견</p>
                      <p className="text-sm text-purple-600 whitespace-pre-wrap">{selectedDraft.reviewComment}</p>
                      {selectedDraft.reviewedBy && (
                        <p className="text-xs text-purple-400 mt-1">- {selectedDraft.reviewedBy}</p>
                      )}
                    </div>
                  )}

                  {/* Review Comment Input - Only for consumer_approved status */}
                  {selectedDraft.status === "consumer_approved" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        검토 의견
                      </h4>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="반려/수정요청 시 필수 입력"
                        className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons - Only for consumer_approved status */}
                {selectedDraft.status === "consumer_approved" ? (
                  <div className="p-4 border-t space-y-2">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      style={{ backgroundColor: isProcessing ? undefined : '#0046ff' }}
                      className="w-full py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center text-sm disabled:opacity-50 shadow-sm"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                      승인
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleRequestRevision}
                        disabled={isProcessing}
                        className="py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center text-xs disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        수정요청
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center justify-center text-xs disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        반려
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t space-y-3">
                    <div className={`py-3 px-4 rounded-lg text-center font-medium flex items-center justify-center gap-2 ${statusConfig[selectedDraft.status].bgColor} ${statusConfig[selectedDraft.status].color}`}>
                      {statusConfig[selectedDraft.status].icon}
                      {statusConfig[selectedDraft.status].label}
                    </div>
                    {/* 승인된 건의 사전심사필 번호 표시 */}
                    {selectedDraft.status === "approved" && selectedDraft.approvalNumber && (
                      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                        <p className="text-xs text-green-600 text-center mb-1">사전심사필 번호</p>
                        <p className="text-sm font-bold text-green-800 text-center break-keep">
                          {selectedDraft.approvalNumber}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">기안 문서를 선택하여</p>
                <p className="text-gray-500">검토를 진행하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>SOLens v1.0 - 준법감시인 모드</p>
        </footer>
      </div>

      {/* 사전심사필 번호 채번 완료 모달 */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white">승인 완료</h2>
              <p className="text-green-100 text-sm mt-1">사전심사필 번호가 채번되었습니다</p>
            </div>
            
            {/* 모달 본문 */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-2">사전심사필 번호</p>
                <p className="text-lg font-bold text-gray-800 text-center break-keep">
                  {approvalNumber}
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 text-center">
                  💡 해당 번호는 광고물에 표기되어야 합니다.
                </p>
              </div>
            </div>
            
            {/* 모달 푸터 */}
            <div className="px-6 pb-6">
              <button
                onClick={handleCloseApprovalModal}
                style={{ backgroundColor: '#0046ff' }}
                className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
