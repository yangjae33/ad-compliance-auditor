"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Filter,
  Building2,
  CreditCard,
  TrendingUp,
  Shield,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  Send,
} from "lucide-react";
import { useCompliance } from "@/stores/ComplianceContext";
import { DraftDocument, DraftStatus, Sector } from "@/data/mockData";

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
    label: "소비자보호부 승인",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <CheckCircle className="w-4 h-4" />,
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

// 소비자 관점 체크리스트
const consumerChecklist = [
  { id: "clarity", label: "광고 내용이 명확하고 이해하기 쉬운가?", category: "명확성" },
  { id: "misleading", label: "소비자를 오인하게 할 수 있는 표현이 없는가?", category: "오인 가능성" },
  { id: "risk_disclosure", label: "위험 고지가 충분히 되어 있는가?", category: "위험 고지" },
  { id: "terms", label: "이용 조건이 명확히 표시되어 있는가?", category: "조건 명시" },
  { id: "comparison", label: "비교 광고의 경우 공정한 비교인가?", category: "공정성" },
];

export default function ConsumerProtectionPage() {
  const router = useRouter();
  const { drafts, updateDraftStatus } = useCompliance();
  const [selectedDraft, setSelectedDraft] = useState<DraftDocument | null>(null);
  const [filterStatus, setFilterStatus] = useState<DraftStatus | "all">("all");
  const [filterSector, setFilterSector] = useState<Sector | "all">("all");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [consumerFeedback, setConsumerFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hydration 에러 방지를 위해 클라이언트 렌더링 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 선택된 기안이 변경되면 체크리스트 초기화 또는 저장된 값 불러오기
  useEffect(() => {
    if (selectedDraft) {
      if (selectedDraft.consumerChecklist) {
        setCheckedItems(selectedDraft.consumerChecklist as Record<string, boolean>);
      } else {
        setCheckedItems({});
      }
      setConsumerFeedback("");
    }
  }, [selectedDraft]);

  const filteredDrafts = drafts.filter(d => {
    const statusMatch = filterStatus === "all" || d.status === filterStatus;
    const sectorMatch = filterSector === "all" || d.sector === filterSector;
    return statusMatch && sectorMatch;
  });

  const handleCheckItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const complianceScore = Math.round((checkedCount / consumerChecklist.length) * 100);

  const handleApprove = async () => {
    if (!selectedDraft) return;
    
    if (checkedCount < 3) {
      alert("최소 3개 이상의 체크리스트 항목을 확인해주세요.");
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const checklistNote = `\n[소비자보호 체크리스트] ${checkedCount}/${consumerChecklist.length} 항목 충족 (${complianceScore}%)`;
    updateDraftStatus(selectedDraft.id, "consumer_approved", "소비자보호부", (consumerFeedback || "소비자보호 관점 검토 완료") + checklistNote);
    setIsProcessing(false);
    setSelectedDraft(null);
    setCheckedItems({});
    setConsumerFeedback("");
  };

  const handleReject = async () => {
    if (!selectedDraft || !consumerFeedback.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(selectedDraft.id, "rejected", "소비자보호부", consumerFeedback);
    setIsProcessing(false);
    setSelectedDraft(null);
    setCheckedItems({});
    setConsumerFeedback("");
  };

  const handleRequestRevision = async () => {
    if (!selectedDraft || !consumerFeedback.trim()) {
      alert("수정 요청 사유를 입력해주세요.");
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(selectedDraft.id, "review_requested", "소비자보호부", consumerFeedback);
    setIsProcessing(false);
    setSelectedDraft(null);
    setCheckedItems({});
    setConsumerFeedback("");
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100">
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
              <div className="bg-teal-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">소비자보호부 대시보드</h1>
                <p className="text-sm text-gray-500">소비자 보호 내부통제 검토</p>
              </div>
            </div>
            <div className="bg-teal-100 text-teal-700 text-sm font-medium px-3 py-1 rounded-full">
              소비자보호부
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-teal-800">소비자 보호 내부통제 검토 안내</h3>
              <p className="text-sm text-teal-600 mt-1">
                소비자보호부에서는 광고가 소비자에게 명확하고 공정하게 전달되는지 검토합니다.
                체크리스트를 활용하여 소비자 보호 관점의 의견을 제출해주세요.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 기안</p>
                <p className="text-2xl font-bold text-gray-800">{drafts.length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">검토 대기</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {drafts.filter(d => d.status === "pending").length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">승인됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {drafts.filter(d => d.status === "approved").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">반려/수정요청</p>
                <p className="text-2xl font-bold text-red-600">
                  {drafts.filter(d => d.status === "rejected" || d.status === "review_requested").length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <ThumbsDown className="w-6 h-6 text-red-600" />
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
                  광고 기안 목록
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value as Sector | "all")}
                    className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">전체</option>
                    <option value="pending">소비자보호부 검토 대기</option>
                    <option value="consumer_approved">소비자보호부 승인</option>
                    <option value="approved">최종 승인</option>
                    <option value="rejected">반려됨</option>
                    <option value="review_requested">수정 요청</option>
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
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>해당 상태의 기안 문서가 없습니다.</p>
                  </div>
                ) : (
                  filteredDrafts.map((draft) => {
                    const status = statusConfig[draft.status];
                    return (
                      <div
                        key={draft.id}
                        onClick={() => setSelectedDraft(draft)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedDraft?.id === draft.id ? "bg-teal-50 border-l-4 border-teal-500" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {sectorIcons[draft.sector]}
                                {draft.sector}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-1">{draft.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{draft.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span>기안자: {draft.createdBy}</span>
                              <span>{formatDate(draft.createdAt)}</span>
                            </div>
                          </div>
                          <Eye className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
                <div className="p-4 border-b bg-gradient-to-r from-teal-600 to-teal-700 rounded-t-xl">
                  <h3 className="font-semibold text-white">소비자 보호 내부통제 검토</h3>
                  <p className="text-teal-200 text-sm">{selectedDraft.title}</p>
                </div>

                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Ad Title */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      광고 제목
                    </h4>
                    <p className="text-sm text-black bg-gray-50 p-3 rounded font-semibold">
                      {selectedDraft.title}
                    </p>
                  </div>

                  {/* Ad Image */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      광고 이미지
                    </h4>
                    {selectedDraft.imageUrl ? (
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <img
                          src={selectedDraft.imageUrl}
                          alt="광고 이미지"
                          className="max-w-full max-h-48 mx-auto rounded object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
                        <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">등록된 이미지가 없습니다</p>
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">광고 내용</h4>
                    <p className="text-sm text-black font-medium bg-gray-50 p-3 rounded whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200">
                      {selectedDraft.correctedContent || selectedDraft.content}
                    </p>
                  </div>

                  {/* Consumer Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">소비자 보호 체크리스트</h4>
                      <span className={`text-sm font-medium ${
                        complianceScore >= 80 ? "text-green-600" :
                        complianceScore >= 60 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {complianceScore}%
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {consumerChecklist.map((item) => {
                        const isDisabled = selectedDraft.status !== "pending";
                        return (
                          <div
                            key={item.id}
                            onClick={() => !isDisabled && handleCheckItem(item.id)}
                            className={`flex items-start gap-2 p-2 rounded transition-colors ${
                              isDisabled ? "opacity-60" : "cursor-pointer hover:bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checkedItems[item.id] || false}
                              onChange={() => {}}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isDisabled) handleCheckItem(item.id);
                              }}
                              className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                              disabled={isDisabled}
                              readOnly={isDisabled}
                            />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700">{item.label}</span>
                              <span className="block text-xs text-gray-400">{item.category}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Compliance Score Bar */}
                  <div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          complianceScore >= 80 ? "bg-green-500" :
                          complianceScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${complianceScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {checkedCount}/{consumerChecklist.length} 항목 충족
                    </p>
                  </div>

                  {/* Previous Review */}
                  {selectedDraft.reviewComment && (
                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                      <p className="text-xs font-medium text-teal-700 mb-1">이전 검토 의견</p>
                      <p className="text-sm text-teal-600 whitespace-pre-wrap">{selectedDraft.reviewComment}</p>
                      {selectedDraft.reviewedBy && (
                        <p className="text-xs text-teal-400 mt-1">- {selectedDraft.reviewedBy}</p>
                      )}
                    </div>
                  )}

                  {/* Feedback Input - Only for pending status */}
                  {selectedDraft.status === "pending" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        소비자 보호 관점 의견
                      </h4>
                      <textarea
                        value={consumerFeedback}
                        onChange={(e) => setConsumerFeedback(e.target.value)}
                        placeholder="소비자 보호 관점에서의 의견을 작성해주세요..."
                        className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons - Only for pending status */}
                {selectedDraft.status === "pending" ? (
                  <div className="p-4 border-t space-y-2">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      style={{ backgroundColor: isProcessing ? undefined : '#0046ff' }}
                      className="w-full py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center text-sm disabled:opacity-50 shadow-sm"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                      승인 (준법감시인 검토 요청)
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
                  <div className="p-4 border-t">
                    <div className={`py-3 px-4 rounded-lg text-center font-medium flex items-center justify-center gap-2 ${statusConfig[selectedDraft.status].bgColor} ${statusConfig[selectedDraft.status].color}`}>
                      {statusConfig[selectedDraft.status].icon}
                      {statusConfig[selectedDraft.status].label}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">광고 기안을 선택하여</p>
                <p className="text-gray-500">소비자 보호 내부통제 검토를 진행하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>SOLens v1.0 - 소비자보호부 모드</p>
        </footer>
      </div>
    </main>
  );
}
