"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Filter,
  RefreshCw,
  Building2,
  CreditCard,
  TrendingUp,
  Shield,
  Send,
  MessageSquare,
} from "lucide-react";
import { useCompliance } from "@/stores/ComplianceContext";
import { DraftDocument, DraftStatus, Sector } from "@/data/mockData";

const sectorIcons: Record<Sector, React.ReactNode> = {
  Bank: <Building2 className="w-4 h-4" />,
  Card: <CreditCard className="w-4 h-4" />,
  Investment: <TrendingUp className="w-4 h-4" />,
  Insurance: <Shield className="w-4 h-4" />,
};

const sectorLabels: Record<Sector, string> = {
  Bank: "은행",
  Card: "카드",
  Investment: "투자",
  Insurance: "보험",
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

export default function ComplianceOfficerPage() {
  const router = useRouter();
  const { drafts, updateDraftStatus, getPendingDraftsCount } = useCompliance();
  const [selectedDraft, setSelectedDraft] = useState<DraftDocument | null>(null);
  const [filterStatus, setFilterStatus] = useState<DraftStatus | "all">("all");
  const [reviewComment, setReviewComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingCount = getPendingDraftsCount();

  const filteredDrafts = filterStatus === "all" 
    ? drafts 
    : drafts.filter(d => d.status === filterStatus);

  const handleApprove = async () => {
    if (!selectedDraft) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(selectedDraft.id, "approved", "준법감시인", reviewComment || "승인 완료");
    setIsProcessing(false);
    setSelectedDraft(null);
    setReviewComment("");
  };

  const handleReject = async () => {
    if (!selectedDraft || !reviewComment.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(selectedDraft.id, "rejected", "준법감시인", reviewComment);
    setIsProcessing(false);
    setSelectedDraft(null);
    setReviewComment("");
  };

  const handleRequestRevision = async () => {
    if (!selectedDraft || !reviewComment.trim()) {
      alert("수정 요청 사유를 입력해주세요.");
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateDraftStatus(selectedDraft.id, "review_requested", "준법감시인", reviewComment);
    setIsProcessing(false);
    setSelectedDraft(null);
    setReviewComment("");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
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
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">수정 요청</p>
                <p className="text-2xl font-bold text-orange-600">
                  {drafts.filter(d => d.status === "review_requested").length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
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
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as DraftStatus | "all")}
                    className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">전체</option>
                    <option value="pending">검토 대기</option>
                    <option value="approved">승인됨</option>
                    <option value="rejected">반려됨</option>
                    <option value="review_requested">수정 요청</option>
                  </select>
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
                          selectedDraft?.id === draft.id ? "bg-purple-50 border-l-4 border-purple-500" : ""
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
                                {sectorLabels[draft.sector]}
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
                <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl">
                  <h3 className="font-semibold text-white">기안 상세 정보</h3>
                  <p className="text-purple-200 text-sm">ID: {selectedDraft.id}</p>
                </div>

                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${statusConfig[selectedDraft.status].bgColor} ${statusConfig[selectedDraft.status].color}`}>
                      {statusConfig[selectedDraft.status].icon}
                      {statusConfig[selectedDraft.status].label}
                    </span>
                  </div>

                  {/* AI Analysis Result */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">AI 분석 결과</h4>
                    <div className={`text-sm font-medium ${
                      selectedDraft.analysisResult.status === "Approved" ? "text-green-600" :
                      selectedDraft.analysisResult.status === "AutoCorrected" ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {selectedDraft.analysisResult.status === "Approved" ? "승인 권고" :
                       selectedDraft.analysisResult.status === "AutoCorrected" ? "조건부 승인 (자동 수정됨)" : "거부 권고"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      위험 수준: {selectedDraft.analysisResult.riskLevel === "High" ? "높음" : "낮음"}
                    </div>
                  </div>

                  {/* Violations */}
                  {selectedDraft.analysisResult.violations.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        발견된 위반 사항
                      </h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {selectedDraft.analysisResult.violations.map((v, i) => (
                          <li key={i}>• {v}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Title & Content */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">광고 제목</h4>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedDraft.title}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">광고 내용</h4>
                    <p className="text-sm bg-gray-50 p-2 rounded whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {selectedDraft.correctedContent || selectedDraft.content}
                    </p>
                  </div>

                  {/* Review Comment Input */}
                  {selectedDraft.status === "pending" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        검토 의견
                      </h4>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="검토 의견을 입력하세요 (반려/수정요청 시 필수)"
                        className="w-full text-sm border rounded-lg p-2 h-20 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Previous Review Comment */}
                  {selectedDraft.reviewComment && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-purple-700 mb-1">검토 의견</h4>
                      <p className="text-sm text-purple-600">{selectedDraft.reviewComment}</p>
                      <p className="text-xs text-purple-400 mt-1">검토자: {selectedDraft.reviewedBy}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedDraft.status === "pending" && (
                  <div className="p-4 border-t space-y-2">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      승인
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleRequestRevision}
                        disabled={isProcessing}
                        className="py-2.5 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        수정 요청
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        반려
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">기안 문서를 선택하여</p>
                <p className="text-gray-500">상세 정보를 확인하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>Smart Compliance Auditor v2.0 - 준법감시인 모드</p>
        </footer>
      </div>
    </main>
  );
}
