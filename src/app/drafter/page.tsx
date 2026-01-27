"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, FileEdit, Send, CheckCircle, BookOpen } from "lucide-react";
import SectorSelector from "@/components/SectorSelector";
import AdInputForm, { AdFormData } from "@/components/AdInputForm";
import AnalysisResultComponent from "@/components/AnalysisResult";
import ComplianceReport from "@/components/ComplianceReport";
import SectorGuidelinePanel from "@/components/SectorGuidelinePanel";
import { useCompliance } from "@/stores/ComplianceContext";
import {
  Sector,
  AnalysisResult,
  REGULATIONS,
  HISTORY_RAG,
  SECTOR_GUIDELINES,
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
  const [showGuideline, setShowGuideline] = useState(false);

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
    const guideline = selectedSector ? SECTOR_GUIDELINES[selectedSector] : null;
    const violations: string[] = [];
    const suggestions: string[] = [];
    let matchedHistory = null;

    const fullContent = (data.title + " " + data.content);
    const contentLower = fullContent.toLowerCase();

    // 기존 규정 기반 검사
    if (regulation) {
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

    // 업종별 가이드라인 기반 금지 표현 검사
    if (guideline) {
      guideline.prohibitedExpressions.forEach((expr) => {
        try {
          const regex = new RegExp(expr.pattern, "gi");
          const match = fullContent.match(regex);
          if (match) {
            violations.push(`금지 표현 발견: "${match[0]}" - ${expr.description}`);
            suggestions.push(`💡 권장: ${expr.suggestion}`);
          }
        } catch (e) {
          // 정규식 오류 시 단순 문자열 검색
          const simplePattern = expr.pattern.replace(/\\/g, "").replace(/\./g, "").replace(/\{.*?\}/g, "").replace(/\|/g, " ");
          if (contentLower.includes(simplePattern.toLowerCase())) {
            violations.push(`금지 표현 발견: "${simplePattern}" - ${expr.description}`);
            suggestions.push(`💡 권장: ${expr.suggestion}`);
          }
        }
      });

      // 필수 문구 누락 검사
      guideline.mandatoryStatements.forEach((stmt) => {
        // 조건부 필수 문구는 제외 (실제 구현에서는 조건 체크 로직 필요)
        if (!stmt.condition) {
          const stmtKeywords = stmt.content.split(" ").filter(w => w.length > 3);
          const hasStatement = stmtKeywords.some(keyword => 
            contentLower.includes(keyword.toLowerCase())
          );
          if (!hasStatement) {
            suggestions.push(`필수 문구 권장: "${stmt.content.substring(0, 50)}..."`);
          }
        }
      });

      // 필수 체크리스트 항목 검사
      const requiredItems = guideline.checklist.filter(item => item.required);
      requiredItems.forEach((item) => {
        // 체크리스트 항목과 관련된 내용이 있는지 간단히 검사
        const itemKeywords = item.item.split(" ").filter(w => w.length > 2);
        const hasRelatedContent = itemKeywords.some(keyword =>
          contentLower.includes(keyword.toLowerCase()) || 
          Object.keys(data.sectorFields).some(field => 
            field.toLowerCase().includes(keyword.toLowerCase()) && data.sectorFields[field]
          )
        );
        if (!hasRelatedContent) {
          suggestions.push(`체크리스트 확인 필요: ${item.item}`);
        }
      });
    }

    // 과거 이력 매칭
    const historyMatch = HISTORY_RAG.find((history) => {
      const historyWords = history.content.toLowerCase().split(" ");
      return historyWords.some((word) => word.length > 2 && contentLower.includes(word));
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
      if (guideline) {
        guideline.prohibitedExpressions.forEach((expr) => {
          try {
            const regex = new RegExp(expr.pattern, "gi");
            correctedContent = correctedContent?.replace(regex, "[수정 필요]");
          } catch (e) {
            // 정규식 오류 시 무시
          }
        });
      }
    } else if (suggestions.length > 0) {
      status = "AutoCorrected";
      riskLevel = "Low";
      correctedContent = data.content + `\n\n※ 권장사항:\n${suggestions.slice(0, 3).join("\n")}`;
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
    setShowGuideline(false);
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
        <div className="max-w-6xl mx-auto px-4 py-4">
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
            <div className="flex items-center space-x-3">
              {selectedSector && currentStep !== "submitted" && (
                <button
                  onClick={() => setShowGuideline(!showGuideline)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    showGuideline
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">가이드라인</span>
                </button>
              )}
              <div className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                광고 심의 기안자
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto px-4 py-6">
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

        {/* Main Content with Guideline Panel */}
        <div className={`flex gap-6 ${showGuideline && selectedSector ? "" : ""}`}>
          {/* Main Content */}
          <div className={`bg-white rounded-xl shadow-lg p-6 md:p-8 ${showGuideline && selectedSector ? "flex-1" : "w-full"}`}>
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

          {/* Guideline Panel */}
          {showGuideline && selectedSector && currentStep !== "submitted" && (
            <div className="w-96 flex-shrink-0">
              <div className="sticky top-4">
                <SectorGuidelinePanel sector={selectedSector} />
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
