"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  CreditCard,
  TrendingUp,
  Shield,
  Send,
  RefreshCw,
  FileText,
  User,
  Calendar,
  ClipboardList,
  Sparkles,
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
  은행: <Building2 className="w-4 h-4" />,
  카드: <CreditCard className="w-4 h-4" />,
  증권: <TrendingUp className="w-4 h-4" />,
  라이프: <Shield className="w-4 h-4" />,
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
    label: "승인됨",
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

export default function DraftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;
  
  const { getDraftById, updateDraftStatus } = useCompliance();
  const [draft, setDraft] = useState<DraftDocument | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);
  const [checklistReview, setChecklistReview] = useState<ChecklistReview>(createInitialChecklistReview());
  
  // AI 자동 검토 관련 상태
  const [aiResults, setAiResults] = useState<AICheckResult[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isAIReviewing, setIsAIReviewing] = useState(false);
  const [aiReviewCompleted, setAiReviewCompleted] = useState(false);

  const checklistSummary = useMemo(() => getChecklistSummary(checklistReview), [checklistReview]);

  useEffect(() => {
    const foundDraft = getDraftById(draftId);
    if (foundDraft) {
      setDraft(foundDraft);
    }
  }, [draftId, getDraftById]);

  // AI 자동 검토 실행
  const runAIReview = useCallback(async () => {
    if (!draft || draft.sector !== "은행") return;
    
    setIsAIReviewing(true);
    try {
      const response = await fetch("/api/agent/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adContent: draft.content,
          sector: draft.sector,
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
  }, [draft]);

  // 은행 그룹사이고 아직 AI 검토가 안됐으면 자동으로 실행
  useEffect(() => {
    if (draft && draft.sector === "은행" && (draft.status === "pending" || draft.status === "consumer_approved") && !aiReviewCompleted && !isAIReviewing) {
      runAIReview();
    }
  }, [draft, aiReviewCompleted, isAIReviewing, runAIReview]);

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

  const handleApprove = async () => {
    if (!draft) return;
    
    // 체크리스트 완료 여부 확인 (은행인 경우)
    if (draft.sector === "은행" && !checklistSummary.isComplete) {
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
    
    // 체크리스트 결과를 코멘트에 포함
    const checklistNote = draft.sector === "은행" 
      ? `\n[체크리스트] 적정: ${checklistSummary.appropriate}, 부적정: ${checklistSummary.inappropriate}, 해당없음: ${checklistSummary.notApplicable}`
      : "";
    
    updateDraftStatus(draft.id, "approved", "준법감시인", (reviewComment || "승인 완료") + checklistNote);
    setIsProcessing(false);
    router.push("/compliance-officer");
  };

  const handleReject = async () => {
    if (!draft || !reviewComment.trim()) {
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
    updateDraftStatus(draft.id, "rejected", "준법감시인", rejectComment);
    setIsProcessing(false);
    router.push("/compliance-officer");
  };

  const handleRequestRevision = async () => {
    if (!draft || !reviewComment.trim()) {
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
    updateDraftStatus(draft.id, "review_requested", "준법감시인", revisionComment);
    setIsProcessing(false);
    router.push("/compliance-officer");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!draft) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">기안 문서를 찾을 수 없습니다</p>
          <button
            onClick={() => router.push("/compliance-officer")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            목록으로
          </button>
        </div>
      </main>
    );
  }

  const status = statusConfig[draft.status];
  const isBankSector = draft.sector === "은행";

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b">
        <div className={`${isBankSector ? "max-w-7xl" : "max-w-4xl"} mx-auto px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/compliance-officer")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-800">기안 검토</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isBankSector && (
                <div className="flex items-center gap-2">
                  {/* AI 재검토 버튼 */}
                  {(draft.status === "pending" || draft.status === "consumer_approved") && (
                    <button
                      onClick={runAIReview}
                      disabled={isAIReviewing}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200 disabled:opacity-50"
                    >
                      {isAIReviewing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {isAIReviewing ? "검토중..." : "AI 재검토"}
                    </button>
                  )}
                  <button
                    onClick={() => setShowChecklist(!showChecklist)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      showChecklist
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    점검표
                    {checklistSummary.inappropriate > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {checklistSummary.inappropriate}
                      </span>
                    )}
                  </button>
                </div>
              )}
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                {status.icon}
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className={`${isBankSector ? "max-w-7xl" : "max-w-4xl"} mx-auto px-4 py-4`}>
        <div className="flex gap-4">
          {/* Checklist Panel - Left Side (Bank only) */}
          {isBankSector && showChecklist && (
            <div className="w-96 flex-shrink-0">
              <div className="sticky top-4 h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
                <ChecklistPanel
                  review={checklistReview}
                  onUpdateItem={handleUpdateChecklistItem}
                  onUpdateGeneralComment={handleUpdateGeneralComment}
                  aiResults={aiResults}
                  aiSummary={aiSummary}
                  isAIReviewing={isAIReviewing}
                  readOnly={draft.status !== "pending" && draft.status !== "consumer_approved"}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Title Section */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-gray-800 mb-1">{draft.title}</h1>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border">
                        {sectorIcons[draft.sector]}
                        {draft.sector}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {draft.createdBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(draft.createdAt)}
                      </span>
                    </div>
                  </div>
                  {draft.analysisResult.riskLevel === "High" && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                      <AlertTriangle className="w-3 h-3" />
                      고위험
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x">
                {/* Left: Content */}
                <div className="md:col-span-3 p-4 space-y-4">
                  {/* Ad Content */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">광고 내용</h3>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {draft.content}
                    </div>
                  </div>

                  {/* Corrected Content */}
                  {draft.correctedContent && draft.correctedContent !== draft.content && (
                    <div>
                      <h3 className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        자동 수정본
                      </h3>
                      <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto border border-green-200">
                        {draft.correctedContent}
                      </div>
                    </div>
                  )}

                  {/* Violations */}
                  {draft.analysisResult.violations.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        위반사항 ({draft.analysisResult.violations.length})
                      </h3>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <ul className="text-xs text-red-600 space-y-1">
                          {draft.analysisResult.violations.slice(0, 5).map((v, i) => (
                            <li key={i}>• {v}</li>
                          ))}
                          {draft.analysisResult.violations.length > 5 && (
                            <li className="text-red-400">외 {draft.analysisResult.violations.length - 5}건</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {draft.analysisResult.suggestions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">권고사항</h3>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <ul className="text-xs text-blue-600 space-y-1">
                          {draft.analysisResult.suggestions.slice(0, 5).map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                          {draft.analysisResult.suggestions.length > 5 && (
                            <li className="text-blue-400">외 {draft.analysisResult.suggestions.length - 5}건</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Checklist Summary - Bank Sector */}
                  {isBankSector && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">점검표 요약</h3>
                      <div className="flex items-center gap-4 text-xs">
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
                        <span className="flex items-center gap-1 text-yellow-600">
                          미검토 {checklistSummary.total - checklistSummary.checked}
                        </span>
                      </div>
                      {checklistSummary.inappropriate > 0 && (
                        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-xs font-medium text-red-700 mb-1">부적정 항목:</p>
                          <ul className="text-xs text-red-600 space-y-0.5">
                            {checklistReview.items
                              .filter(item => item.result === "부적정")
                              .slice(0, 3)
                              .map((item, i) => (
                                <li key={i} className="truncate">• {item.checkPoint}</li>
                              ))}
                            {checklistReview.items.filter(item => item.result === "부적정").length > 3 && (
                              <li className="text-red-400">
                                외 {checklistReview.items.filter(item => item.result === "부적정").length - 3}건
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Original Checklist for non-Bank sectors */}
                  {!isBankSector && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">체크리스트</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(draft.sectorFields).map(([field, checked]) => (
                          <span
                            key={field}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              checked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {checked ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: AI Result & Actions */}
                <div className="md:col-span-2 p-4 bg-gray-50/50">
                  {/* AI Analysis Summary */}
                  <div className="mb-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">AI 분석</h3>
                    <div className={`p-3 rounded-lg ${
                      draft.analysisResult.status === "승인" ? "bg-green-100" :
                      draft.analysisResult.status === "조건부 승인" ? "bg-amber-100" : "bg-red-100"
                    }`}>
                      <p className={`text-sm font-medium ${
                        draft.analysisResult.status === "승인" ? "text-green-700" :
                        draft.analysisResult.status === "조건부 승인" ? "text-amber-700" : "text-red-700"
                      }`}>
                        {draft.analysisResult.status === "승인" ? "✓ 승인 권고" :
                         draft.analysisResult.status === "조건부 승인" ? "△ 조건부 승인 권고" : "✕ 반려 권고"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        위험도: {draft.analysisResult.riskLevel === "High" ? "높음" : "낮음"}
                      </p>
                    </div>
                  </div>

                  {/* Previous Review */}
                  {draft.reviewComment && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-700 mb-1">검토 의견</p>
                      <p className="text-sm text-purple-600">{draft.reviewComment}</p>
                      <p className="text-xs text-purple-400 mt-1">- {draft.reviewedBy}</p>
                    </div>
                  )}

                  {/* Review Actions */}
                  {(draft.status === "pending" || draft.status === "consumer_approved") ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          검토 의견
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="반려/수정요청 시 필수 입력"
                          className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg p-2 h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        style={{ backgroundColor: isProcessing ? undefined : '#0046ff' }}
                        className="w-full py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center text-sm disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        {isProcessing ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                        승인
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleRequestRevision}
                          disabled={isProcessing}
                          className="py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center text-xs disabled:opacity-50 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          수정요청
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={isProcessing}
                          className="py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center justify-center text-xs disabled:opacity-50 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          반려
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${status.bgColor} ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
