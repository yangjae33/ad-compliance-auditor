import { NextRequest, NextResponse } from "next/server";
import {
  analyzeImageWithGemini,
  getGeminiModel,
  MOCK_DRAFT_RESPONSE,
} from "@/utils/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const sector = formData.get("sector") as string;

    if (!image) {
      return NextResponse.json(
        { error: "이미지가 필요합니다." },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type;

    // Check if Gemini is available
    const model = getGeminiModel();

    if (!model) {
      // Return mock response for demo
      console.log("Using mock response for draft agent");
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
      return NextResponse.json({
        success: true,
        data: MOCK_DRAFT_RESPONSE,
        isMock: true,
      });
    }

    const prompt = `Analyze this image. It's a financial advertisement for the ${sector} sector in Korea.

Extract the following information and return ONLY a valid JSON object (no markdown, no code blocks):
{
  "productName": "The product or service name shown in the ad",
  "targetAudience": "Who this ad seems to target (age group, income level, etc.)",
  "description": "Write a compliance-friendly description based on the image content. Include necessary disclaimers for Korean financial regulations."
}

Important:
- The description should be in Korean
- Include appropriate risk warnings for financial products
- Make sure the description follows Korean financial advertising regulations`;

    const result = await analyzeImageWithGemini(base64, mimeType, prompt);

    // Parse the JSON response
    let parsedResult;
    try {
      // Clean up the response (remove markdown code blocks if present)
      const cleanedResult = result
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResult = JSON.parse(cleanedResult);
    } catch {
      // If parsing fails, return structured mock data with extracted text
      parsedResult = {
        productName: "분석된 상품명",
        targetAudience: "일반 투자자",
        description: result,
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
      isMock: false,
    });
  } catch (error) {
    console.error("Draft agent error:", error);

    // Return mock response on error
    return NextResponse.json({
      success: true,
      data: MOCK_DRAFT_RESPONSE,
      isMock: true,
      error: "API 호출 실패, Mock 데이터 사용",
    });
  }
}
