// 은행 업무 광고 점검표 - [별표9] 기반
// 금융소비자보호법: (금), 표시·광고의 공정화에 관한 법률: (표), 금융 지주회사법:(지)
// (은)기: 은행연합회 광고심의 기준, (지) 추천보증: 금융상품 등의 표시광고에 관한 심사 지침

export type ChecklistCategory = "공통" | "이벤트";
export type ChecklistSubCategory = "형식" | "의무표시 사항" | "금지사항" | "그룹사 공동광고" | "";

export type CheckResult = "적정" | "부적정" | "해당없음" | "미검토";

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  subCategory: ChecklistSubCategory;
  no: number;
  relatedLaw: string;
  checkPoint: string;
  example?: string;
  result: CheckResult;
  comment: string;
}

export interface ChecklistReview {
  items: ChecklistItem[];
  reviewerName: string;
  reviewDate: Date | null;
  overallResult: "적정" | "부적정" | "조건부적정" | "미완료";
  generalComment: string;
}

// 은행 업무 광고 점검표 항목
export const BANK_CHECKLIST_ITEMS: Omit<ChecklistItem, "result" | "comment">[] = [
  // 공통 - 형식
  {
    id: "common-form-1",
    category: "공통",
    subCategory: "형식",
    no: 1,
    relatedLaw: "(금) 22⑦/ 영19①, (은)기",
    checkPoint: "광고에 관한 글자크기, 폰트, 글자색, 배치 등을 준수하였는지 여부",
    example: "글자의 색깔·크기(12포인트 이상, A4용지 고딕체 기준) 또는 음성의 속도·크기 등 준수",
  },
  {
    id: "common-form-2",
    category: "공통",
    subCategory: "형식",
    no: 2,
    relatedLaw: "(금) 22⑦/ 영19①",
    checkPoint: "광고의 내용을 쉽게 이해할 수 있도록 광고에서 글자의 색깔·크기 또는 음성의 속도·크기 등이 해당 상품으로 인해 금융소비자가 받을 수 있는 혜택과 균형을 이루는지 여부",
  },

  // 공통 - 의무표시 사항
  {
    id: "common-mandatory-1",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 1,
    relatedLaw: "(금) 22③2",
    checkPoint: "은행의 명칭 표시 여부",
  },
  {
    id: "common-mandatory-2",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 2,
    relatedLaw: "(금) 22③1",
    checkPoint: "계약체결 전 설명서 및 약관 읽어볼 것을 권유하는 내용 표시 여부",
    example: "이 금융상품을 가입(계약)하시기 전에 '금융상품 설명서' 및 '약관'을 반드시 읽어보시기 바랍니다.",
  },
  {
    id: "common-mandatory-3",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 3,
    relatedLaw: "(금) 22③4/ 영18③1",
    checkPoint: "설명을 받을 수 있는 권리 표시 여부",
    example: "이 금융상품을 가입(계약)하시는 경우 금융소비자보호법 제19조제1항에 따라 상품에 관한 중요한 사항을 설명 받을 수 있습니다.",
  },
  {
    id: "common-mandatory-4",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 4,
    relatedLaw: "(금) 22③4/ 영18③2,6",
    checkPoint: "법령·내부통제기준에 따른 광고절차 준수여부 및 유효기간 표시 여부",
    example: "이 광고는 법령 및 내부통제기준에 따른 관련 절차를 거쳐 제공됩니다. 준법심의필 제2024-XXX호 (유효기간: 20XX.XX.XX ~ 20XX.XX.XX)",
  },
  {
    id: "common-mandatory-5",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 5,
    relatedLaw: "(금) 22③4/ 영18③3",
    checkPoint: "예금자보호법 등에 따른 금융소비자 보호내용 표시 여부",
    example: "이 예금은 예금자보호법에 따라 원금과 소정의 이자를 합하여 1인당 \"1억원까지\"(본 은행의 여타 보호상품과 합산) 보호됩니다.",
  },
  {
    id: "common-mandatory-6",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 6,
    relatedLaw: "(은)기16①4",
    checkPoint: "광고 대상 금융상품(서비스)의 명칭 및 내용을 표시하였는지 여부",
  },
  {
    id: "common-mandatory-7",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 7,
    relatedLaw: "(금) 22③4 영 18①1 다",
    checkPoint: "수수료 및 부대비용이 발생할 수 있는 경우 이를 표시하였는지 여부",
  },
  {
    id: "common-mandatory-8",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 8,
    relatedLaw: "(은)기 18 1",
    checkPoint: "(타기관 등으로부터 수상, 선정, 인증, 특허 등을 받은 내용을 표기하는 경우) 그 시기 및 내용 등을 표시하였는지 여부",
  },
  {
    id: "common-mandatory-9",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 9,
    relatedLaw: "(지)추천보증 V. 5",
    checkPoint: "(추천·보증형식의 광고의 경우) 광고주와 추천·보증인과의 경제적 이해관계 존재여부 등을 명확히 표시하였는지 여부",
    example: "본 포스팅은 신한은행으로부터 소정의 원고료를 받아 작성되었습니다.",
  },
  {
    id: "common-mandatory-10",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 10,
    relatedLaw: "(금) 22③4/ 영18③6",
    checkPoint: "(도표, 그래프 등이 있는 경우) 통계수치, 도표 등의 해당자료 출처 표시 여부",
    example: "은행연합회, 제로인 등 자료 출처(인용) 기재",
  },
  {
    id: "common-mandatory-11",
    category: "공통",
    subCategory: "의무표시 사항",
    no: 11,
    relatedLaw: "(금) 22③4/ 영18③6",
    checkPoint: "(연계·제휴서비스가 있는 경우) 서비스를 받기 위해 충족해야 할 요건 표시 여부",
  },

  // 공통 - 금지사항
  {
    id: "common-prohibit-1",
    category: "공통",
    subCategory: "금지사항",
    no: 1,
    relatedLaw: "(금)영20①2/ 영20④1",
    checkPoint: "금융소비자의 경제적 부담이 작아 보이도록 하거나 계약체결에 따른 이익을 크게 인지하도록 하여 금융상품을 오인하게끔 표현하는 행위 금지",
  },
  {
    id: "common-prohibit-2",
    category: "공통",
    subCategory: "금지사항",
    no: 2,
    relatedLaw: "(금)영20①2/ 영20④1",
    checkPoint: "비교대상/기준을 분명하게 밝히지 않거나 객관적인 근거 없이 다른 금융상품과 비교하는 행위 금지",
  },
  {
    id: "common-prohibit-3",
    category: "공통",
    subCategory: "금지사항",
    no: 3,
    relatedLaw: "(금)영20①2/ 영20④1",
    checkPoint: "불확실한 사항에 대해 단정적 판단을 제공하거나 확실하다고 오인하게 할 소지가 있는 내용을 알리는 행위 금지",
  },
  {
    id: "common-prohibit-4",
    category: "공통",
    subCategory: "금지사항",
    no: 4,
    relatedLaw: "(금)영20①2/ 영20④1",
    checkPoint: "계약체결 여부나 금융소비자의 권리의무에 중대한 영향을 미치는 사항을 사실과 다르게 알리거나 분명하지 않게 표현하는 행위 금지",
  },
  {
    id: "common-prohibit-5",
    category: "공통",
    subCategory: "금지사항",
    no: 5,
    relatedLaw: "(표) 3①1",
    checkPoint: "허위 또는 과장된 표현을 사용하는 행위 금지",
    example: "객관적 근거 없이 최상급 표현 등 사용 금지 (예: 최고, 최저, 세상에 없던, 우리나라 처음 등)",
  },
  {
    id: "common-prohibit-6",
    category: "공통",
    subCategory: "금지사항",
    no: 6,
    relatedLaw: "",
    checkPoint: "타인의 명예를 훼손하거나 초상권을 침해할 우려가 있는 표시 금지",
    example: "사전 동의 없이 타기관/타인의 브랜드(상호, 이름, CI, 이미지 등) 사용 금지",
  },
  {
    id: "common-prohibit-7",
    category: "공통",
    subCategory: "금지사항",
    no: 7,
    relatedLaw: "퇴직연금 감독규정 16②",
    checkPoint: "(퇴직연금 관련) 3만원 초과 이익을 제공할 것을 조건으로 상품/서비스의 가입 등을 유도하는 행위 금지",
  },
  {
    id: "common-prohibit-8",
    category: "공통",
    subCategory: "금지사항",
    no: 8,
    relatedLaw: "여전법 영 6조의7 ⑤1",
    checkPoint: "(신용카드 발급 관련) 연회비의 100%를 초과하는 경제적 이익을 제공하는 행위 금지",
  },
  {
    id: "common-prohibit-9",
    category: "공통",
    subCategory: "금지사항",
    no: 9,
    relatedLaw: "(금)규19③1",
    checkPoint: "금융소비자에 따라 달라질 수 있는 거래조건을 누구에게나 적용될 수 있는 것처럼 오인하게 만드는 행위 금지",
  },
  {
    id: "common-prohibit-10",
    category: "공통",
    subCategory: "금지사항",
    no: 10,
    relatedLaw: "(은)기17 6",
    checkPoint: "해당 광고 또는 금융상품판매대리중개업자의 상호를 부각시키는 등 금융소비자가 금융상품직접판매업자(은행)를 올바르게 인지하는 것을 방해하는지 여부",
  },

  // 공통 - 그룹사 공동광고
  {
    id: "common-group-1",
    category: "공통",
    subCategory: "그룹사 공동광고",
    no: 1,
    relatedLaw: "(지)규 <별표1-6>1",
    checkPoint: "예금자보호법상 부보금융기관 여부 표시",
    example: "㈜신한은행, (계열사), (계열사)는 예금자보호법상 부보대상 금융기관이며, (계열사)는 부보대상 금융기관이 아닙니다.",
  },
  {
    id: "common-group-2",
    category: "공통",
    subCategory: "그룹사 공동광고",
    no: 2,
    relatedLaw: "(지)규 <별표1-6>1",
    checkPoint: "은행은 별도의 법적인 계약이 없는 한 공동광고의 주체인 금융지주회사 및 계열사의 채무를 보증하지 않는다는 사실 표시 여부",
    example: "별도의 법적인 계약이 없는 한 ㈜신한은행은 ㈜신한금융지주회사 및 계열사의 채무를 보증하지 않습니다.",
  },

  // 이벤트
  {
    id: "event-1",
    category: "이벤트",
    subCategory: "",
    no: 1,
    relatedLaw: "",
    checkPoint: "이벤트 내용 표시 여부: 1) 행사기간 2) 대상고객 3) 당첨자 확인방법",
  },
  {
    id: "event-2",
    category: "이벤트",
    subCategory: "",
    no: 2,
    relatedLaw: "",
    checkPoint: "(경품 이미지 제공 시) 이미지와 실제 경품이 상이 가능성 표시 여부",
    example: "경품 이미지는 실제 상품과 다를 수 있고, 경품은 사정에 따라 다른 상품으로 대체될 수 있습니다.",
  },
  {
    id: "event-3",
    category: "이벤트",
    subCategory: "",
    no: 3,
    relatedLaw: "",
    checkPoint: "(이벤트 일정 변경 가능 시) 변경 가능성 표시 여부",
    example: "본 이벤트는 은행 사정에 따라 일정이 불가피하게 변경될 수 있습니다. / 이벤트는 예산 소진시 조기 종료될 수 있습니다.",
  },
  {
    id: "event-4",
    category: "이벤트",
    subCategory: "",
    no: 4,
    relatedLaw: "",
    checkPoint: "고객부담비용 발생 가능성 여부 표시",
  },
  {
    id: "event-5",
    category: "이벤트",
    subCategory: "",
    no: 5,
    relatedLaw: "",
    checkPoint: "(경품가액이 5만원 초과시) 제세공과금 부담주체 표시 여부",
    example: "5만원 초과 경품에 대한 제세공과금 22%는 당행에서 부담합니다.",
  },
  {
    id: "event-6",
    category: "이벤트",
    subCategory: "",
    no: 6,
    relatedLaw: "",
    checkPoint: "(재산상 이익제공 보고대상시) 보고대상 안내 표시",
    example: "3만원 초과 경품 제공 건에 대하여는 은행법상 '재산상 이익제공 보고대상'에 해당됩니다.",
  },
  {
    id: "event-7",
    category: "이벤트",
    subCategory: "",
    no: 7,
    relatedLaw: "",
    checkPoint: "(경품 연간 3백만원 초과시) 종합과세 신고대상 안내 표시",
    example: "소득세법에 따라 본 경품 수령 금액을 포함하여 기타소득이 연간 3백만원을 초과하면 종합과세 신고대상에 포함됩니다.",
  },
];

// 초기 체크리스트 리뷰 생성
export function createInitialChecklistReview(): ChecklistReview {
  return {
    items: BANK_CHECKLIST_ITEMS.map(item => ({
      ...item,
      result: "미검토" as CheckResult,
      comment: "",
    })),
    reviewerName: "",
    reviewDate: null,
    overallResult: "미완료",
    generalComment: "",
  };
}

// 체크리스트 결과 요약
export function getChecklistSummary(review: ChecklistReview) {
  const total = review.items.length;
  const checked = review.items.filter(i => i.result !== "미검토").length;
  const appropriate = review.items.filter(i => i.result === "적정").length;
  const inappropriate = review.items.filter(i => i.result === "부적정").length;
  const notApplicable = review.items.filter(i => i.result === "해당없음").length;
  
  return {
    total,
    checked,
    appropriate,
    inappropriate,
    notApplicable,
    progress: Math.round((checked / total) * 100),
    isComplete: checked === total,
  };
}
