export type Sector = "은행" | "카드" | "증권" | "라이프";

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
    type: "consumer_protection",
    label: "소비자보호부",
    description: "소비자 관점에서 광고를 검토하고 승인합니다",
    color: "teal",
  },
  {
    type: "compliance_officer",
    label: "준법감시인",
    description: "소비자보호부 승인 후 최종 승인/반려합니다",
    color: "purple",
  },
];

// 기안 문서 상태
// pending: 소비자보호부 심사 대기
// consumer_approved: 소비자보호부 승인 완료 (준법감시인 심사 대기)
// approved: 최종 승인 (준법감시인 승인)
// rejected: 반려
// review_requested: 수정 요청
export type DraftStatus = "pending" | "consumer_approved" | "approved" | "rejected" | "review_requested";

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
  status: "승인" | "조건부 승인" | "반려";
  riskLevel: "High" | "Low";
  violations: string[];
  matchedHistory: HistoryItem | null;
  suggestions: string[];
  correctedContent?: string;
}

export const REGULATIONS: Regulation[] = [
  {
    sector: "은행",
    keywords: ["무조건", "확정금리", "확정 수익", "원금 보장"],
    required: ["예금자보호법 문구"],
    riskLevel: "High",
    suggestion: "금리는 가입 조건에 따라 달라질 수 있습니다.",
  },
  {
    sector: "카드",
    keywords: ["무이자", "평생 무료", "최대 할인"],
    required: ["연회비 안내", "이용 조건"],
    riskLevel: "Low",
    suggestion: "할인 및 혜택은 이용 조건에 따라 달라질 수 있습니다.",
  },
  {
    sector: "증권",
    keywords: ["원금보장", "손실 없음", "확정 수익", "무조건", "100% 수익"],
    required: ["투자자 유의사항", "원금손실 가능성"],
    riskLevel: "High",
    suggestion: "투자 원금의 손실이 발생할 수 있습니다.",
  },
  {
    sector: "라이프",
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
  은행: [
    { label: "예금자보호법 문구 포함", type: "checkbox", required: true },
    { label: "금리 정보 명시", type: "checkbox", required: true },
  ],
  카드: [
    { label: "연회비 정보 포함", type: "checkbox", required: true },
    { label: "혜택 조건 명시", type: "checkbox", required: false },
  ],
  증권: [
    { label: "투자 위험 고지 포함", type: "checkbox", required: true },
    { label: "원금손실 가능성 명시", type: "checkbox", required: true },
  ],
  라이프: [
    { label: "보험약관 확인 문구 포함", type: "checkbox", required: true },
    { label: "보장 제한 사항 명시", type: "checkbox", required: false },
  ],
};

// ============================================
// 그룹사별 상세 가이드라인 (PDF 분석 기반)
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

// 은행 그룹사 가이드라인 (은행 광고심의 기준 기반)
export const BANK_GUIDELINE: SectorGuideline = {
  sector: "은행",
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
      pattern: "최상|최저|최초|1위|제일|유일",
      description: "객관적 근거 없는 최상급 표현 사용",
      regulation: "은행 광고심의 기준 제17조 제5호",
      suggestion: "객관적 근거가 있는 사실이나 공인된 자료를 명시하세요.",
    },
    {
      id: "bank-p3",
      pattern: "무조건|확실",
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

// 카드 그룹사 가이드라인 (여신전문금융업법 기반)
export const CARD_GUIDELINE: SectorGuideline = {
  sector: "카드",
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

// 증권 그룹사 가이드라인 (자본시장법, 금융투자업규정 기반)
export const INVESTMENT_GUIDELINE: SectorGuideline = {
  sector: "증권",
  name: "증권",
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

// 라이프 그룹사 가이드라인 (보험업법 기반)
export const INSURANCE_GUIDELINE: SectorGuideline = {
  sector: "라이프",
  name: "라이프",
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

// 그룹사별 가이드라인 매핑
export const SECTOR_GUIDELINES: Record<Sector, SectorGuideline> = {
  은행: BANK_GUIDELINE,
  카드: CARD_GUIDELINE,
  증권: INVESTMENT_GUIDELINE,
  라이프: INSURANCE_GUIDELINE,
};
export const PRODUCTS = [
    {
      "id": "SH-001",
      "product_name": "청년 처음적금",
      "target_audience": "가입일 현재 만 18세 이상 ~ 만 19세 이하 실명의 개인 (1인 1계좌)",
      "term": "12개월",
      "savings_limit": "월 30만원",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.80%",
        "max_rate": "연 5.80%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다. 예금잔액증명서 발급 당일에는 입금,출급,이체 등 잔액 변동이 불가합니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "미성년자의 경우 중도해지는 법정대리인을 통해서만 가능하므로, 영업점에서 해지 가능합니다. 기타 자세한 사항은 반드시 상품설명서를 참조하시거나 영업점, 고객상담센터(1577-8000)로 문의하여주시기 바랍니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '1억원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-002",
      "product_name": "SOL 모임적금",
      "target_audience": "모임장을 포함한 모임원이 2인 이상 100인 이하로 구성된 모임의 모임장으로 만 17세 이상 실명의 개인 및 개인사업자 (1인 최대 5계좌)",
      "term": "3개월 이상 12개월 이내 (월 단위 가입 가능)",
      "savings_limit": "1만원 이상 월 100만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.60%",
        "max_rate": "연 4.10%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다. 예금잔액증명서 발급 당일에는 입금,출급,이체 등 잔액 변동이 불가합니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "미성년자의 경우 중도해지는 법정대리인을 통해서만 가능하므로, 영업점에서 해지 가능합니다. 기타 자세한 사항은 반드시 상품설명서를 참조하시거나 영업점, 고객상담센터(1577-8000)로 문의하여주시기 바랍니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '1억원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-003",
      "product_name": "신한 알.쏠 적금",
      "target_audience": "실명의 개인",
      "term": "12개월 이상 36개월 이내",
      "savings_limit": "1천원 이상 월 300만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.45%",
        "max_rate": "연 3.75%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다. 예금잔액증명서 발급 당일에는 입금,출급,이체 등 잔액 변동이 불가합니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "미성년자의 경우 중도해지는 법정대리인을 통해서만 가능하므로, 영업점에서 해지 가능합니다. 기타 자세한 사항은 반드시 상품설명서를 참조하시거나 영업점, 고객상담센터(1577-8000)로 문의하여주시기 바랍니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '1억원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-004",
      "product_name": "신한 안녕, 반가워 적금",
      "target_audience": "적금 가입일 직전 1년간 신한은행 적금(청약 제외) 보유 이력이 없는 실명의 개인",
      "term": "12개월",
      "savings_limit": "월 50만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.50%",
        "max_rate": "연 5.50%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다. 예금잔액증명서 발급 당일에는 입금,출급,이체 등 잔액 변동이 불가합니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "중도해지 시 약정된 이율보다 낮은 중도해지이율이 적용됩니다. 우대이자율은 만기 해지 시에만 적용됩니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-005",
      "product_name": "신한 쏠편한 정기예금",
      "target_audience": "실명의 개인 및 개인사업자",
      "term": "1개월 이상 60개월 이내 (일 단위 가입 가능)",
      "savings_limit": "최소 1만원 이상 (제한 없음)",
      "interest_payment_method": "만기일시지급식 또는 월이자지급식",
      "partial_withdrawal_allowed": "2회 가능 (잔액 1만원 이상 유지 시)",
      "joint_name_allowed": false,
      "reinvestment_allowed": true,
      "interest_rates": {
        "base_rate": "연 3.00%",
        "max_rate": "연 3.05%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "모바일 전용 상품으로 영업점 창구에서는 해지만 가능합니다. 만기 자동재예치 설정이 가능합니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-006",
      "product_name": "신한 청년저축왕 적금",
      "target_audience": "만 18세 이상 만 39세 이하 실명의 개인",
      "term": "12개월, 24개월, 36개월",
      "savings_limit": "월 1천원 이상 30만원 이하",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 3.35%",
        "max_rate": "연 5.65%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "가입대상 연령 확인을 위해 신분증 등 증빙서류 제출이 필요할 수 있습니다. 특별우대금리는 조건 충족 시 만기 해지 계좌에 한해 제공됩니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-007",
      "product_name": "신한 40주 맘(Mom) 적금",
      "target_audience": "임신 중인 여성 고객 (1인 1계좌)",
      "term": "40주 (약 10개월)",
      "savings_limit": "최대 월 100만원",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.50%",
        "max_rate": "연 4.50%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "가입 시 또는 만기 해지 시 임신확인서, 산모수첩 등 증빙서류 제출이 필요합니다. 출산 축하금 등 부가 혜택이 있을 수 있습니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-008",
      "product_name": "신한 주거래 우대적금",
      "target_audience": "실명의 개인 및 개인사업자",
      "term": "12개월, 24개월, 36개월",
      "savings_limit": "1천원 이상 월 100만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": true,
      "interest_rates": {
        "base_rate": "연 2.25%",
        "max_rate": "연 3.85%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "급여이체 또는 연금수령 실적에 따라 우대이자율이 적용됩니다. 자동재예치 신청 시 원금과 이자가 재예치될 수 있습니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-009",
      "product_name": "신한 가맹점 스윙(Swing) 적금",
      "target_audience": "신한은행 결제계좌를 보유한 개인사업자",
      "term": "6개월, 12개월",
      "savings_limit": "월 300만원 이내 (일 10만원 이내 스윙)",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.40%",
        "max_rate": "연 3.40%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "카드매출 입금액 중 일정 금액을 적금으로 자동 이체하는 상품입니다. 사업자등록증 확인이 필요합니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-010",
      "product_name": "신한 마이홈 적금",
      "target_audience": "주택청약종합저축을 보유하지 않은 실명의 개인 (1인 1계좌)",
      "term": "12개월",
      "savings_limit": "월 20만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.60%",
        "max_rate": "연 4.60%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "주택청약종합저축을 신규 가입하고 당행 계좌로 자동이체 등록 시 우대금리가 제공됩니다. 중도해지 시 우대금리는 적용되지 않습니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-011",
      "product_name": "신한 S드림 정기예금",
      "target_audience": "실명의 개인, 법인",
      "term": "1개월 이상 60개월 이내",
      "savings_limit": "300만원 이상",
      "interest_payment_method": "만기일시지급식 또는 월이자지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": true,
      "interest_rates": {
        "base_rate": "연 2.60%",
        "max_rate": "연 2.80%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "영업점 가입 전용 상품입니다. 만기 시 자동해지 서비스 신청이 가능합니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-012",
      "product_name": "신한 군인행복 적금",
      "target_audience": "복무 중인 군인 및 입영 예정자",
      "term": "12개월 이상 24개월 이내",
      "savings_limit": "월 50만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 3.00%",
        "max_rate": "연 4.50%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "가입 시 복무확인서, 입영통지서 등 증빙서류 제출이 필수입니다. 1인 1계좌만 가입 가능합니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-013",
      "product_name": "2024 신한 프로야구 적금",
      "target_audience": "실명의 개인 (1인 1계좌)",
      "term": "12개월",
      "savings_limit": "1천원 이상 월 50만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 3.00%",
        "max_rate": "연 4.20%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "응원하는 구단의 성적에 따라 우대금리가 차등 적용됩니다. 프로야구 시즌 한정 판매 상품입니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-014",
      "product_name": "신한 쏠편한 선물하는 적금",
      "target_audience": "실명의 개인",
      "term": "6개월",
      "savings_limit": "월 30만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 3.20%",
        "max_rate": "연 4.00%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "타인에게 선물할 수 있는 적금 상품입니다. 선물 받는 사람이 수락해야 계좌 개설이 완료됩니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-015",
      "product_name": "신한 두배드림(Dream) 적금",
      "target_audience": "실명의 개인 (1인 1계좌)",
      "term": "24개월",
      "savings_limit": "월 100만원",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.80%",
        "max_rate": "연 5.60%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "본인 납입 원금이 500만원 또는 1,000만원 달성 시 우대금리가 적용되어 이자가 두 배가 되는 구조입니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-016",
      "product_name": "신한 스마트 적금",
      "target_audience": "실명의 개인 (1인 1계좌)",
      "term": "12개월",
      "savings_limit": "월 100만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": true,
      "interest_rates": {
        "base_rate": "연 3.00%",
        "max_rate": "연 3.50%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "스마트폰 뱅킹 전용 상품으로 조건 없이 간편하게 가입 가능한 상품입니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-017",
      "product_name": "신한 ISA 정기예금",
      "target_audience": "신한은행 ISA(개인종합자산관리계좌) 보유 고객",
      "term": "3개월, 6개월, 12개월",
      "savings_limit": "ISA 계좌 납입 한도 내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가 (ISA 계좌 해지 시 가능)",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 3.10%",
        "max_rate": "연 3.10%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "ISA 계좌 내에서 운용되는 예금으로 비과세 혜택을 받을 수 있는 상품입니다. 일반 정기예금과 달리 단독 가입이 불가합니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-018",
      "product_name": "신한 새희망 적금",
      "target_audience": "기초생활수급자, 차상위계층, 장애인 등 사회소외계층",
      "term": "36개월",
      "savings_limit": "월 20만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "불가",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 4.50%",
        "max_rate": "연 6.00%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "가입 대상 증빙서류(수급자 증명서 등) 원본 제출이 필요하며, 영업점 창구에서만 가입 가능합니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-019",
      "product_name": "신한 119생명지킴이 적금",
      "target_audience": "전국 소방공무원 및 의용소방대원",
      "term": "12개월 이상 36개월 이내",
      "savings_limit": "월 30만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 3.00%",
        "max_rate": "연 4.00%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "소방공무원증 또는 재직증명서 확인이 필요합니다. 공익적 목적으로 우대금리를 제공하는 상품입니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    },
    {
      "id": "SH-020",
      "product_name": "신한 쏠만해 적금",
      "target_audience": "신한 쏠(SOL) 가입 및 신한카드 사용 고객",
      "term": "12개월",
      "savings_limit": "월 30만원 이내",
      "interest_payment_method": "만기일시지급식",
      "partial_withdrawal_allowed": "2회 가능",
      "joint_name_allowed": false,
      "reinvestment_allowed": false,
      "interest_rates": {
        "base_rate": "연 2.50%",
        "max_rate": "연 5.00%"
      },
      "payout_restrictions": "계좌에 압류, 가압류, 질권설정 등이 등록될 경우 원금 및 이자 지급이 제한됩니다.",
      "data_access_right": "금융소비자는 분쟁조정 또는 소송의 수행 등 권리 구제를 위한 목적으로 은행이 기록 및 유지·관리하는 계약에 관련한 자료에 대해 열람을 요구할 수 있습니다.",
      "important_notes": "모바일 전용 상품으로 모바일 뱅킹 신규 가입 등의 조건 달성 시 우대금리가 적용됩니다.",
      "deposit_protection": "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 '5천만원까지' (본 은행의 여타 보호상품과 합산) 보호됩니다."
    }
  ];

// 카드 상품 DB
export const CARD_PRODUCTS = [
  {
    id: "SC-001",
    product_name: "신한카드 Deep Dream",
    card_type: "신용카드",
    annual_fee: "국내전용 15,000원 / 해외겸용 18,000원",
    target_audience: "20~40대 디지털 라이프 고객",
    main_benefits: [
      "온라인 쇼핑 5% 할인",
      "스트리밍 서비스 10% 할인",
      "배달앱 5% 할인"
    ],
    benefit_limit: "월 최대 1만원",
    minimum_usage: "전월 30만원 이상 이용 시",
    interest_rate: {
      card_loan: "연 5.9% ~ 19.9%",
      cash_advance: "연 10.0% ~ 23.0%",
      overdue: "연 24.0%"
    },
    important_notes: "신용카드 발급은 개인 신용도에 따라 발급이 제한될 수 있습니다. 카드 이용대금과 이자는 매월 결제일에 상환해야 합니다."
  },
  {
    id: "SC-002",
    product_name: "신한카드 Mr.Life",
    card_type: "신용카드",
    annual_fee: "국내전용 12,000원 / 해외겸용 15,000원",
    target_audience: "생활밀착형 혜택을 원하는 30~50대",
    main_benefits: [
      "대형마트 5% 할인",
      "주유 리터당 60원 할인",
      "통신비 5% 할인",
      "공과금 자동이체 1% 할인"
    ],
    benefit_limit: "월 최대 15,000원",
    minimum_usage: "전월 40만원 이상 이용 시",
    interest_rate: {
      card_loan: "연 5.9% ~ 19.9%",
      cash_advance: "연 10.0% ~ 23.0%",
      overdue: "연 24.0%"
    },
    important_notes: "할인 혜택은 이용 조건에 따라 달라질 수 있습니다. 자세한 내용은 상품설명서를 참조하세요."
  },
  {
    id: "SC-003",
    product_name: "신한카드 taptap O",
    card_type: "신용카드",
    annual_fee: "없음 (연회비 무료)",
    target_audience: "간편결제 선호 고객",
    main_benefits: [
      "간편결제 7% 적립",
      "온라인 결제 5% 적립",
      "교통 5% 적립"
    ],
    benefit_limit: "월 최대 5,000포인트",
    minimum_usage: "없음",
    interest_rate: {
      card_loan: "연 6.5% ~ 19.9%",
      cash_advance: "연 11.0% ~ 23.0%",
      overdue: "연 24.0%"
    },
    important_notes: "적립된 포인트는 1포인트 = 1원으로 사용 가능합니다. 포인트 유효기간은 적립일로부터 5년입니다."
  },
  {
    id: "SC-004",
    product_name: "신한카드 The CLASSIC",
    card_type: "신용카드 (프리미엄)",
    annual_fee: "100,000원",
    target_audience: "프리미엄 혜택을 원하는 고소득 고객",
    main_benefits: [
      "공항 라운지 무료 이용 (연 4회)",
      "발렛파킹 서비스 (연 12회)",
      "호텔 할인 15%",
      "골프장 그린피 할인"
    ],
    benefit_limit: "서비스별 상이",
    minimum_usage: "전월 100만원 이상 이용 시",
    interest_rate: {
      card_loan: "연 4.9% ~ 17.9%",
      cash_advance: "연 9.0% ~ 21.0%",
      overdue: "연 24.0%"
    },
    important_notes: "프리미엄 서비스는 사전 예약이 필요할 수 있습니다. 서비스 제공 업체 사정에 따라 변경될 수 있습니다."
  },
  {
    id: "SC-005",
    product_name: "신한카드 체크 SOL",
    card_type: "체크카드",
    annual_fee: "없음",
    target_audience: "신한은행 계좌 보유 고객",
    main_benefits: [
      "편의점 5% 할인",
      "커피전문점 10% 할인",
      "대중교통 5% 적립"
    ],
    benefit_limit: "월 최대 5,000원",
    minimum_usage: "없음",
    interest_rate: {
      card_loan: "해당없음",
      cash_advance: "해당없음",
      overdue: "해당없음"
    },
    important_notes: "체크카드는 연결된 계좌 잔액 범위 내에서 결제됩니다. 잔액 부족 시 결제가 거절될 수 있습니다."
  },
  {
    id: "SC-006",
    product_name: "신한카드 GREAT",
    card_type: "신용카드",
    annual_fee: "국내전용 30,000원 / 해외겸용 35,000원",
    target_audience: "해외 이용이 많은 고객",
    main_benefits: [
      "해외 가맹점 3% 캐시백",
      "해외 직구 5% 할인",
      "면세점 7% 할인",
      "환전 수수료 50% 우대"
    ],
    benefit_limit: "월 최대 30,000원",
    minimum_usage: "전월 50만원 이상 이용 시",
    interest_rate: {
      card_loan: "연 5.5% ~ 18.9%",
      cash_advance: "연 10.0% ~ 22.0%",
      overdue: "연 24.0%"
    },
    important_notes: "해외 이용 시 국제브랜드 수수료가 별도 부과될 수 있습니다. 환율 변동에 따라 결제금액이 달라질 수 있습니다."
  },
  {
    id: "SC-007",
    product_name: "신한카드 Lady Classic",
    card_type: "신용카드",
    annual_fee: "국내전용 20,000원 / 해외겸용 25,000원",
    target_audience: "20~40대 여성 고객",
    main_benefits: [
      "뷰티/화장품 10% 할인",
      "백화점 5% 할인",
      "헬스/필라테스 10% 할인",
      "카페 5% 할인"
    ],
    benefit_limit: "월 최대 20,000원",
    minimum_usage: "전월 40만원 이상 이용 시",
    interest_rate: {
      card_loan: "연 5.9% ~ 19.9%",
      cash_advance: "연 10.0% ~ 23.0%",
      overdue: "연 24.0%"
    },
    important_notes: "할인 가맹점은 변경될 수 있습니다. 최신 가맹점 정보는 홈페이지에서 확인하세요."
  },
  {
    id: "SC-008",
    product_name: "신한카드 S-Line",
    card_type: "신용카드",
    annual_fee: "국내전용 10,000원",
    target_audience: "사회초년생, 대학생",
    main_benefits: [
      "영화 50% 할인 (월 2회)",
      "편의점 5% 할인",
      "대중교통 10% 적립"
    ],
    benefit_limit: "월 최대 10,000원",
    minimum_usage: "전월 20만원 이상 이용 시",
    interest_rate: {
      card_loan: "연 7.9% ~ 19.9%",
      cash_advance: "연 12.0% ~ 23.0%",
      overdue: "연 24.0%"
    },
    important_notes: "첫 해 연회비 면제 혜택이 제공됩니다. 영화 할인은 제휴 극장에서만 적용됩니다."
  }
];

// 증권 상품 DB
export const INVESTMENT_PRODUCTS = [
  {
    id: "SI-001",
    product_name: "신한 글로벌 AI 테크 펀드",
    product_type: "주식형 펀드",
    risk_level: "높음 (5등급 중 2등급)",
    investment_target: "글로벌 AI/반도체/클라우드 관련 기업",
    minimum_investment: "10,000원",
    management_fee: "연 1.5%",
    sales_fee: "선취 1.0% (온라인 0.5%)",
    redemption_period: "환매청구일 + 3영업일",
    past_performance: {
      "1년": "+32.5%",
      "3년": "+87.2%",
      "설정이후": "+124.8%"
    },
    important_notes: "이 금융상품은 예금자보호법에 따라 보호되지 않습니다. 투자원금의 손실이 발생할 수 있으며, 그 손실은 투자자에게 귀속됩니다. 과거의 운용실적이 미래의 수익을 보장하지 않습니다."
  },
  {
    id: "SI-002",
    product_name: "신한 코리아 밸류업 펀드",
    product_type: "주식형 펀드",
    risk_level: "높음 (5등급 중 2등급)",
    investment_target: "국내 저평가 우량주, 밸류업 프로그램 참여 기업",
    minimum_investment: "10,000원",
    management_fee: "연 1.2%",
    sales_fee: "선취 0.8% (온라인 0.3%)",
    redemption_period: "환매청구일 + 3영업일",
    past_performance: {
      "1년": "+18.7%",
      "3년": "+42.3%",
      "설정이후": "+65.1%"
    },
    important_notes: "이 금융상품은 예금자보호법에 따라 보호되지 않습니다. 투자원금의 손실이 발생할 수 있으며, 그 손실은 투자자에게 귀속됩니다."
  },
  {
    id: "SI-003",
    product_name: "신한 글로벌 배당 인컴 펀드",
    product_type: "혼합형 펀드",
    risk_level: "보통 (5등급 중 3등급)",
    investment_target: "글로벌 고배당 주식 및 채권",
    minimum_investment: "100,000원",
    management_fee: "연 1.0%",
    sales_fee: "선취 0.5%",
    redemption_period: "환매청구일 + 4영업일",
    past_performance: {
      "1년": "+8.2%",
      "3년": "+21.5%",
      "설정이후": "+38.7%"
    },
    dividend_frequency: "분기배당",
    important_notes: "배당금은 운용성과에 따라 변동될 수 있습니다. 외화 자산 투자로 인한 환율 변동 위험이 있습니다."
  },
  {
    id: "SI-004",
    product_name: "신한 국공채 안정형 펀드",
    product_type: "채권형 펀드",
    risk_level: "낮음 (5등급 중 4등급)",
    investment_target: "국채, 지방채, 특수채 등 우량 채권",
    minimum_investment: "10,000원",
    management_fee: "연 0.4%",
    sales_fee: "없음",
    redemption_period: "환매청구일 + 2영업일",
    past_performance: {
      "1년": "+4.1%",
      "3년": "+9.8%",
      "설정이후": "+18.2%"
    },
    important_notes: "채권형 펀드도 금리 변동에 따라 원금 손실이 발생할 수 있습니다. 이 금융상품은 예금자보호법에 따라 보호되지 않습니다."
  },
  {
    id: "SI-005",
    product_name: "신한 MMF (법인용)",
    product_type: "MMF",
    risk_level: "매우 낮음 (5등급 중 5등급)",
    investment_target: "단기 금융상품 (CD, CP, 콜론 등)",
    minimum_investment: "1,000,000원",
    management_fee: "연 0.2%",
    sales_fee: "없음",
    redemption_period: "당일 환매 가능 (15시 이전)",
    past_performance: {
      "1년": "+3.5%",
      "3년": "+8.2%"
    },
    important_notes: "MMF는 실적배당상품으로 예금자보호법에 따라 보호되지 않습니다. 다만, 원금손실 위험이 매우 낮은 상품입니다."
  },
  {
    id: "SI-006",
    product_name: "신한 TDF 2045",
    product_type: "타겟데이트펀드 (TDF)",
    risk_level: "보통 (5등급 중 3등급)",
    investment_target: "글로벌 주식/채권 (은퇴시점에 맞춰 자동 조정)",
    minimum_investment: "10,000원",
    management_fee: "연 0.8%",
    sales_fee: "없음 (연금저축 전용)",
    redemption_period: "환매청구일 + 4영업일",
    target_date: "2045년",
    past_performance: {
      "1년": "+12.3%",
      "3년": "+28.7%",
      "설정이후": "+45.2%"
    },
    important_notes: "은퇴시점이 가까워질수록 채권 비중이 자동으로 높아집니다. 연금저축계좌에서 가입 시 세제혜택을 받을 수 있습니다."
  },
  {
    id: "SI-007",
    product_name: "신한 S&P500 인덱스 펀드",
    product_type: "인덱스 펀드",
    risk_level: "높음 (5등급 중 2등급)",
    investment_target: "미국 S&P500 지수 추종",
    minimum_investment: "10,000원",
    management_fee: "연 0.3%",
    sales_fee: "없음",
    redemption_period: "환매청구일 + 4영업일",
    past_performance: {
      "1년": "+24.8%",
      "3년": "+52.1%",
      "설정이후": "+98.5%"
    },
    important_notes: "환헤지를 하지 않아 환율 변동에 따른 손익이 발생할 수 있습니다. 미국 주식시장 변동에 따라 원금 손실이 발생할 수 있습니다."
  },
  {
    id: "SI-008",
    product_name: "신한 ELS 제2024-123호",
    product_type: "주가연계증권 (ELS)",
    risk_level: "높음 (5등급 중 2등급)",
    investment_target: "삼성전자, SK하이닉스 (2종목 연계)",
    minimum_investment: "1,000,000원",
    management_fee: "없음",
    sales_fee: "없음",
    maturity: "3년 (6개월 단위 조기상환 가능)",
    expected_return: "연 8.5% (조건 충족 시)",
    knock_in_barrier: "기초자산 50% 하락 시",
    important_notes: "원금비보장 상품입니다. 기초자산 가격이 녹인 배리어 이하로 하락할 경우 원금 손실이 발생할 수 있습니다. 조기상환 조건을 충족하지 못하면 만기까지 투자금이 묶일 수 있습니다."
  }
];

// 라이프 (보험) 상품 DB
export const LIFE_PRODUCTS = [
  {
    id: "SL-001",
    product_name: "신한 무배당 간편정기보험",
    product_type: "정기보험",
    insurance_period: "10년/20년/30년 만기",
    payment_period: "전기납, 10년납, 20년납",
    target_audience: "간편한 심사로 사망보장을 원하는 고객",
    main_coverage: [
      "사망보험금 최대 3억원",
      "재해사망 추가보장",
      "고도장해 보험금"
    ],
    monthly_premium_example: "40세 남성, 1억원 보장, 20년납 기준 약 35,000원",
    underwriting: "간편심사 (3가지 고지사항)",
    important_notes: "보장 내용은 약관에 따라 달라질 수 있습니다. 해약 시 해약환급금이 납입보험료보다 적을 수 있습니다. 계약 체결 전 상품설명서 및 약관을 반드시 확인하시기 바랍니다."
  },
  {
    id: "SL-002",
    product_name: "신한 무배당 종신보험 (무해약환급금형)",
    product_type: "종신보험",
    insurance_period: "종신",
    payment_period: "10년납, 15년납, 20년납, 30년납",
    target_audience: "평생 사망보장과 상속 준비를 원하는 고객",
    main_coverage: [
      "사망보험금 최대 10억원",
      "암/뇌/심장 진단 시 보험료 납입면제",
      "장해연금 선택 가능"
    ],
    monthly_premium_example: "35세 남성, 1억원 보장, 20년납 기준 약 180,000원",
    underwriting: "표준심사",
    important_notes: "무해약환급금형은 납입기간 중 해약 시 환급금이 없습니다. 납입완료 후에도 해약환급금이 일반형 대비 적습니다."
  },
  {
    id: "SL-003",
    product_name: "신한 무배당 건강보험 플러스",
    product_type: "건강보험 (실손형)",
    insurance_period: "15년 갱신형",
    payment_period: "전기납",
    target_audience: "의료비 보장을 원하는 모든 연령대",
    main_coverage: [
      "입원의료비 (급여 90%, 비급여 80%)",
      "통원의료비 (외래/처방조제비)",
      "암/뇌혈관/심장질환 진단비",
      "수술비 특약"
    ],
    monthly_premium_example: "30세 남성 기준 약 45,000원 (특약 포함)",
    underwriting: "표준심사",
    important_notes: "실손의료비는 실제 부담한 의료비를 보상하며, 다른 실손보험과 중복 가입 시 비례보상됩니다. 15년마다 갱신되며 갱신 시 보험료가 인상될 수 있습니다."
  },
  {
    id: "SL-004",
    product_name: "신한 무배당 어린이보험 꿈나무",
    product_type: "어린이보험",
    insurance_period: "30세/100세 만기",
    payment_period: "10년납, 15년납, 20년납",
    target_audience: "0세~15세 자녀를 둔 부모",
    main_coverage: [
      "소아암/백혈병 진단비 5,000만원",
      "입원일당 5만원",
      "골절/화상 진단비",
      "학교폭력 피해 보장",
      "자녀배상책임 1억원"
    ],
    monthly_premium_example: "5세 남아, 100세 만기, 20년납 기준 약 85,000원",
    underwriting: "간편심사",
    important_notes: "태아 가입 시 출생 후 선천이상 보장이 가능합니다. 보장 내용은 가입 시 선택한 특약에 따라 달라집니다."
  },
  {
    id: "SL-005",
    product_name: "신한 무배당 연금보험 (공시이율형)",
    product_type: "연금보험",
    insurance_period: "종신연금/확정연금 선택",
    payment_period: "5년납, 10년납, 20년납, 일시납",
    target_audience: "노후 준비를 원하는 30~50대",
    main_coverage: [
      "연금개시 후 종신 또는 확정기간 연금 지급",
      "사망 시 유족연금 지급",
      "연금개시 전 사망 시 기납입보험료 환급"
    ],
    monthly_premium_example: "40세, 20년납, 월 50만원 납입 시 65세부터 월 약 75만원 수령 (예시)",
    interest_rate: "공시이율 연 3.5% (2024년 1월 기준, 변동)",
    important_notes: "공시이율은 매월 변동되며, 최저보증이율(연 1.0%)이 적용됩니다. 연금 수령액은 납입보험료, 적립기간, 공시이율에 따라 달라집니다. 중도해약 시 원금손실이 발생할 수 있습니다."
  },
  {
    id: "SL-006",
    product_name: "신한 무배당 변액유니버셜종신보험",
    product_type: "변액종신보험",
    insurance_period: "종신",
    payment_period: "10년납, 15년납, 20년납",
    target_audience: "사망보장과 투자를 동시에 원하는 고객",
    main_coverage: [
      "사망보험금 (기본보험금 + 변액보험금)",
      "펀드 선택 운용 (주식형/채권형/혼합형)",
      "추가납입/중도인출 가능"
    ],
    monthly_premium_example: "35세 남성, 기본보험금 1억원, 20년납 기준 약 250,000원",
    fund_options: ["글로벌주식형", "국내주식형", "채권형", "안정혼합형"],
    important_notes: "이 보험은 예금자보호법에 따라 보호되지 않습니다. 투자실적에 따라 사망보험금이 변동되며, 최저사망보험금이 보장됩니다. 펀드 운용 결과에 따라 원금손실이 발생할 수 있습니다."
  },
  {
    id: "SL-007",
    product_name: "신한 무배당 치아보험",
    product_type: "치아보험",
    insurance_period: "10년 갱신형",
    payment_period: "전기납",
    target_audience: "치과 치료비 부담을 줄이고 싶은 고객",
    main_coverage: [
      "보존치료 (충전, 크라운) 연간 3회",
      "보철치료 (임플란트, 브릿지, 틀니) 연간 2개",
      "치주치료 (스케일링, 잇몸치료)",
      "영구치 발치"
    ],
    monthly_premium_example: "30세 기준 약 25,000원",
    waiting_period: "보존치료 90일, 보철치료 1년",
    important_notes: "면책기간 및 감액기간이 적용됩니다. 보철치료는 가입 후 1년 이후부터 보장됩니다. 10년마다 갱신되며 갱신 시 보험료가 인상될 수 있습니다."
  },
  {
    id: "SL-008",
    product_name: "신한 무배당 간병인지원보험",
    product_type: "간병보험",
    insurance_period: "80세/100세 만기",
    payment_period: "10년납, 20년납, 전기납",
    target_audience: "노후 간병비용 준비를 원하는 40~60대",
    main_coverage: [
      "장기요양 1~2등급 판정 시 간병자금 3,000만원",
      "장기요양 3~5등급 판정 시 간병자금 1,500만원",
      "치매진단비 1,000만원",
      "간병인사용일당 10만원 (최대 180일)"
    ],
    monthly_premium_example: "50세, 80세 만기, 20년납 기준 약 65,000원",
    underwriting: "표준심사",
    important_notes: "장기요양등급 판정은 국민건강보험공단의 기준에 따릅니다. 보장 내용은 약관에서 정한 조건에 따라 달라질 수 있습니다."
  }
];

// 그룹사별 상품 매핑
export const SECTOR_PRODUCTS: Record<Sector, typeof PRODUCTS | typeof CARD_PRODUCTS | typeof INVESTMENT_PRODUCTS | typeof LIFE_PRODUCTS> = {
  은행: PRODUCTS,
  카드: CARD_PRODUCTS,
  증권: INVESTMENT_PRODUCTS,
  라이프: LIFE_PRODUCTS,
};