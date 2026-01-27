"use client";

import { AlertTriangle, CheckCircle, Edit3, XCircle, FileText, History } from "lucide-react";
import { AnalysisResult as AnalysisResultType } from "@/data/mockData";

interface AnalysisResultProps {
  result: AnalysisResultType;
  originalContent: string;
  onProceed: () => void;
  onRetry: () => void;
}

export default function AnalysisResult({ result, originalContent, onProceed, onRetry }: AnalysisResultProps) {
  const getStatusConfig = () => {
    switch (result.status) {
      case "Rejected":
        return {
          icon: <XCircle className="w-8 h-8" />,
          title: "광고 거부됨",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          iconBg: "bg-red-100",
        };
      case "AutoCorrected":
        return {
          icon: <Edit3 className="w-8 h-8" />,
          title: "자동 수정됨",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-700",
          iconBg: "bg-yellow-100",
        };
      case "Approved":
        return {
          icon: <CheckCircle className="w-8 h-8" />,
          title: "광고 승인됨",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          iconBg: "bg-green-100",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Step 3 & 4: 분석 결과</h2>
        <p className="text-gray-600 mt-1">AI 에이전트가 광고 내용을 분석한 결과입니다.</p>
      </div>

      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`${config.iconBg} ${config.textColor} p-3 rounded-full`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>{config.title}</h3>
            <p className="text-sm text-gray-600">
              위험 수준: <span className={result.riskLevel === "High" ? "text-red-600 font-medium" : "text-yellow-600 font-medium"}>
                {result.riskLevel === "High" ? "높음" : "낮음"}
              </span>
            </p>
          </div>
        </div>

        {result.violations.length > 0 && (
          <div className="mb-4">
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
              발견된 위반 사항
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 bg-white p-3 rounded border">
              {result.violations.map((violation, index) => (
                <li key={index}>{violation}</li>
              ))}
            </ul>
          </div>
        )}

        {result.matchedHistory && (
          <div className="mb-4">
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <History className="w-4 h-4 mr-1 text-orange-500" />
              유사 거부 이력 발견 (RAG 검색)
            </h4>
            <div className="bg-white p-3 rounded border text-sm">
              <p className="text-gray-600 mb-1">
                <span className="font-medium">유사 광고:</span> {result.matchedHistory.content}
              </p>
              <p className="text-red-600">
                <span className="font-medium">거부 사유:</span> {result.matchedHistory.reason}
              </p>
            </div>
          </div>
        )}

        {result.suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-1 text-blue-500" />
              수정 제안
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 bg-white p-3 rounded border">
              {result.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {result.status === "AutoCorrected" && result.correctedContent && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">자동 수정된 내용</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <p className="text-xs font-medium text-red-600 mb-1">원본</p>
                <p className="text-sm text-gray-700 line-through">{originalContent}</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-xs font-medium text-green-600 mb-1">수정본</p>
                <p className="text-sm text-gray-700">{result.correctedContent}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onRetry}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          다시 입력하기
        </button>
        {result.status !== "Rejected" && (
          <button
            onClick={onProceed}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            컴플라이언스 리포트 생성
          </button>
        )}
      </div>
    </div>
  );
}
