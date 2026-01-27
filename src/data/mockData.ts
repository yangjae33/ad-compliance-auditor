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

// ============================================
// 업종별 상세 가이드라인 (PDF 분석 기반)
// ============================================

export interface ComplianceChecklist {
  id: string;
  category: string;
  item: string;
  required: boolean;
  regulation: string;
  description: string;
}

export interface ProhibitedExpression {
  id: string;
  pattern: string;
  description: string;
  regulation: string;
  suggestion: string;
}

export interface MandatoryStatement {
  id: string;
  content: string;
  condition?: string;
  regulation: string;
}

export interface SectorGuideline {
  sector: Sector;
  name: string;
  mainRegulations: string[];
  checklist: ComplianceChecklist[];
  prohibitedExpressions: ProhibitedExpression[];
  mandatoryStatements: MandatoryStatement[];
  reviewProcess: string[];
  warnings: string[];
}

// 은행 업종 가이드라인 (은행 광고심의 기준 기반)
export const BANK_GUIDELINE: SectorGuideline = {
  sector: "Bank",
  name: "은행",
  mainRegulations: [
    "금융소비자보호에 관한 법률 제22조",
    "은행 광고심의 기준",
    "은행 광고심의 기준 세칙",
    "예금자보호법",
  ],
  checklist: [
    {
      id: "bank-1",
      category: "의무 표시사항",
      item: "은행 명칭 표시",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제1호",
      description: "광고에 은행의 명칭이 명확히 표시되어야 합니다.",
    },
    {
      id: "bank-2",
      category: "의무 표시사항",
      item: "광고심의필 번호 및 유효기간 표시",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제2호",
      description: "준법감시인 또는 연합회의 심의필 번호와 유효기간을 표시해야 합니다.",
    },
    {
      id: "bank-3",
      category: "의무 표시사항",
      item: "상품설명서 및 약관 확인 권유 문구",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제3호",
      description: "계약 체결 전 상품설명서 및 약관 확인을 권유하는 문구가 포함되어야 합니다.",
    },
    {
      id: "bank-4",
      category: "예금성 상품",
      item: "예금자보호법 부보내용 표시",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제5호 라목",
      description: "예금자보호법에 따른 보호 내용을 명시해야 합니다.",
    },
    {
      id: "bank-5",
      category: "예금성 상품",
      item: "이자율 범위 및 산출기준 명시",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제5호 나목",
      description: "이자율의 범위와 산출 기준을 명확히 표시해야 합니다.",
    },
    {
      id: "bank-6",
      category: "대출성 상품",
      item: "금융소비자 자격요건 명시",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제6호 가목",
      description: "대출 신청 시 갖춰야 할 신용수준 등 자격요건을 명시해야 합니다.",
    },
    {
      id: "bank-7",
      category: "대출성 상품",
      item: "연체이자율 포함 이자율 정보",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제6호 나목",
      description: "연체이자율을 포함한 이자율의 범위 및 산출기준을 표시해야 합니다.",
    },
    {
      id: "bank-8",
      category: "대출성 상품",
      item: "중도상환 조건 명시",
      required: true,
      regulation: "은행 광고심의 기준 제16조 제6호 마목",
      description: "중도상환 시 적용되는 조건을 명시해야 합니다.",
    },
  ],
  prohibitedExpressions: [
    {
      id: "bank-p1",
      pattern: "확정금리|확정 수익|확정이자",
      description: "불확실한 사항에 대해 단정적 판단을 제공하거나 확정적으로 표시",
      regulation: "은행 광고심의 기준 제17조 제1호",
      suggestion: "'금리는 가입 조건에 따라 달라질 수 있습니다' 문구 추가",
    },
    {
      id: "bank-p2",
      pattern: "최고|최상|최저|최초|최대|1위|제일|유일",
      description: "객관적 근거 없는 최상급 표현 사용",
      regulation: "은행 광고심의 기준 제17조 제5호",
      suggestion: "객관적 근거가 있는 사실이나 공인된 자료를 명시하세요.",
    },
    {
      id: "bank-p3",
      pattern: "무조건|반드시|확실",
      description: "거래조건이 달리 적용될 수 있음에도 확정적으로 표시",
      regulation: "은행 광고심의 기준 제17조 제4호",
      suggestion: "'조건에 따라 달라질 수 있습니다' 문구 추가",
    },
    {
      id: "bank-p4",
      pattern: "원금.{0,3}보장|원본.{0,3}보전",
      description: "원금보장형 상품이 아닌 경우 원금이 보장되는 것처럼 오인하게 하는 표현",
      regulation: "은행 광고심의 기준 제17조 제1호",
      suggestion: "원금보장 표현을 삭제하세요.",
    },
  ],
  mandatoryStatements: [
    {
      id: "bank-m1",
      content: "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 5천만원까지 보호됩니다.",
      condition: "예금성 상품",
      regulation: "예금자보호법, 은행 광고심의 기준 제16조",
    },
    {
      id: "bank-m2",
      content: "금리는 가입 조건에 따라 달라질 수 있습니다.",
      condition: "금리 표시 시",
      regulation: "은행 광고심의 기준 제17조",
    },
    {
      id: "bank-m3",
      content: "계약 체결 전 상품설명서 및 약관을 반드시 확인하시기 바랍니다.",
      regulation: "은행 광고심의 기준 제16조 제3호",
    },
  ],
  reviewProcess: [
    "1. 광고시안 제작 (부서별 담당자)",
    "2. 준법감시인 사전승인 신청",
    "3. 준법감시인 검토 및 심의필 번호 부여",
    "4. 연합회 심의대상 광고의 경우 연합회 심의 신청",
    "5. 심의결과 통보 (적격/조건부적격/부적격)",
    "6. 광고 시행 (심의필 번호 표시)",
  ],
  warnings: [
    "연합회 심의대상 광고는 반드시 연합회 심의를 거쳐야 합니다.",
    "심의필 유효기간 경과 후에는 동일 광고를 사용할 수 없습니다.",
    "과거 부적격 판정을 받은 유사 광고에 주의하세요.",
  ],
};

