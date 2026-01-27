import { NextRequest, NextResponse } from "next/server";
import {
  analyzeImageWithGemini,
  getGeminiModel,
  MOCK_DRAFT_RESPONSE,
} from "@/utils/gemini";
import { SECTOR_GUIDELINES, Sector } from "@/data/mockData";

// Build RAG context from sector guideline
function buildGuidelineContext(sector: string): string {
  const sectorKey = sector as Sector;
  const guideline = SECTOR_GUIDELINES[sectorKey];

  if (!guideline) {
    return "해당 업종의 가이드라인을 찾을 수 없습니다.";
  }

  // Build checklist context
  const checklistItems = guideline.checklist
    .filter(item => item.required)
    .map(item => `- ${item.item}: ${item.description}`)
    .join("\n");

  // Build mandatory statements context
  const mandatoryStatements = guideline.mandatoryStatements
    .map(stmt => `- "${stmt.content}"${stmt.condition ? ` (조건: ${stmt.condition})` : ""}`)
    .join("\n");

  // Build prohibited expressions context
  const prohibitedExpressions = guideline.prohibitedExpressions
    .map(expr => `- ${expr.description} → 권장: ${expr.suggestion}`)
    .join("\n");

  return `
=== ${guideline.name} 업종 광고 가이드라인 (RAG Context) ===

[적용 법규]
${guideline.mainRegulations.join(", ")}

[필수 체크리스트]
${checklistItems}

[필수 포함 문구]
${mandatoryStatements}

[금지 표현 및 권장 대안]
${prohibitedExpressions}

[주의사항]
${guideline.warnings.join("\n")}
`;
}

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

    // Build RAG context from sector guideline
    const guidelineContext = buildGuidelineContext(sector);

    const prompt = `당신은 한국 금융 광고 컴플라이언스 전문가입니다.

## 작업 지시
이 이미지에서 보이는 텍스트를 정확히 추출하여 광고 기안문을 작성하세요.

## 중요 규칙
1. **이미지에 있는 내용만 추출**: 이미지에 없는 내용을 절대 허위로 작성하지 마세요.
2. **리뷰/평가 금지**: 광고 내용에 대한 평가나 리뷰를 추가하지 마세요.
3. **OCR 정확성**: 상품명, 이율, 기간, 조건 등을 정확히 추출하세요.
4. **가이드라인 참조**: 아래 업종 가이드라인을 참조하여 누락된 필수 문구가 있는지 확인하세요.

${guidelineContext}

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이):
{
  "productName": "이미지에서 추출한 상품명",
  "extractedText": "이미지에서 추출한 모든 텍스트 (원문 그대로)",
  "interestRate": "이미지에서 추출한 금리 정보 (없으면 null)",
  "period": "이미지에서 추출한 가입 기간 (없으면 null)",
  "targetAudience": "이미지에서 추출한 가입 대상 (없으면 null)",
  "description": "추출한 텍스트를 기반으로 작성한 광고 기안문 (이미지에 있는 내용만 포함)",
  "missingRequirements": ["가이드라인 기준 누락된 필수 항목 목록"]
}

## 업종
${sector}

이미지를 분석하고 위 형식으로 응답하세요.`;

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
        extractedText: result,
        interestRate: null,
        period: null,
        targetAudience: null,
        description: result,
        missingRequirements: [],
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
