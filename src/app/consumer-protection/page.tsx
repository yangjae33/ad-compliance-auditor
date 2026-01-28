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
  Filter,
  Building2,
  CreditCard,
  TrendingUp,
  Shield,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useCompliance } from "@/stores/ComplianceContext";
import { DraftStatus, Sector } from "@/data/mockData";

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

export default function ConsumerProtectionPage() {
  const router = useRouter();
  const { drafts, getConsumerProtectionPendingCount } = useCompliance();
  const [filterStatus, setFilterStatus] = useState<DraftStatus | "all">("all");
  const [filterSector, setFilterSector] = useState<Sector | "all">("all");
  const [isClient, setIsClient] = useState(false);

  // Hydration 에러 방지를 위해 클라이언트 렌더링 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 소비자보호부 검토 대기 건수
  const pendingCount = getConsumerProtectionPendingCount();

  const filteredDrafts = drafts.filter(d => {
    const statusMatch = filterStatus === "all" || d.status === filterStatus;
    const sectorMatch = filterSector === "all" || d.sector === filterSector;
    return statusMatch && sectorMatch;
  });

  const handleDraftClick = (draftId: string) => {
    router.push(`/consumer-protection/${draftId}`);
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
        <div className="max-w-5xl mx-auto px-4 py-4">
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
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <div className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {pendingCount}건 검토 대기
                </div>
              )}
              <div className="bg-teal-100 text-teal-700 text-sm font-medium px-3 py-1 rounded-full">
                소비자보호부
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
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
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div 
            className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("pending")}
          >
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
          <div 
            className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("consumer_approved")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">승인됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {drafts.filter(d => d.status === "consumer_approved" || d.status === "approved").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div 
            className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus("rejected")}
          >
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

        {/* Draft List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              광고 기안 목록
              <span className="text-sm font-normal text-gray-500">
                ({filteredDrafts.length}건)
              </span>
            </h2>
            <div className="flex items-center gap-3">
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
                <option value="all">전체 상태</option>
                <option value="pending">검토 대기</option>
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

          <div className="divide-y">
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
                    onClick={() => handleDraftClick(draft.id)}
                    className="p-4 cursor-pointer hover:bg-teal-50 transition-colors group"
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
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                    </div>
                  </div>
                );
              })
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