// 카드 업종 가이드라인 (여신전문금융업법 기반)
export const CARD_GUIDELINE: SectorGuideline = {
  sector: "Card",
  name: "카드",
  mainRegulations: [
    "여신전문금융업법",
    "여신전문금융업법 시행령",
    "금융소비자보호에 관한 법률",
  ],
  checklist: [
    {
      id: "card-1",
      category: "의무 표시사항",
      item: "카드사 명칭 표시",
      required: true,
      regulation: "여신전문금융업법",
      description: "광고에 신용카드업자의 명칭이 명확히 표시되어야 합니다.",
    },
    {
      id: "card-2",
      category: "의무 표시사항",
      item: "연회비 정보 표시",
      required: true,
      regulation: "여신전문금융업법 시행령",
      description: "신용카드의 연회비 정보를 명확히 표시해야 합니다.",
    },
    {
      id: "card-3",
      category: "의무 표시사항",
      item: "혜택 이용 조건 명시",
      required: true,
      regulation: "여신전문금융업법",
      description: "할인, 포인트 등 혜택의 이용 조건을 명확히 표시해야 합니다.",
    },
    {
      id: "card-4",
      category: "의무 표시사항",
      item: "이자율 및 연체이자율 표시",
      required: true,
      regulation: "여신전문금융업법",
      description: "카드론, 현금서비스 등의 이자율 및 연체이자율을 표시해야 합니다.",
    },
    {
      id: "card-5",
      category: "모집 관련",
      item: "발급 자격요건 명시",
      required: true,
      regulation: "여신전문금융업법 제14조",
      description: "신용카드 발급 시 필요한 자격요건을 명시해야 합니다.",
    },
  ],
  prohibitedExpressions: [
    {
      id: "card-p1",
      pattern: "무조건.{0,5}(승인|발급)",
      description: "발급 심사 없이 무조건 승인되는 것처럼 오인하게 하는 표현",
      regulation: "여신전문금융업법 제14조",
      suggestion: "'심사 후 발급됩니다' 또는 '발급 조건이 있습니다' 문구 추가",
    },
    {
      id: "card-p2",
      pattern: "평생.{0,3}무료|영구.{0,3}무료",
      description: "영구적인 무료 혜택으로 오인하게 하는 표현",
      regulation: "금융소비자보호에 관한 법률",
      suggestion: "'조건 충족 시' 또는 '기간 한정' 등 조건을 명시하세요.",
    },
    {
      id: "card-p3",
      pattern: "무이자.{0,5}할부",
      description: "무이자 할부 조건을 명확히 하지 않은 표현",
      regulation: "여신전문금융업법",
      suggestion: "무이자 할부 적용 가맹점, 기간, 개월 수 등 조건을 명시하세요.",
    },
    {
      id: "card-p4",
      pattern: "최대.{0,5}(할인|적립|혜택)",
      description: "최대 혜택만 강조하고 조건을 명시하지 않은 표현",
      regulation: "금융소비자보호에 관한 법률",
      suggestion: "최대 혜택의 적용 조건을 함께 명시하세요.",
    },
  ],
  mandatoryStatements: [
    {
      id: "card-m1",
      content: "신용카드 발급은 개인 신용도에 따라 발급이 제한될 수 있습니다.",
      regulation: "여신전문금융업법 제14조",
    },
    {
      id: "card-m2",
      content: "연회비가 부과될 수 있으며, 자세한 내용은 상품설명서를 참조하세요.",
      regulation: "여신전문금융업법",
    },
    {
      id: "card-m3",
      content: "할인 및 혜택은 이용 조건에 따라 달라질 수 있습니다.",
      condition: "혜택 광고 시",
      regulation: "금융소비자보호에 관한 법률",
    },
  ],
  reviewProcess: [
    "1. 광고시안 제작",
    "2. 내부 준법감시인 검토",
    "3. 광고 심의필 번호 부여",
    "4. 광고 시행",
  ],
  warnings: [
    "다단계판매를 통한 신용카드회원 모집은 금지됩니다.",
    "모집인이 아닌 자에게 모집을 위탁하거나 대가를 지급할 수 없습니다.",
    "신용카드 발급 시 본인 확인 및 신용한도 산정 기준을 준수해야 합니다.",
  ],
};

