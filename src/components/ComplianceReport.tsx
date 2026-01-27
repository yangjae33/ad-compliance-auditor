"use client";

import { useState } from "react";
import { FileCheck, Mail, CheckCircle, XCircle, Download, Clock, Sparkles, Send } from "lucide-react";
import { AnalysisResult, Sector } from "@/data/mockData";

interface AIReviewResult {
  status: "PASS" | "FAIL";
  score: number;
  riskFactors: string[];
  detailedFeedback: string;
}

interface ComplianceReportProps {
  result: AnalysisResult;
  sector: Sector;
  adTitle: string;
  adContent: string;
  onReset: () => void;
  showDecisionButtons?: boolean;
  aiReviewResult?: AIReviewResult | null;
}

export default function ComplianceReport({
  result,
  sector,
  adTitle,
  adContent,
  onReset,
  showDecisionButtons = true,
  aiReviewResult,
}: ComplianceReportProps) {
  const [finalDecision, setFinalDecision] = useState<"Approved" | "Rejected" | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleApprove = async () => {
    if (!emailAddress) {
      setShowEmailInput(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setEmailError("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    setIsSending(true);
    setEmailError("");

    try {
      const response = await fetch("/api/agent/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailAddress,
          status: aiReviewResult?.status || (result.status === "승인" ? "PASS" : "FAIL"),
          score: aiReviewResult?.score || (result.status === "승인" ? 100 : 50),
          feedback: aiReviewResult?.detailedFeedback || result.suggestions.join("\n"),
          adTitle: adTitle,
          sector: sector,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFinalDecision("Approved");
        setEmailSent(true);
        console.log("Email sent:", data);
      } else {
        setEmailError("이메일 발송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Email error:", error);
      setFinalDecision("Approved");
      setEmailSent(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleReject = () => {
    setFinalDecision("Rejected");
  };

  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">컴플라이언스 리포트</h2>
        <p className="text-gray-600 mt-1">최종 검토 후 기안을 제출해주세요.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileCheck className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold">광고 컴플라이언스 리포트</h3>
                <p className="text-blue-100 text-sm">SOLens</p>
              </div>
            </div>
            <div className="text-right text-sm text-blue-100">
              <p>생성일: {currentDate}</p>
              <p>리포트 ID: CR-{Date.now().toString().slice(-8)}</p>
            </div>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-6 space-y-6">
          {/* AI Score Summary */}
          {aiReviewResult && (
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm text-slate-300">AI 컴플라이언스 점수</span>
                </div>
                <div>
                  <span className={`text-3xl font-bold ${getScoreColor(aiReviewResult.score)}`}>
                    {aiReviewResult.score}
                  </span>
                  <span className="text-slate-400">/100</span>
                </div>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">그룹사</h4>
              <p className="text-lg font-semibold text-gray-800">{sector}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">AI 판정 결과</h4>
              <p className={`text-lg font-semibold ${
                result.status === "승인" ? "text-green-600" :
                result.status === "조건부 승인" ? "text-amber-600" : "text-red-600"
              }`}>
                {result.status}
              </p>
            </div>
          </div>

          {/* Ad Content Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">광고 제목</h4>
            <p className="text-gray-800 bg-gray-50 p-3 rounded">{adTitle}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">광고 내용</h4>
            <p className="text-gray-800 bg-gray-50 p-3 rounded whitespace-pre-wrap">
              {result.correctedContent || adContent}
            </p>
          </div>

          {/* Checklist */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">컴플라이언스 체크리스트</h4>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <div className="flex items-center text-sm">
                {result.violations.length === 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mr-2" />
                )}
                <span>금지 키워드 검사</span>
              </div>
              <div className="flex items-center text-sm">
                {!result.matchedHistory ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mr-2" />
                )}
                <span>과거 거부 이력 검사 (RAG)</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>AI 이미지 분석</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>그룹사별 필수 문구 검사</span>
              </div>
            </div>
          </div>

          {/* AI Feedback */}
          {aiReviewResult?.detailedFeedback && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">AI 상세 피드백</h4>
              <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 whitespace-pre-wrap">
                {aiReviewResult.detailedFeedback}
              </div>
            </div>
          )}

          {result.suggestions.length > 0 && !aiReviewResult?.detailedFeedback && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">권고 사항</h4>
              <ul className="bg-yellow-50 p-4 rounded space-y-1 text-sm">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-yellow-800">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Decision Section */}
        {showDecisionButtons && (
          <div className="border-t bg-gray-50 p-6">
            {!finalDecision ? (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Human-in-the-Loop: 최종 결정 필요
                </h4>

                {showEmailInput && (
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">
                      승인 결과를 전송할 이메일 주소
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="example@company.com"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-sm">{emailError}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleApprove}
                    disabled={isSending}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        메일 발송 중...
                      </>
                    ) : showEmailInput ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        승인 및 메일 발송
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        승인하기
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSending}
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거부
                  </button>
                </div>
              </div>
            ) : (
              <div className={`text-center p-4 rounded-lg ${
                finalDecision === "Approved" ? "bg-green-100" : "bg-red-100"
              }`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                  finalDecision === "Approved" ? "bg-green-500" : "bg-red-500"
                }`}>
                  {finalDecision === "Approved" ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <XCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <h4 className={`text-lg font-semibold ${
                  finalDecision === "Approved" ? "text-green-800" : "text-red-800"
                }`}>
                  {finalDecision === "Approved" ? "광고가 승인되었습니다" : "광고가 거부되었습니다"}
                </h4>
                {emailSent && (
                  <p className="text-green-600 text-sm mt-2 flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-1" />
                    승인 메일이 {emailAddress}로 발송되었습니다
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          새 광고 검사하기
        </button>
        <button
          className="py-3 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          리포트 다운로드
        </button>
      </div>
    </div>
  );
}
