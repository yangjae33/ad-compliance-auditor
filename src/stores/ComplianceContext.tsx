"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DraftDocument, DraftStatus, PersonaType } from "@/data/mockData";

interface ComplianceContextType {
  // 현재 페르소나
  currentPersona: PersonaType | null;
  setCurrentPersona: (persona: PersonaType | null) => void;
  
  // 기안 문서 관리
  drafts: DraftDocument[];
  addDraft: (draft: Omit<DraftDocument, "id" | "createdAt" | "updatedAt">) => string;
  updateDraftStatus: (id: string, status: DraftStatus, reviewedBy?: string, reviewComment?: string) => void;
  getDraftById: (id: string) => DraftDocument | undefined;
  getDraftsByStatus: (status: DraftStatus) => DraftDocument[];
  getPendingDraftsCount: () => number;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

// 초기 샘플 기안 문서
const INITIAL_DRAFTS: DraftDocument[] = [
  {
    id: "draft-001",
    title: "연 5.5% 고금리 정기예금 출시",
    content: "새로운 고금리 정기예금 상품을 출시합니다. 예금자보호법에 따라 원금과 이자를 합하여 5천만원까지 보호됩니다.",
    sector: "은행",
    status: "pending",
    analysisResult: {
      status: "Approved",
      riskLevel: "Low",
      violations: [],
      matchedHistory: null,
      suggestions: [],
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: "김기안",
    sectorFields: { "예금자보호법 문구 포함": true, "금리 정보 명시": true },
  },
  {
    id: "draft-002",
    title: "프리미엄 신용카드 혜택 안내",
    content: "연회비 10만원으로 최대 할인 혜택을 누리세요. 모든 가맹점에서 무이자 할부가 가능합니다.",
    correctedContent: "연회비 10만원으로 다양한 할인 혜택을 누리세요. 제휴 가맹점에서 [수정 필요] 할부가 가능합니다.\n\n※ 할인 및 혜택은 이용 조건에 따라 달라질 수 있습니다.",
    sector: "카드",
    status: "pending",
    analysisResult: {
      status: "AutoCorrected",
      riskLevel: "Low",
      violations: ["금지 키워드 발견: \"무이자\"", "금지 키워드 발견: \"최대 할인\""],
      matchedHistory: null,
      suggestions: ["할인 및 혜택은 이용 조건에 따라 달라질 수 있습니다."],
      correctedContent: "연회비 10만원으로 다양한 할인 혜택을 누리세요. 제휴 가맹점에서 [수정 필요] 할부가 가능합니다.\n\n※ 할인 및 혜택은 이용 조건에 따라 달라질 수 있습니다.",
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    createdBy: "이기안",
    sectorFields: { "연회비 정보 포함": true, "혜택 조건 명시": false },
  },
  {
    id: "draft-003",
    title: "안정적인 채권형 펀드",
    content: "원금손실 가능성이 있으며, 투자 전 투자설명서를 반드시 확인하시기 바랍니다. 과거 운용실적이 미래 수익을 보장하지 않습니다.",
    sector: "증권",
    status: "approved",
    analysisResult: {
      status: "Approved",
      riskLevel: "Low",
      violations: [],
      matchedHistory: null,
      suggestions: [],
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    createdBy: "박기안",
    reviewedBy: "최준법",
    reviewComment: "규정 준수 확인. 승인합니다.",
    sectorFields: { "투자 위험 고지 포함": true, "원금손실 가능성 명시": true },
  },
];

export function ComplianceProvider({ children }: { children: ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<PersonaType | null>(null);
  const [drafts, setDrafts] = useState<DraftDocument[]>(INITIAL_DRAFTS);

  const addDraft = useCallback((draft: Omit<DraftDocument, "id" | "createdAt" | "updatedAt">): string => {
    const id = `draft-${Date.now()}`;
    const now = new Date();
    const newDraft: DraftDocument = {
      ...draft,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setDrafts((prev) => [newDraft, ...prev]);
    return id;
  }, []);

  const updateDraftStatus = useCallback((
    id: string,
    status: DraftStatus,
    reviewedBy?: string,
    reviewComment?: string
  ) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              status,
              reviewedBy,
              reviewComment,
              updatedAt: new Date(),
            }
          : draft
      )
    );
  }, []);

  const getDraftById = useCallback((id: string) => {
    return drafts.find((draft) => draft.id === id);
  }, [drafts]);

  const getDraftsByStatus = useCallback((status: DraftStatus) => {
    return drafts.filter((draft) => draft.status === status);
  }, [drafts]);

  const getPendingDraftsCount = useCallback(() => {
    return drafts.filter((draft) => draft.status === "pending").length;
  }, [drafts]);

  return (
    <ComplianceContext.Provider
      value={{
        currentPersona,
        setCurrentPersona,
        drafts,
        addDraft,
        updateDraftStatus,
        getDraftById,
        getDraftsByStatus,
        getPendingDraftsCount,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
}

export function useCompliance() {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error("useCompliance must be used within a ComplianceProvider");
  }
  return context;
}
