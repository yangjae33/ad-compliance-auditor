"use client";

import { useRouter } from "next/navigation";
import { Shield, FileEdit, Scale, Users, ArrowRight, Bell } from "lucide-react";
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
  const { setCurrentPersona, getPendingDraftsCount } = useCompliance();
  const pendingCount = getPendingDraftsCount();

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
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/25 mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Smart Compliance Auditor
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            AI 기반 금융 광고 컴플라이언스 검사 시스템
          </p>
          <p className="text-sm text-slate-500 mt-2">
            역할을 선택하여 시작하세요
          </p>
        </header>

        {/* Persona Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PERSONAS.map((persona) => {
            const colors = personaColors[persona.type];
            const isPendingVisible = persona.type === "compliance_officer" && pendingCount > 0;
            
            return (
              <button
                key={persona.type}
                onClick={() => handleSelectPersona(persona.type)}
                className={`relative group p-8 rounded-2xl border-2 ${colors.bg} ${colors.border} transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl text-left`}
              >
                {/* Notification Badge for Compliance Officer */}
                {isPendingVisible && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    <Bell className="w-3 h-3" />
                    {pendingCount}
                  </div>
                )}

                <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.iconBg} rounded-xl text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {personaIcons[persona.type]}
                </div>
                
                <h2 className={`text-xl font-bold ${colors.text} mb-2`}>
                  {persona.label}
                </h2>
                
                <p className="text-slate-600 text-sm mb-4">
                  {persona.description}
                </p>

                <div className={`inline-flex items-center text-sm font-medium ${colors.text} group-hover:gap-2 transition-all`}>
                  시작하기
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">시스템 워크플로우</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-slate-300">광고 심의 기안자</p>
                <p className="text-slate-500 mt-1">광고 내용을 입력하고 AI 분석을 통해 컴플라이언스 검사를 진행합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-slate-300">준법감시인</p>
                <p className="text-slate-500 mt-1">기안된 문서를 검토하고 최종 승인 또는 반려 결정을 내립니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-slate-300">소비자보호부</p>
                <p className="text-slate-500 mt-1">소비자 관점에서 광고를 검토하고 의견을 제시합니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-slate-500 mt-12">
          <p>Smart Compliance Auditor v2.0 - Multi-Persona System</p>
          <p className="mt-1">AI Agent 기반 금융 광고 심의 자동화 플랫폼</p>
        </footer>
      </div>
    </main>
  );
}
