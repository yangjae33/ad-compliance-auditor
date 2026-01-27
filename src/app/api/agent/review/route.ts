import { NextRequest, NextResponse } from "next/server";
import {
  analyzeImageWithGemini,
  analyzeTextWithGemini,
  getGeminiModel,
  MOCK_REVIEW_RESPONSE,
  MOCK_REVIEW_PASS_RESPONSE,
} from "@/utils/gemini";

export interface ReviewResult {
  status: "PASS" | "FAIL";
  score: number;
  riskFactors: string[];
  detailedFeedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const sector = formData.get("sector") as string;

    if (!title || !content) {
      return NextResponse.json(
        { error: "광고 제목과 내용이 필요합니다." },
        { status: 400 }
      );
    }

    // Check if Gemini is available
    const model = getGeminiModel();

    if (!model) {
      // Return mock response for demo
      console.log("Using mock response for review agent");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

      // Check for banned keywords to decide mock response
      const bannedKeywords = [
        "원금보장",
        "손실 없음",
        "확정 수익",
        "무조건",
        "guaranteed",
        "best",
      ];
      const hasBannedKeyword = bannedKeywords.some(
        (keyword) =>
          title.toLowerCase().includes(keyword.toLowerCase()) ||
          content.toLowerCase().includes(keyword.toLowerCase())
      );

      return NextResponse.json({
        success: true,
        data: hasBannedKeyword ? MOCK_REVIEW_RESPONSE : MOCK_REVIEW_PASS_RESPONSE,
        isMock: true,
      });
    }

    const systemPrompt = `You are a strict Financial Compliance Officer in Korea. Your job is to review financial advertisements for regulatory compliance.

Korean Financial Advertisement Regulations to check:
1. Banned words (ONLY when used in misleading context): "원금보장", "손실 없음", "확정 수익", "무조건", "100% 수익", "guaranteed", "best"
2. Required disclaimers for investment products: "투자 원금의 손실이 발생할 수 있습니다", "과거 수익률이 미래 수익률을 보장하지 않습니다"
3. Required disclaimers for deposit products: "예금자보호법에 따라 원금과 이자를 합하여 5천만원(또는 1억원)까지 보호됩니다"
4. Check for misleading graphs or exaggerated claims
5. Verify appropriate risk warnings are present

IMPORTANT - Context-aware checking:
- Words like "반드시", "최대", "최고" are ALLOWED when used in mandatory disclosure contexts such as:
  * "상품설명서를 반드시 확인하세요" (mandatory confirmation request)
  * "약관을 반드시 읽어보세요" (mandatory reading request)
  * "월 최대 1만원 할인" (benefit limit disclosure with condition)
  * "예금자보호법에 따라 보호됩니다" (deposit protection disclosure)
- These words are PROHIBITED only when used to make misleading claims like:
  * "반드시 수익이 납니다" (guaranteed profit - misleading)
  * "최고의 수익률" without objective evidence (superlative without basis)

- If "예금자보호법" related text is present (e.g., "예금자보호법에 따라", "원금과 이자를 합하여...보호"), do NOT flag it as missing.
- Focus on actual misleading content, not on mandatory disclosure language.

Sector: ${sector}
Ad Title: ${title}
Ad Content: ${content}

Analyze the advertisement and return ONLY a valid JSON object (no markdown, no code blocks):
{
  "status": "PASS" or "FAIL",
  "score": 0-100 (compliance score),
  "riskFactors": ["list", "of", "issues", "found"],
  "detailedFeedback": "Detailed explanation in Korean about the compliance status and any issues found"
}`;

    let result: string;

    if (image) {
      // Analyze with image
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = image.type;

      const imagePrompt = `${systemPrompt}

Also analyze the attached image for:
- Misleading graphs or charts
- Exaggerated visual claims
- Missing required warnings in the image`;

      result = await analyzeImageWithGemini(base64, mimeType, imagePrompt);
    } else {
      // Text-only analysis
      result = await analyzeTextWithGemini(systemPrompt);
    }

    // Parse the JSON response
    let parsedResult: ReviewResult;
    try {
      const cleanedResult = result
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResult = JSON.parse(cleanedResult);
    } catch {
      // If parsing fails, create a structured response
      parsedResult = {
        status: "FAIL",
        score: 50,
        riskFactors: ["응답 파싱 실패"],
        detailedFeedback: result,
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
      isMock: false,
    });
  } catch (error) {
    console.error("Review agent error:", error);

    // Return mock response on error
    return NextResponse.json({
      success: true,
      data: MOCK_REVIEW_RESPONSE,
      isMock: true,
      error: "API 호출 실패, Mock 데이터 사용",
    });
  }
}
