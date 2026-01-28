"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Users,
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
  MessageSquare,
  Image as ImageIcon,
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

export default function ConsumerProtectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;
  
  const { getDraftById, updateDraftStatus } = useCompliance();
  const [draft, setDraft] = useState<DraftDocument | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [consumerFeedback, setConsumerFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const foundDraft = getDraftById(draftId);
    if (foundDraft) {
      setDraft(foundDraft);
      // 이미 저장된 체크리스트 정보가 있으면 불러오기
      if (foundDraft.consumerChecklist) {
        setCheckedItems(foundDraft.consumerChecklist as Record<string, boolean>);
      }
    }
  }, [draftId, getDraftById]);

  const handleCheckItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const complianceScore = Math.round((checkedCount / consumerChecklist.length) * 100);

  const handleApprove = async () => {
    if (!draft) return;
    
    if (checkedCount < 3) {
      alert("최소 3개 이상의 체크리스트 항목을 확인해주세요.");
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const checklistNote = `\n[소비자보호 체크리스트] ${checkedCount}/${consumerChecklist.length} 항목 충족 (${complianceScore}%)`;
    updateDraftStatus(draft.id, "consumer_approved", "소비자보호부", (consumerFeedback || "소비자보호 관점 검토 완료") + checklistNote);
    setIsProcessing(false);
    router.push("/consumer-protection");
  };

  const handleReject = async () => {
    if (!draft || !consumerFeedback.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(draft.id, "rejected", "소비자보호부", consumerFeedback);
    setIsProcessing(false);
    router.push("/consumer-protection");
  };

  const handleRequestRevision = async () => {
    if (!draft || !consumerFeedback.trim()) {
      alert("수정 요청 사유를 입력해주세요.");
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(draft.id, "review_requested", "소비자보호부", consumerFeedback);
    setIsProcessing(false);
    router.push("/consumer-protection");
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
      <main className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">기안 문서를 찾을 수 없습니다</p>
          <button
            onClick={() => router.push("/consumer-protection")}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            목록으로
          </button>
        </div>
      </main>
    );
  }

  const status = statusConfig[draft.status];

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/consumer-protection")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-gray-800">소비자 보호 내부통제 검토</span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.bgColor} ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
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
              {/* Ad Image */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  광고 이미지
                </h3>
                {draft.imageUrl ? (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <img
                      src={draft.imageUrl}
                      alt="광고 이미지"
                      className="max-w-full max-h-64 mx-auto rounded object-contain"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                    <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">등록된 이미지가 없습니다</p>
                  </div>
                )}
              </div>

              {/* Ad Content */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">광고 내용</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-black font-medium whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200">
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

              {/* AI Analysis Summary */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">AI 분석 결과</h3>
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
                    {draft.analysisResult.violations.length > 0 && ` | 위반사항: ${draft.analysisResult.violations.length}건`}
                  </p>
                </div>
              </div>

              {/* Violations */}
              {draft.analysisResult.violations.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    위반사항 ({draft.analysisResult.violations.length})
                  </h3>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <ul className="text-xs text-red-600 space-y-1">
                      {draft.analysisResult.violations.map((v, i) => (
                        <li key={i}>• {v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Checklist & Actions */}
            <div className="md:col-span-2 p-4 bg-gray-50/50">
              {/* Consumer Checklist */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">소비자 보호 체크리스트</h3>
                  <span className={`text-sm font-medium ${
                    complianceScore >= 80 ? "text-green-600" :
                    complianceScore >= 60 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {complianceScore}%
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 space-y-2 border border-gray-200">
                  {consumerChecklist.map((item) => {
                    const isDisabled = draft.status !== "pending";
                    return (
                      <div
                        key={item.id}
                        onClick={() => !isDisabled && handleCheckItem(item.id)}
                        className={`flex items-start gap-2 p-2 rounded transition-colors ${
                          isDisabled ? "opacity-60" : "cursor-pointer hover:bg-gray-50"
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
                
                {/* Progress Bar */}
                <div className="mt-3">
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
              </div>

              {/* Previous Review */}
              {draft.reviewComment && (
                <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <p className="text-xs font-medium text-teal-700 mb-1">이전 검토 의견</p>
                  <p className="text-sm text-teal-600">{draft.reviewComment}</p>
                  <p className="text-xs text-teal-400 mt-1">- {draft.reviewedBy}</p>
                </div>
              )}

              {/* Review Actions */}
              {draft.status === "pending" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      소비자 관점 의견
                    </label>
                    <textarea
                      value={consumerFeedback}
                      onChange={(e) => setConsumerFeedback(e.target.value)}
                      placeholder="소비자 보호 관점에서의 의견을 작성해주세요..."
                      className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    style={{ backgroundColor: isProcessing ? undefined : '#0046ff' }}
                    className="w-full py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center text-sm disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                    승인 (준법감시인 검토 요청)
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
    </main>
  );
}
