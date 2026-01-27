"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Edit3, XCircle, FileText, History, Sparkles } from "lucide-react";
import { AnalysisResult as AnalysisResultType } from "@/data/mockData";
import { useMemo } from "react";

interface AnalysisResultProps {
  result: AnalysisResultType;
  originalContent: string;
  onProceed: () => void;
  onRetry: () => void;
  aiScore?: number;
}

// 두 텍스트의 차이점을 찾아 하이라이트하는 함수
function highlightDifferences(original: string, corrected: string): { originalHighlighted: React.ReactNode; correctedHighlighted: React.ReactNode } {
  // 줄 단위로 분리하여 비교
  const originalLines = original.split('\n');
  const correctedLines = corrected.split('\n');
  
  // [수정 필요] 패턴 찾기
  const modificationMarker = '[수정 필요]';
  
  // 원본에서 수정된 부분 하이라이트
  const originalHighlighted = originalLines.map((line, lineIndex) => {
    // 수정본에서 해당 라인이 [수정 필요]로 대체되었는지 확인
    const correctedLine = correctedLines[lineIndex] || '';
    
    // 단어 단위로 비교
    const originalWords = line.split(/(\s+)/);
    const correctedWords = correctedLine.split(/(\s+)/);
    
    const highlightedLine = originalWords.map((word, wordIndex) => {
      // 공백은 그대로 유지
      if (word.match(/^\s+$/)) {
        return <span key={wordIndex}>{word}</span>;
      }
      
      // 수정본에 [수정 필요]가 있고, 원본 단어가 수정본에 없는 경우
      const isModified = correctedLine.includes(modificationMarker) && 
                         !correctedWords.includes(word) && 
                         word.trim().length > 0;
      
      if (isModified) {
        return (
          <span key={wordIndex} className="bg-red-200 text-red-800 px-0.5 rounded">
            {word}
          </span>
        );
      }
      return <span key={wordIndex}>{word}</span>;
    });

    return (
      <span key={lineIndex}>
        {highlightedLine}
        {lineIndex < originalLines.length - 1 && <br />}
      </span>
    );
  });

  // 수정본에서 추가된 부분 하이라이트
  const correctedHighlighted = correctedLines.map((line, lineIndex) => {
    const originalLine = originalLines[lineIndex] || '';
    
    // [수정 필요] 표시 하이라이트
    if (line.includes(modificationMarker)) {
      const parts = line.split(modificationMarker);
      const highlightedParts = parts.map((part, partIndex) => (
        <span key={partIndex}>
          {part}
          {partIndex < parts.length - 1 && (
            <span className="bg-amber-200 text-amber-800 px-1 rounded font-medium">
              {modificationMarker}
            </span>
          )}
        </span>
      ));
      return (
        <span key={lineIndex}>
          {highlightedParts}
          {lineIndex < correctedLines.length - 1 && <br />}
        </span>
      );
    }
    
    // 원본에 없는 새로운 라인 (※ 로 시작하는 권고사항 등)
    if (line.startsWith('※') || (lineIndex >= originalLines.length && line.trim().length > 0)) {
      return (
        <span key={lineIndex}>
          <span className="bg-green-200 text-green-800 px-0.5 rounded">{line}</span>
          {lineIndex < correctedLines.length - 1 && <br />}
        </span>
      );
    }
    
    return (
      <span key={lineIndex}>
        {line}
        {lineIndex < correctedLines.length - 1 && <br />}
      </span>
    );
  });

  return { originalHighlighted, correctedHighlighted };
}

// Diff 비교 컴포넌트
function DiffComparison({ original, corrected }: { original: string; corrected: string }) {
  const { originalHighlighted, correctedHighlighted } = useMemo(
    () => highlightDifferences(original, corrected),
    [original, corrected]
  );

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">제안된 수정 내용</h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">📝 원본</p>
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">수정 필요 부분</span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            {originalHighlighted}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">✨ 수정 제안</p>
            <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded">추가/변경 부분</span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            {correctedHighlighted}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-200 rounded"></span>
          수정 필요
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-amber-200 rounded"></span>
          수정 표시
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-200 rounded"></span>
          추가된 내용
        </span>
      </div>
    </div>
  );
}

export default function AnalysisResult({ result, originalContent, onProceed, onRetry, aiScore }: AnalysisResultProps) {
  // 차이점 하이라이트 계산
  const diffHighlight = useMemo(() => {
    if (result.correctedContent) {
      return getDiffHighlight(originalContent, result.correctedContent);
    }
    return null;
  }, [originalContent, result.correctedContent]);
  const getStatusConfig = () => {
    switch (result.status) {
      case "반려":
        return {
          icon: <XCircle className="w-8 h-8" />,
          title: "반려",
          description: "광고 내용에 심각한 위반 사항이 발견되어 반려되었습니다.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          iconBg: "bg-red-100",
        };
      case "조건부 승인":
        return {
          icon: <Edit3 className="w-8 h-8" />,
          title: "조건부 승인",
          description: "일부 수정이 필요하지만 조건 충족 시 승인 가능합니다.",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-700",
          iconBg: "bg-amber-100",
        };
      case "승인":
        return {
          icon: <CheckCircle className="w-8 h-8" />,
          title: "승인",
          description: "광고 내용이 컴플라이언스 기준을 충족합니다.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          iconBg: "bg-green-100",
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 50) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">AI 분석 결과</h2>
        <p className="text-gray-600 mt-1">AI 에이전트가 광고 내용을 분석한 결과입니다.</p>
      </div>

      {/* AI Score Card */}
      {aiScore !== undefined && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">AI 컴플라이언스 점수</p>
                <p className="text-xs text-slate-400">Powered by Google Gemini</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-5xl font-bold ${getScoreColor(aiScore)}`}>{aiScore}</span>
              <span className="text-slate-400 text-xl">/100</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreBg(aiScore)} transition-all duration-500`}
                style={{ width: `${aiScore}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`${config.iconBg} ${config.textColor} p-3 rounded-full`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>{config.title}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        {result.violations.length > 0 && (
          <div className="mb-4">
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
              발견된 위험 요소
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
              AI 상세 피드백
            </h4>
            <div className="text-sm text-gray-600 bg-white p-3 rounded border whitespace-pre-wrap">
              {result.suggestions.map((suggestion, index) => (
                <p key={index} className={index > 0 ? "mt-2" : ""}>{suggestion}</p>
              ))}
            </div>
          </div>
        )}

        {result.status === "조건부 승인" && result.correctedContent && diffHighlight && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">제안된 수정 내용</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-red-200 rounded"></span>
                  원본 (삭제/변경 부분)
                </p>
                <div className="text-sm text-gray-700">{diffHighlight.originalHighlighted}</div>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-green-200 rounded"></span>
                  수정 제안 (추가/변경 부분)
                </p>
                <div className="text-sm text-gray-700">{diffHighlight.correctedHighlighted}</div>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-red-200 rounded"></span>
                삭제됨
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-green-200 rounded"></span>
                추가됨
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-yellow-300 rounded"></span>
                수정 필요
              </span>
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
        {result.status !== "반려" && (
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