// 투자 업종 가이드라인 (자본시장법, 금융투자업규정 기반)
export const INVESTMENT_GUIDELINE: SectorGuideline = {
  sector: "Investment",
  name: "투자",
  mainRegulations: [
    "자본시장과 금융투자업에 관한 법률 제57조",
    "금융투자업규정 제4-11조, 제4-12조",
    "금융투자회사의 영업 및 업무에 관한 규정 제2-34조~제2-51조",
  ],
  checklist: [
    {
      id: "inv-1",
      category: "의무 표시사항",
      item: "금융투자업자 명칭 표시",
      required: true,
      regulation: "자본시장법 제57조제2항, 영업규정 제2-37조",
      description: "금융투자업자의 명칭을 명확히 표시해야 합니다.",
    },
    {
      id: "inv-2",
      category: "의무 표시사항",
      item: "금융투자상품 내용 표시",
      required: true,
      regulation: "자본시장법 제57조제2항",
      description: "금융투자상품의 내용을 명확히 표시해야 합니다.",
    },
    {
      id: "inv-3",
      category: "의무 표시사항",
      item: "투자에 따른 위험 표시",
      required: true,
      regulation: "자본시장법 제57조제2항",
      description: "투자에 따른 위험을 명확히 고지해야 합니다.",
    },
    {
      id: "inv-4",
      category: "의무 표시사항",
      item: "설명의무 및 설명 청취 권고",
      required: true,
      regulation: "영업규정 제2-37조",
      description: "금융투자업자의 설명의무와 설명을 듣고 투자할 것을 권고하는 내용을 포함해야 합니다.",
    },
    {
      id: "inv-5",
      category: "집합투자증권",
      item: "투자설명서 열람 권고",
      required: true,
      regulation: "자본시장법 제57조제3항",
      description: "집합투자증권 취득 전 투자설명서를 읽어볼 것을 권고해야 합니다.",
    },
    {
      id: "inv-6",
      category: "집합투자증권",
      item: "원금손실 가능성 및 투자자 귀속 명시",
      required: true,
      regulation: "자본시장법 제57조제3항",
      description: "운용결과에 따라 투자원금의 손실이 발생할 수 있으며 그 손실은 투자자에게 귀속된다는 사실을 명시해야 합니다.",
    },
    {
      id: "inv-7",
      category: "집합투자증권",
      item: "과거 운용실적 미래 수익 미보장 명시",
      required: true,
      regulation: "영업규정 제2-37조제2항",
      description: "운용실적 표시 시 그 실적이 미래의 수익률을 보장하지 않는다는 내용을 명시해야 합니다.",
    },
    {
      id: "inv-8",
      category: "위험고지",
      item: "위험고지 표시 기준 준수",
      required: true,
      regulation: "영업규정 제2-37조제5항",
      description: "위험고지사항을 바탕색과 구별되는 선명한 색상, A4 기준 7포인트 이상으로 표시해야 합니다.",
    },
  ],
  prohibitedExpressions: [
    {
      id: "inv-p1",
      pattern: "원금.{0,5}(보장|보전)|손실.{0,3}(없|안)",
      description: "손실보전 또는 이익보장으로 오인하게 하는 표시",
      regulation: "영업규정 제2-38조 제1호",
      suggestion: "'투자원금의 손실이 발생할 수 있습니다' 문구로 대체하세요.",
    },
    {
      id: "inv-p2",
      pattern: "예상.{0,3}수익률|목표.{0,3}수익률|기대.{0,3}수익",
      description: "미실현수익률(예상수익률, 목표수익률 등) 표시",
      regulation: "영업규정 제2-38조 제3호",
      suggestion: "과거 운용실적만 표시하고 '과거의 운용실적이 미래의 수익을 보장하지 않습니다' 문구를 병기하세요.",
    },
    {
      id: "inv-p3",
      pattern: "확정.{0,3}수익|100%.{0,3}수익|무조건.{0,3}(이익|수익)",
      description: "확정적인 수익을 보장하는 것처럼 표시",
      regulation: "영업규정 제2-38조",
      suggestion: "수익 관련 단정적 표현을 삭제하세요.",
    },
    {
      id: "inv-p4",
      pattern: "사모.{0,5}(펀드|상품|투자)",
      description: "사모의 방법으로 발행하거나 발행된 금융투자상품에 관한 내용 표시",
      regulation: "영업규정 제2-38조 제6호",
      suggestion: "사모 상품은 투자광고 대상이 아닙니다.",
    },
  ],
  mandatoryStatements: [
    {
      id: "inv-m1",
      content: "투자원금의 손실이 발생할 수 있으며, 그 손실은 투자자에게 귀속됩니다.",
      regulation: "자본시장법 제57조제3항",
    },
    {
      id: "inv-m2",
      content: "과거의 운용실적이 미래의 수익을 보장하지 않습니다.",
      condition: "운용실적 표시 시",
      regulation: "영업규정 제2-37조제2항",
    },
    {
      id: "inv-m3",
      content: "집합투자증권을 취득하기 전에 투자설명서를 반드시 읽어보시기 바랍니다.",
      condition: "집합투자증권 광고 시",
      regulation: "자본시장법 제57조제3항",
    },
    {
      id: "inv-m4",
      content: "이 금융상품은 예금자보호법에 따라 보호되지 않습니다.",
      regulation: "영업규정 별표9",
    },
    {
      id: "inv-m5",
      content: "외화표시 상품의 경우 환율변동에 따라 원화 기준 투자원금의 손실이 발생할 수 있습니다.",
      condition: "외화표시 상품",
      regulation: "영업규정 별표9",
    },
  ],
  reviewProcess: [
    "1. 광고시안 제작 (부서별 담당자)",
    "2. 준법감시인 사전 승인 신청",
    "3. 준법감시인 검토 및 심의필 번호 부여",
    "4. 금융투자협회 심사 신청 (해당 시)",
    "5. 협회 심사결과 통보 (적격/부적격)",
    "6. 광고 시행 (심의필 번호 표시)",
  ],
  warnings: [
    "수익률 포함 광고의 유효기간: MMF 1개월, 펀드 광고 3개월",
    "수익률 미포함 광고의 유효기간: 1년",
    "영상매체 광고 시 위험고지시간은 총 광고시간의 1/3 이상이어야 합니다.",
    "TV 광고 시 위험고지는 전체화면의 1/5 이상 면적에 표시해야 합니다.",
  ],
};

