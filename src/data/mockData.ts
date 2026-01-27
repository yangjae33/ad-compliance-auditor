export type Sector = "Bank" | "Card" | "Investment" | "Insurance";

// 페르소나 타입 정의
export type PersonaType = "drafter" | "compliance_officer" | "consumer_protection";

export interface Persona {
  type: PersonaType;
  label: string;
  description: string;
  color: string;
}

export const PERSONAS: Persona[] = [
  {
    type: "drafter",
    label: "광고 심의 기안자",
    description: "광고 컴플라이언스 검사를 기안하고 제출합니다",
    color: "blue",
  },
  {
    type: "compliance_officer",
    label: "준법감시인",
    description: "기안된 광고를 검토하고 최종 승인/반려합니다",
    color: "purple",
  },
  {
    type: "consumer_protection",
    label: "소비자보호부",
    description: "소비자 관점에서 광고를 검토합니다",
    color: "teal",
  },
];

// 기안 문서 상태
export type DraftStatus = "pending" | "approved" | "rejected" | "review_requested";

// 기안 문서 인터페이스
export interface DraftDocument {
  id: string;
  title: string;
  content: string;
  correctedContent?: string;
  sector: Sector;
  status: DraftStatus;
  analysisResult: AnalysisResult;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  reviewedBy?: string;
  reviewComment?: string;
  sectorFields: Record<string, boolean>;
}

export interface Regulation {
  sector: Sector;
  keywords: string[];
  required: string[];
  riskLevel: "High" | "Low";
  suggestion: string;
}

export interface HistoryItem {
  id: number;
  content: string;
  result: "Rejected" | "Approved";
  reason: string;
}

export interface AnalysisResult {
  status: "Rejected" | "AutoCorrected" | "Approved";
  riskLevel: "High" | "Low";
  violations: string[];
  matchedHistory: HistoryItem | null;
  suggestions: string[];
  correctedContent?: string;
}

export const REGULATIONS: Regulation[] = [
  {
    sector: "Bank",
    keywords: ["무조건", "확정금리", "확정 수익", "원금 보장"],
    required: ["예금자보호법 문구"],
    riskLevel: "High",
    suggestion: "금리는 가입 조건에 따라 달라질 수 있습니다.",
  },
  {
    sector: "Card",
    keywords: ["무이자", "평생 무료", "최대 할인"],
    required: ["연회비 안내", "이용 조건"],
    riskLevel: "Low",
    suggestion: "할인 및 혜택은 이용 조건에 따라 달라질 수 있습니다.",
  },
  {
    sector: "Investment",
    keywords: ["원금보장", "손실 없음", "확정 수익", "무조건", "100% 수익"],
    required: ["투자자 유의사항", "원금손실 가능성"],
    riskLevel: "High",
    suggestion: "투자 원금의 손실이 발생할 수 있습니다.",
  },
  {
    sector: "Insurance",
    keywords: ["무조건 보장", "전액 보장", "무심사"],
    required: ["보험약관 확인 문구", "보장 제한 사항"],
    riskLevel: "Low",
    suggestion: "보장 내용은 약관에 따라 달라질 수 있습니다.",
  },
];

export const HISTORY_RAG: HistoryItem[] = [
  {
    id: 1,
    content: "3개월만 넣어도 10% 확정 수익",
    result: "Rejected",
    reason: "금융소비자보호법 제19조 위반 (오인 소지)",
  },
  {
    id: 2,
    content: "원금 100% 보장되는 투자 상품",
    result: "Rejected",
    reason: "자본시장법 제57조 위반 (허위 과장 광고)",
  },
  {
    id: 3,
    content: "손실 걱정 없는 안전한 펀드",
    result: "Rejected",
    reason: "금융투자업규정 위반 (투자자 오인 유발)",
  },
  {
    id: 4,
    content: "최고 금리 적금 출시! 예금자보호법에 따라 보호됩니다.",
    result: "Approved",
    reason: "규정 준수",
  },
  {
    id: 5,
    content: "무조건 승인되는 신용카드",
    result: "Rejected",
    reason: "여신전문금융업법 위반 (허위 광고)",
  },
];

export const SECTOR_FIELDS: Record<Sector, { label: string; type: string; required: boolean }[]> = {
  Bank: [
    { label: "예금자보호법 문구 포함", type: "checkbox", required: true },
    { label: "금리 정보 명시", type: "checkbox", required: true },
  ],
  Card: [
    { label: "연회비 정보 포함", type: "checkbox", required: true },
    { label: "혜택 조건 명시", type: "checkbox", required: false },
  ],
  Investment: [
    { label: "투자 위험 고지 포함", type: "checkbox", required: true },
    { label: "원금손실 가능성 명시", type: "checkbox", required: true },
  ],
  Insurance: [
    { label: "보험약관 확인 문구 포함", type: "checkbox", required: true },
    { label: "보장 제한 사항 명시", type: "checkbox", required: false },
  ],
};
