"use client";

import { useRouter } from "next/navigation";
import { Eye, FileEdit, Scale, Users, ArrowRight, Bell } from "lucide-react";
import { useCompliance } from "@/stores/ComplianceContext";
import { PERSONAS, PersonaType } from "@/data/mockData";

const personaIcons: Record<PersonaType, React.ReactNode> = {
  drafter: <FileEdit className="w-8 h-8" />,
  compliance_officer: <Scale className="w-8 h-8" />,
  consumer_protection: <Users className="w-8 h-8" />,
};

const personaColors: Record<PersonaType, { bg: string; border: string; text: string; iconBg: string }> = {
  drafter: {
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200 hover:border-blue-400",
    text: "text-blue-700",
    iconBg: "bg-blue-500",
  },
  compliance_officer: {
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-200 hover:border-purple-400",
    text: "text-purple-700",
    iconBg: "bg-purple-500",
  },
  consumer_protection: {
    bg: "bg-teal-50 hover:bg-teal-100",
    border: "border-teal-200 hover:border-teal-400",
    text: "text-teal-700",
    iconBg: "bg-teal-500",
  },
};

const personaRoutes: Record<PersonaType, string> = {
  drafter: "/drafter",
  compliance_officer: "/compliance-officer",
  consumer_protection: "/consumer-protection",
};

export default function Home() {
  const router = useRouter();
  const { setCurrentPersona, getConsumerProtectionPendingCount, getComplianceOfficerPendingCount } = useCompliance();
  const consumerProtectionCount = getConsumerProtectionPendingCount();
  const complianceOfficerCount = getComplianceOfficerPendingCount();

  const handleSelectPersona = (personaType: PersonaType) => {
    setCurrentPersona(personaType);
    router.push(personaRoutes[personaType]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-500/25 mb-4 sm:mb-6">
            <Eye className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4 tracking-tight">
            SOLens
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            AI 기반 금융 광고 컴플라이언스 검사 시스템
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            역할을 선택하여 시작하세요
          </p>
        </header>

        {/* Persona Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {PERSONAS.map((persona) => {
            const colors = personaColors[persona.type];
            // 소비자보호부: pending 상태 건수 표시
            const isConsumerProtectionPending = persona.type === "consumer_protection" && consumerProtectionCount > 0;
            // 준법감시인: consumer_approved 상태 건수 표시
            const isComplianceOfficerPending = persona.type === "compliance_officer" && complianceOfficerCount > 0;
            const notificationCount = isConsumerProtectionPending ? consumerProtectionCount : isComplianceOfficerPending ? complianceOfficerCount : 0;
            
            return (
              <button
                key={persona.type}
                onClick={() => handleSelectPersona(persona.type)}
                className={`relative group p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 ${colors.bg} ${colors.border} transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl text-left`}
              >
                {/* Notification Badge */}
                {(isConsumerProtectionPending || isComplianceOfficerPending) && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    <Bell className="w-3 h-3" />
                    {notificationCount}
                  </div>
                )}

                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${colors.iconBg} rounded-lg sm:rounded-xl text-white mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {personaIcons[persona.type]}
                </div>
                
                <h2 className={`text-base sm:text-lg md:text-xl font-bold ${colors.text} mb-1 sm:mb-2`}>
                  {persona.label}
                </h2>
                
                <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  {persona.description}
                </p>

                <div className={`inline-flex items-center text-xs sm:text-sm font-medium ${colors.text} group-hover:gap-2 transition-all`}>
                  시작하기
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-700">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4">시스템 워크플로우</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xs sm:text-sm">
                1
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-300 text-xs sm:text-sm">광고 심의 기안자</p>
                <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">광고 내용을 입력하고 AI 분석을 통해 컴플라이언스 검사를 진행합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold text-xs sm:text-sm">
                2
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-300 text-xs sm:text-sm">소비자보호부</p>
                <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">소비자 보호 내부통제 관점에서 광고를 검토하고 1차 승인 결정을 내립니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-xs sm:text-sm">
                3
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-300 text-xs sm:text-sm">준법감시인</p>
                <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">소비자보호부 승인 후 최종 승인 또는 반려 결정을 내립니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs sm:text-sm text-slate-500 mt-8 sm:mt-12">
          <p>SOLens v1.0 - Multi-Persona System</p>
          <p className="mt-1">AI Agent 기반 금융 광고 심의 자동화 플랫폼</p>
        </footer>
      </div>
    </main>
  );
}