// 보험 업종 가이드라인 (보험업법 기반)
export const INSURANCE_GUIDELINE: SectorGuideline = {
  sector: "Insurance",
  name: "보험",
  mainRegulations: [
    "보험업법",
    "보험업법 시행령",
    "보험업법 시행규칙",
    "금융소비자보호에 관한 법률",
  ],
  checklist: [
    {
      id: "ins-1",
      category: "의무 표시사항",
      item: "보험회사 명칭 표시",
      required: true,
      regulation: "보험업법",
      description: "광고에 보험회사의 명칭이 명확히 표시되어야 합니다.",
    },
    {
      id: "ins-2",
      category: "의무 표시사항",
      item: "보험상품 명칭 및 종류 표시",
      required: true,
      regulation: "보험업법",
      description: "보험상품의 명칭과 종류(생명/손해/제3보험)를 명확히 표시해야 합니다.",
    },
    {
      id: "ins-3",
      category: "의무 표시사항",
      item: "보험약관 확인 권유 문구",
      required: true,
      regulation: "보험업법, 금융소비자보호법",
      description: "계약 체결 전 보험약관을 반드시 확인할 것을 권유하는 문구가 포함되어야 합니다.",
    },
    {
      id: "ins-4",
      category: "의무 표시사항",
      item: "보장 제한사항 명시",
      required: true,
      regulation: "보험업법",
      description: "보장이 제한되는 사항(면책사항, 감액기간 등)을 명시해야 합니다.",
    },
    {
      id: "ins-5",
      category: "의무 표시사항",
      item: "해약환급금 안내",
      required: true,
      regulation: "보험업법",
      description: "해약 시 환급금이 납입보험료보다 적을 수 있음을 안내해야 합니다.",
    },
    {
      id: "ins-6",
      category: "변액보험",
      item: "원금손실 가능성 고지",
      required: true,
      regulation: "보험업법",
      description: "변액보험의 경우 투자실적에 따라 원금손실이 발생할 수 있음을 고지해야 합니다.",
    },
  ],
  prohibitedExpressions: [
    {
      id: "ins-p1",
      pattern: "무조건.{0,5}보장|전액.{0,5}보장|100%.{0,5}보장",
      description: "무조건적인 보장으로 오인하게 하는 표현",
      regulation: "보험업법",
      suggestion: "'약관에서 정한 조건에 따라 보장됩니다' 문구로 대체하세요.",
    },
    {
      id: "ins-p2",
      pattern: "무심사|심사.{0,3}(없|안)",
      description: "심사 없이 가입 가능한 것처럼 오인하게 하는 표현",
      regulation: "보험업법",
      suggestion: "'간편심사' 또는 '심사 절차가 있습니다' 등으로 정확히 표현하세요.",
    },
    {
      id: "ins-p3",
      pattern: "최고.{0,5}보장|최대.{0,5}보장",
      description: "객관적 근거 없이 최상급 표현 사용",
      regulation: "보험업법",
      suggestion: "객관적 근거를 명시하거나 최상급 표현을 삭제하세요.",
    },
    {
      id: "ins-p4",
      pattern: "원금.{0,5}보장",
      description: "변액보험 등에서 원금이 보장되는 것처럼 오인하게 하는 표현",
      regulation: "보험업법",
      suggestion: "'투자실적에 따라 원금손실이 발생할 수 있습니다' 문구를 추가하세요.",
    },
  ],
  mandatoryStatements: [
    {
      id: "ins-m1",
      content: "보장 내용은 약관에 따라 달라질 수 있으며, 해약 시 해약환급금이 납입보험료보다 적을 수 있습니다.",
      regulation: "보험업법",
    },
    {
      id: "ins-m2",
      content: "계약 체결 전 상품설명서 및 약관을 반드시 확인하시기 바랍니다.",
      regulation: "금융소비자보호에 관한 법률",
    },
    {
      id: "ins-m3",
      content: "이 보험은 예금자보호법에 따라 보호되지 않습니다.",
      condition: "변액보험",
      regulation: "보험업법",
    },
    {
      id: "ins-m4",
      content: "변액보험은 투자실적에 따라 원금손실이 발생할 수 있습니다.",
      condition: "변액보험",
      regulation: "보험업법",
    },
  ],
  reviewProcess: [
    "1. 광고시안 제작",
    "2. 내부 준법감시인 검토",
    "3. 보험협회 심의 (해당 시)",
    "4. 광고 심의필 번호 부여",
    "5. 광고 시행",
  ],
  warnings: [
    "보험설계사, 보험대리점, 보험중개사만 보험계약의 체결을 중개하거나 대리할 수 있습니다.",
    "보험상품의 비교 광고 시 객관적인 근거를 명시해야 합니다.",
    "질병, 상해 등 보장 제한사항을 명확히 안내해야 합니다.",
  ],
};

// 업종별 가이드라인 매핑
export const SECTOR_GUIDELINES: Record<Sector, SectorGuideline> = {
  Bank: BANK_GUIDELINE,
  Card: CARD_GUIDELINE,
  Investment: INVESTMENT_GUIDELINE,
  Insurance: INSURANCE_GUIDELINE,
};
