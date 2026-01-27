"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useCompliance } from "@/stores/ComplianceContext";
import { DraftDocument, DraftStatus, Sector } from "@/data/mockData";

const sectorIcons: Record<Sector, React.ReactNode> = {
  은행: <Building2 className="w-4 h-4" />,
  카드: <CreditCard className="w-4 h-4" />,
  투자: <TrendingUp className="w-4 h-4" />,
  보험: <Shield className="w-4 h-4" />,
};

const statusConfig: Record<DraftStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: "검토 대기",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
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

  useEffect(() => {
    const foundDraft = getDraftById(draftId);
    if (foundDraft) {
      setDraft(foundDraft);
    }
  }, [draftId, getDraftById]);

  const handleApprove = async () => {
    if (!draft) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(draft.id, "approved", "준법감시인", reviewComment || "승인 완료");
    setIsProcessing(false);
    router.push("/compliance-officer");
  };

  const handleReject = async () => {
    if (!draft || !reviewComment.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(draft.id, "rejected", "준법감시인", reviewComment);
    setIsProcessing(false);
    router.push("/compliance-officer");
  };

  const handleRequestRevision = async () => {
    if (!draft || !reviewComment.trim()) {
      alert("수정 요청 사유를 입력해주세요.");
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(draft.id, "review_requested", "준법감시인", reviewComment);
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
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
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.bgColor} ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
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

              {/* Violations & Suggestions */}
              {(draft.analysisResult.violations.length > 0 || draft.analysisResult.suggestions.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {draft.analysisResult.violations.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <h4 className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        위반사항 ({draft.analysisResult.violations.length})
                      </h4>
                      <ul className="text-xs text-red-600 space-y-1">
                        {draft.analysisResult.violations.slice(0, 3).map((v, i) => (
                          <li key={i} className="truncate">• {v}</li>
                        ))}
                        {draft.analysisResult.violations.length > 3 && (
                          <li className="text-red-400">외 {draft.analysisResult.violations.length - 3}건</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {draft.analysisResult.suggestions.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <h4 className="text-xs font-medium text-blue-700 mb-2">권고사항</h4>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {draft.analysisResult.suggestions.slice(0, 3).map((s, i) => (
                          <li key={i} className="truncate">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Checklist Summary */}
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
            </div>

            {/* Right: AI Result & Actions */}
            <div className="md:col-span-2 p-4 bg-gray-50/50">
              {/* AI Analysis Summary */}
              <div className="mb-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">AI 분석</h3>
                <div className={`p-3 rounded-lg ${
                  draft.analysisResult.status === "Approved" ? "bg-green-100" :
                  draft.analysisResult.status === "AutoCorrected" ? "bg-yellow-100" : "bg-red-100"
                }`}>
                  <p className={`text-sm font-medium ${
                    draft.analysisResult.status === "Approved" ? "text-green-700" :
                    draft.analysisResult.status === "AutoCorrected" ? "text-yellow-700" : "text-red-700"
                  }`}>
                    {draft.analysisResult.status === "Approved" ? "✓ 승인 권고" :
                     draft.analysisResult.status === "AutoCorrected" ? "△ 조건부 승인" : "✕ 거부 권고"}
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
              {draft.status === "pending" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                      검토 의견
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="반려/수정요청 시 필수 입력"
                      className="w-full text-sm border rounded-lg p-2 h-20 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                    승인
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRequestRevision}
                      disabled={isProcessing}
                      className="py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center text-xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      수정요청
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center text-xs disabled:opacity-50"
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
