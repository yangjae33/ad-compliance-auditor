"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertTriangle,
  Info,
  Sparkles,
  Bot,
} from "lucide-react";
import {
  ChecklistItem,
  ChecklistReview,
  CheckResult,
  getChecklistSummary,
} from "@/data/checklist/bankChecklist";

interface AICheckResult {
  itemId: string;
  result: "적정" | "부적정" | "해당없음";
  reason: string;
  confidence: number;
}

interface ChecklistPanelProps {
  review: ChecklistReview;
  onUpdateItem: (itemId: string, result: CheckResult, comment: string) => void;
  onUpdateGeneralComment: (comment: string) => void;
  aiResults?: AICheckResult[];
  aiSummary?: string;
  isAIReviewing?: boolean;
  readOnly?: boolean;
}

const resultConfig: Record<CheckResult, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  적정: {
    label: "적정",
    color: "text-green-700",
    bgColor: "bg-green-100 border-green-300",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  부적정: {
    label: "부적정",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    icon: <XCircle className="w-4 h-4" />,
  },
  해당없음: {
    label: "해당없음",
    color: "text-gray-500",
    bgColor: "bg-gray-100 border-gray-300",
    icon: <MinusCircle className="w-4 h-4" />,
  },
  미검토: {
    label: "미검토",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-300",
    icon: <HelpCircle className="w-4 h-4" />,
  },
};

