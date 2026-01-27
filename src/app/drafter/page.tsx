"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, FileEdit, Send, CheckCircle } from "lucide-react";
import SectorSelector from "@/components/SectorSelector";
import AdInputForm, { AdFormData } from "@/components/AdInputForm";
import AnalysisResultComponent from "@/components/AnalysisResult";
import ComplianceReport from "@/components/ComplianceReport";
import { useCompliance } from "@/stores/ComplianceContext";
import {
  Sector,
  AnalysisResult,
  REGULATIONS,
  HISTORY_RAG,
} from "@/data/mockData";

type Step = "sector" | "input" | "analysis" | "report" | "submitted";

export default function DrafterPage() {
  const router = useRouter();
  const { addDraft } = useCompliance();
  
  const [currentStep, setCurrentStep] = useState<Step>("sector");
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [adData, setAdData] = useState<AdFormData | null>(null);
  const [submittedDraftId, setSubmittedDraftId] = useState<string | null>(null);

  const handleSectorSelect = (sector: Sector) => {
    setSelectedSector(sector);
  };

  const handleProceedToInput = () => {
    if (selectedSector) {
      setCurrentStep("input");
    }
  };

  const analyzeAd = async (data: AdFormData) => {
    setAdData(data);
    setIsAnalyzing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const regulation = REGULATIONS.find((r) => r.sector === selectedSector);
    const violations: string[] = [];
    const suggestions: string[] = [];
    let matchedHistory = null;

    if (regulation) {
      const contentLower = (data.title + " " + data.content).toLowerCase();
      regulation.keywords.forEach((keyword) => {
        if (contentLower.includes(keyword.toLowerCase())) {
          violations.push(`금지 키워드 발견: "${keyword}"`);
        }
      });

      regulation.required.forEach((req) => {
        if (!data.sectorFields[req] && !contentLower.includes(req.toLowerCase())) {
          suggestions.push(`필수 포함 사항 누락: "${req}"`);
        }
      });

      if (violations.length > 0) {
        suggestions.push(regulation.suggestion);
      }
    }

    const historyMatch = HISTORY_RAG.find((history) => {
      const historyWords = history.content.toLowerCase().split(" ");
      const contentWords = (data.title + " " + data.content).toLowerCase();
      return historyWords.some((word) => word.length > 2 && contentWords.includes(word));
    });

    if (historyMatch && historyMatch.result === "Rejected") {
      matchedHistory = historyMatch;
    }

    let status: AnalysisResult["status"];
    let riskLevel: AnalysisResult["riskLevel"];
    let correctedContent: string | undefined;

    if (violations.length > 0 && matchedHistory) {
      status = "Rejected";
      riskLevel = "High";
    } else if (violations.length > 0) {
      status = "AutoCorrected";
      riskLevel = "Low";
      correctedContent = data.content;
      if (regulation) {
        regulation.keywords.forEach((keyword) => {
          const regex = new RegExp(keyword, "gi");
          correctedContent = correctedContent?.replace(regex, "[수정 필요]");
        });
        correctedContent += `\n\n※ ${regulation.suggestion}`;
      }
    } else if (suggestions.length > 0) {
      status = "AutoCorrected";
      riskLevel = "Low";
      correctedContent = data.content + `\n\n※ ${suggestions.join(", ")}`;
    } else {
      status = "Approved";
      riskLevel = "Low";
    }

    const result: AnalysisResult = {
      status,
      riskLevel,
      violations,
      matchedHistory,
      suggestions,
      correctedContent,
    };

    setAnalysisResult(result);
    setIsAnalyzing(false);
    setCurrentStep("analysis");
  };

  const handleProceedToReport = () => {
    setCurrentStep("report");
  };

  const handleRetry = () => {
    setCurrentStep("input");
    setAnalysisResult(null);
  };

  const handleSubmitDraft = () => {
    if (!adData || !analysisResult || !selectedSector) return;

    const draftId = addDraft({
      title: adData.title,
      content: adData.content,
      correctedContent: analysisResult.correctedContent,
      sector: selectedSector,
      status: "pending",
      analysisResult,
      createdBy: "현재 사용자",
      sectorFields: adData.sectorFields,
    });

    setSubmittedDraftId(draftId);
    setCurrentStep("submitted");
  };

  const handleReset = () => {
    setCurrentStep("sector");
    setSelectedSector(null);
    setAnalysisResult(null);
    setAdData(null);
    setSubmittedDraftId(null);
  };

  const steps = [
    { key: "sector", label: "업종 선택" },
    { key: "input", label: "광고 입력" },
    { key: "analysis", label: "분석 결과" },
    { key: "report", label: "리포트" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileEdit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">광고 심의 기안</h1>
                <p className="text-sm text-gray-500">광고 컴플라이언스 검사 및 기안 제출</p>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
              광고 심의 기안자
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentStep !== "submitted" && (
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    index <= currentStepIndex
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm hidden sm:inline ${
                    index <= currentStepIndex ? "text-blue-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-4 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {currentStep === "sector" && (
            <div className="space-y-6">
              <SectorSelector
                selectedSector={selectedSector}
                onSelectSector={handleSectorSelect}
              />
              {selectedSector && (
                <button
                  onClick={handleProceedToInput}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  다음 단계로
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          )}

          {currentStep === "input" && selectedSector && (
            <AdInputForm
              sector={selectedSector}
              onAnalyze={analyzeAd}
              isAnalyzing={isAnalyzing}
            />
          )}

          {currentStep === "analysis" && analysisResult && adData && (
            <AnalysisResultComponent
              result={analysisResult}
              originalContent={adData.content}
              onProceed={handleProceedToReport}
              onRetry={handleRetry}
            />
          )}

          {currentStep === "report" && analysisResult && selectedSector && adData && (
            <div className="space-y-6">
              <ComplianceReport
                result={analysisResult}
                sector={selectedSector}
                adTitle={adData.title}
                adContent={adData.content}
                onReset={handleReset}
                showDecisionButtons={false}
              />
              
              {/* Submit to Compliance Officer Button */}
              <div className="border-t pt-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    준법감시인에게 기안 제출
                  </h4>
                  <p className="text-sm text-purple-600">
                    이 광고 기안서를 준법감시인에게 제출하여 최종 승인을 요청합니다.
                  </p>
                </div>
                <button
                  onClick={handleSubmitDraft}
                  className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  기안 제출하기
                </button>
              </div>
            </div>
          )}

          {currentStep === "submitted" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">기안이 제출되었습니다</h2>
              <p className="text-gray-600 mb-6">
                준법감시인이 검토 후 승인/반려 결정을 내릴 예정입니다.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                기안 ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{submittedDraftId}</span>
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  새 광고 기안하기
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>Smart Compliance Auditor v2.0 - 광고 심의 기안자 모드</p>
        </footer>
      </div>
    </main>
  );
}
