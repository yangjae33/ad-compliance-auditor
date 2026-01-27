"use client";

import { useState } from "react";
import { Shield, ArrowRight } from "lucide-react";
import SectorSelector from "@/components/SectorSelector";
import AdInputForm, { AdFormData } from "@/components/AdInputForm";
import AnalysisResultComponent from "@/components/AnalysisResult";
import ComplianceReport from "@/components/ComplianceReport";
import {
  Sector,
  AnalysisResult,
  REGULATIONS,
  HISTORY_RAG,
} from "@/data/mockData";

type Step = "sector" | "input" | "analysis" | "report";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("sector");
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [adData, setAdData] = useState<AdFormData | null>(null);

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

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const regulation = REGULATIONS.find((r) => r.sector === selectedSector);
    const violations: string[] = [];
    const suggestions: string[] = [];
    let matchedHistory = null;

    // Check 1: Keyword detection
    if (regulation) {
      const contentLower = (data.title + " " + data.content).toLowerCase();
      regulation.keywords.forEach((keyword) => {
        if (contentLower.includes(keyword.toLowerCase())) {
          violations.push(`금지 키워드 발견: "${keyword}"`);
        }
      });

      // Check required fields
      regulation.required.forEach((req) => {
        if (!data.sectorFields[req] && !contentLower.includes(req.toLowerCase())) {
          suggestions.push(`필수 포함 사항 누락: "${req}"`);
        }
      });

      if (violations.length > 0) {
        suggestions.push(regulation.suggestion);
      }
    }

    // Check 2: History RAG matching
    const historyMatch = HISTORY_RAG.find((history) => {
      const historyWords = history.content.toLowerCase().split(" ");
      const contentWords = (data.title + " " + data.content).toLowerCase();
      return historyWords.some((word) => word.length > 2 && contentWords.includes(word));
    });

    if (historyMatch && historyMatch.result === "Rejected") {
      matchedHistory = historyMatch;
    }

    // Determine status
    let status: AnalysisResult["status"];
    let riskLevel: AnalysisResult["riskLevel"];
    let correctedContent: string | undefined;

    if (violations.length > 0 && matchedHistory) {
      status = "Rejected";
      riskLevel = "High";
    } else if (violations.length > 0) {
      status = "AutoCorrected";
      riskLevel = "Low";
      // Generate auto-corrected content
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

  const handleReset = () => {
    setCurrentStep("sector");
    setSelectedSector(null);
    setAnalysisResult(null);
    setAdData(null);
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
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Smart Compliance Auditor</h1>
              <p className="text-sm text-gray-500">AI 기반 금융 광고 컴플라이언스 검사 시스템</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
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
            <ComplianceReport
              result={analysisResult}
              sector={selectedSector}
              adTitle={adData.title}
              adContent={adData.content}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>Smart Compliance Auditor v1.0 - AI Agent Prototype</p>
          <p className="mt-1">Mock data 및 시뮬레이션 기반 데모 버전</p>
        </footer>
      </div>
    </main>
  );
}