export default function ChecklistPanel({
  review,
  onUpdateItem,
  onUpdateGeneralComment,
  aiResults,
  aiSummary,
  isAIReviewing = false,
  readOnly = false,
}: ChecklistPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["부적정 항목", "공통"]));
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set(["공통-형식", "공통-의무표시 사항"]));
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [viewMode, setViewMode] = useState<"priority" | "category">("priority");
  
  const summary = useMemo(() => getChecklistSummary(review), [review]);
  
  // AI 결과를 itemId로 빠르게 조회할 수 있도록 Map 생성
  const aiResultMap = useMemo(() => {
    const map = new Map<string, AICheckResult>();
    aiResults?.forEach(r => map.set(r.itemId, r));
    return map;
  }, [aiResults]);

  // 부적정 항목을 상단에 정렬한 리스트
  const sortedItems = useMemo(() => {
    const items = [...review.items];
    
    if (viewMode === "priority") {
      // 부적정 > 미검토 > 적정 > 해당없음 순으로 정렬
      const priority: Record<CheckResult, number> = {
        "부적정": 0,
        "미검토": 1,
        "적정": 2,
        "해당없음": 3,
      };
      items.sort((a, b) => priority[a.result] - priority[b.result]);
    }
    
    return items;
  }, [review.items, viewMode]);

  // 카테고리별 그룹화 (우선순위 모드용)
  const groupedByPriority = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {
      "부적정 항목": [],
      "미검토 항목": [],
      "적정 항목": [],
      "해당없음": [],
    };
    
    review.items.forEach(item => {
      if (item.result === "부적정") {
        groups["부적정 항목"].push(item);
      } else if (item.result === "미검토") {
        groups["미검토 항목"].push(item);
      } else if (item.result === "적정") {
        groups["적정 항목"].push(item);
      } else {
        groups["해당없음"].push(item);
      }
    });
    
    return groups;
  }, [review.items]);

  // 카테고리별 그룹화 (기존 모드용)
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, { subCategory: string; items: ChecklistItem[] }[]> = {};
    
    review.items.forEach(item => {
      const categoryKey = item.category;
      if (!groups[categoryKey]) {
        groups[categoryKey] = [];
      }
      
      const subCategoryKey = item.subCategory || "기타";
      let subGroup = groups[categoryKey].find(g => g.subCategory === (item.subCategory || "기타"));
      if (!subGroup) {
        subGroup = { subCategory: item.subCategory || "기타", items: [] };
        groups[categoryKey].push(subGroup);
      }
      subGroup.items.push(item);
    });
    
    return groups;
  }, [review.items]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const toggleSubCategory = (key: string) => {
    const newSet = new Set(expandedSubCategories);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedSubCategories(newSet);
  };

  const handleResultChange = (item: ChecklistItem, result: CheckResult) => {
    onUpdateItem(item.id, result, item.comment);
  };

  const handleCommentChange = (item: ChecklistItem, comment: string) => {
    onUpdateItem(item.id, item.result, comment);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            업무 광고 점검표
          </h3>
          <div className="flex items-center gap-2">
            {aiResults && (
              <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI 검토완료
              </span>
            )}
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              은행
            </span>
          </div>
        </div>
        
        {/* AI Summary */}
        {aiSummary && (
          <div className="mb-3 p-2 bg-white/10 rounded-lg text-xs">
            <div className="flex items-start gap-1.5">
              <Bot className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <p>{aiSummary}</p>
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>검토 진행률</span>
            <span>{summary.checked}/{summary.total} ({summary.progress}%)</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${summary.progress}%` }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-white/10 rounded-lg py-1.5">
            <div className="font-bold text-green-300">{summary.appropriate}</div>
            <div className="text-white/70">적정</div>
          </div>
          <div className={`bg-white/10 rounded-lg py-1.5 ${summary.inappropriate > 0 ? "ring-2 ring-red-400" : ""}`}>
            <div className="font-bold text-red-300">{summary.inappropriate}</div>
            <div className="text-white/70">부적정</div>
          </div>
          <div className="bg-white/10 rounded-lg py-1.5">
            <div className="font-bold text-gray-300">{summary.notApplicable}</div>
            <div className="text-white/70">해당없음</div>
          </div>
          <div className="bg-white/10 rounded-lg py-1.5">
            <div className="font-bold text-yellow-300">{summary.total - summary.checked}</div>
            <div className="text-white/70">미검토</div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-3 py-2 bg-gray-100 border-x border-gray-200 flex gap-1">
        <button
          onClick={() => setViewMode("priority")}
          className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
            viewMode === "priority"
              ? "bg-white text-blue-700 shadow-sm font-medium"
              : "text-gray-500 hover:bg-gray-200"
          }`}
        >
          우선순위별
        </button>
        <button
          onClick={() => setViewMode("category")}
          className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
            viewMode === "category"
              ? "bg-white text-blue-700 shadow-sm font-medium"
              : "text-gray-500 hover:bg-gray-200"
          }`}
        >
          카테고리별
        </button>
      </div>

      {/* Loading State */}
      {isAIReviewing && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 border-x border-gray-200">
          <div className="text-center p-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">AI가 점검표를 검토하고 있습니다...</p>
            <p className="text-xs text-gray-500">광고 내용을 분석하여 각 항목을 자동으로 평가합니다</p>
          </div>
        </div>
      )}

      {/* Checklist Items */}
      {!isAIReviewing && (
        <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-gray-200">
          {viewMode === "priority" ? (
            // 우선순위별 보기
            <>
              {Object.entries(groupedByPriority).map(([groupName, items]) => {
                if (items.length === 0) return null;
                
                const groupConfig: Record<string, { color: string; bgColor: string }> = {
                  "부적정 항목": { color: "text-red-700", bgColor: "bg-red-50" },
                  "미검토 항목": { color: "text-yellow-700", bgColor: "bg-yellow-50" },
                  "적정 항목": { color: "text-green-700", bgColor: "bg-green-50" },
                  "해당없음": { color: "text-gray-600", bgColor: "bg-gray-50" },
                };
                const config = groupConfig[groupName];
                
                return (
                  <div key={groupName} className="border-b border-gray-200">
                    <button
                      onClick={() => toggleCategory(groupName)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 ${config.bgColor} hover:opacity-90 transition-colors`}
                    >
                      <span className={`font-medium ${config.color} flex items-center gap-2`}>
                        {expandedCategories.has(groupName) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {groupName}
                        {groupName === "부적정 항목" && items.length > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </span>
                      <span className={`text-xs ${config.color}`}>
                        {items.length}개 항목
                      </span>
                    </button>

                    {expandedCategories.has(groupName) && (
                      <div className="divide-y divide-gray-100">
                        {items.map((item) => (
                          <ChecklistItemRow
                            key={item.id}
                            item={item}
                            aiResult={aiResultMap.get(item.id)}
                            isSelected={selectedItem?.id === item.id}
                            onSelect={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                            onResultChange={(result) => handleResultChange(item, result)}
                            onCommentChange={(comment) => handleCommentChange(item, comment)}
                            readOnly={readOnly}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            // 카테고리별 보기
            <>
              {Object.entries(groupedByCategory).map(([category, subGroups]) => (
                <div key={category} className="border-b border-gray-200">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      {category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {subGroups.reduce((acc, g) => acc + g.items.length, 0)}개 항목
                    </span>
                  </button>

                  {expandedCategories.has(category) && (
                    <div className="bg-gray-50">
                      {subGroups.map((subGroup) => {
                        const subKey = `${category}-${subGroup.subCategory}`;
                        return (
                          <div key={subKey}>
                            {subGroup.subCategory && subGroup.subCategory !== "기타" && (
                              <button
                                onClick={() => toggleSubCategory(subKey)}
                                className="w-full flex items-center justify-between px-6 py-2 bg-gray-100 hover:bg-gray-150 transition-colors border-t border-gray-200"
                              >
                                <span className="text-sm text-gray-700 flex items-center gap-2">
                                  {expandedSubCategories.has(subKey) ? (
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-gray-400" />
                                  )}
                                  {subGroup.subCategory}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {subGroup.items.length}개
                                </span>
                              </button>
                            )}

                            {(expandedSubCategories.has(subKey) || !subGroup.subCategory || subGroup.subCategory === "기타") && (
                              <div className="divide-y divide-gray-100">
                                {subGroup.items.map((item) => (
                                  <ChecklistItemRow
                                    key={item.id}
                                    item={item}
                                    aiResult={aiResultMap.get(item.id)}
                                    isSelected={selectedItem?.id === item.id}
                                    onSelect={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                    onResultChange={(result) => handleResultChange(item, result)}
                                    onCommentChange={(comment) => handleCommentChange(item, comment)}
                                    readOnly={readOnly}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* General Comment */}
      <div className="p-3 bg-white border border-gray-200 rounded-b-xl">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
          종합 의견
        </label>
        <textarea
          value={review.generalComment}
          onChange={(e) => onUpdateGeneralComment(e.target.value)}
          placeholder="전체적인 검토 의견을 입력하세요..."
          className="w-full text-sm border rounded-lg p-2 h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={readOnly}
        />
      </div>
    </div>
  );
}

// 개별 체크리스트 항목 행
interface ChecklistItemRowProps {
  item: ChecklistItem;
  aiResult?: AICheckResult;
  isSelected: boolean;
  onSelect: () => void;
  onResultChange: (result: CheckResult) => void;
  onCommentChange: (comment: string) => void;
  readOnly: boolean;
}

interface AICheckResult {
  itemId: string;
  result: "적정" | "부적정" | "해당없음";
  reason: string;
  confidence: number;
}

function ChecklistItemRow({
  item,
  aiResult,
  isSelected,
  onSelect,
  onResultChange,
  onCommentChange,
  readOnly,
}: ChecklistItemRowProps) {
  const config = resultConfig[item.result];
  const hasAIResult = !!aiResult;
  const isAIModified = hasAIResult && item.result !== "미검토";

  return (
    <div className={`bg-white ${isSelected ? "ring-2 ring-blue-500 ring-inset" : ""} ${item.result === "부적정" ? "bg-red-50/50" : ""}`}>
      {/* Main Row */}
      <div
        className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onSelect}
      >
        {/* Result Badge */}
        <div className={`flex-shrink-0 mt-0.5 ${config.color}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-800 leading-snug">
              {item.checkPoint}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasAIResult && (
                <span className="inline-flex items-center gap-0.5 text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
              {item.result === "부적정" && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          {item.relatedLaw && (
            <p className="text-xs text-gray-400 mt-0.5">{item.relatedLaw}</p>
          )}
          {/* AI Reason Preview */}
          {hasAIResult && aiResult.reason && !isSelected && (
            <p className="text-xs text-purple-600 mt-1 truncate">
              AI: {aiResult.reason}
            </p>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isSelected && (
        <div className="px-4 pb-3 pt-1 bg-gray-50 border-t border-gray-100">
          {/* AI Analysis */}
          {hasAIResult && (
            <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-700 mb-0.5">AI 분석 결과</p>
                  <p className="text-xs text-purple-600">{aiResult.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      aiResult.result === "적정" ? "bg-green-100 text-green-700" :
                      aiResult.result === "부적정" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      AI 판단: {aiResult.result}
                    </span>
                    <span className="text-xs text-purple-400">
                      확신도: {Math.round(aiResult.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Example */}
          {item.example && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{item.example}</p>
              </div>
            </div>
          )}

          {/* Result Buttons */}
          {!readOnly && (
            <div className="flex gap-1.5 mb-2">
              {(["적정", "부적정", "해당없음"] as CheckResult[]).map((result) => {
                const cfg = resultConfig[result];
                const isActive = item.result === result;
                return (
                  <button
                    key={result}
                    onClick={(e) => {
                      e.stopPropagation();
                      onResultChange(result);
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      isActive
                        ? `${cfg.bgColor} ${cfg.color} border-current`
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Comment Input - Only show for 부적정 */}
          {(item.result === "부적정" || item.comment) && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {item.result === "부적정" ? "부적정 사유 *" : "비고"}
              </label>
              <textarea
                value={item.comment}
                onChange={(e) => {
                  e.stopPropagation();
                  onCommentChange(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder={item.result === "부적정" ? "부적정 판단 사유를 입력하세요..." : "추가 의견을 입력하세요..."}
                className={`w-full text-xs border rounded-lg p-2 h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  item.result === "부적정" && !item.comment ? "border-red-300 bg-red-50" : ""
                }`}
                disabled={readOnly}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
