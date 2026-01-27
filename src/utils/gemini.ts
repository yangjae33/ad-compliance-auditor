import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export function getGeminiModel(): GenerativeModel | null {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using mock responses.");
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }

  if (!model) {
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  return model;
}

export async function analyzeImageWithGemini(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const model = getGeminiModel();

  if (!model) {
    throw new Error("Gemini model not available");
  }

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  return response.text();
}

export async function analyzeTextWithGemini(prompt: string): Promise<string> {
  const model = getGeminiModel();

  if (!model) {
    throw new Error("Gemini model not available");
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Mock responses for demo when API key is not available
export const MOCK_DRAFT_RESPONSE = {
  productName: "스마트 투자 펀드",
  targetAudience: "30-50대 직장인, 안정적인 수익을 원하는 투자자",
  description:
    "본 펀드는 국내외 우량 자산에 분산 투자하여 안정적인 수익을 추구합니다. 투자 원금의 손실이 발생할 수 있으며, 과거 수익률이 미래 수익률을 보장하지 않습니다. 투자 전 투자설명서를 반드시 확인하시기 바랍니다.",
};

export const MOCK_REVIEW_RESPONSE = {
  status: "FAIL" as const,
  score: 45,
  riskFactors: [
    "금지 키워드 '원금보장' 사용",
    "과장된 수익률 표현",
    "필수 고지사항 누락",
  ],
  detailedFeedback:
    "광고 내용에 '원금보장', '확정 수익' 등의 금지 키워드가 포함되어 있습니다. 금융소비자보호법에 따라 투자 상품 광고에는 원금손실 가능성을 명시해야 합니다. 또한 과거 수익률을 제시할 경우 '과거 수익률이 미래 수익률을 보장하지 않습니다'라는 문구가 필수적으로 포함되어야 합니다.",
};

export const MOCK_REVIEW_PASS_RESPONSE = {
  status: "PASS" as const,
  score: 92,
  riskFactors: [],
  detailedFeedback:
    "광고 내용이 금융 규정을 준수하고 있습니다. 필수 고지사항이 포함되어 있으며, 오인 소지가 있는 표현이 발견되지 않았습니다. 광고 집행이 가능합니다.",
};
