import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/utils/gemini";

export async function POST(request: NextRequest) {
  try {
    const { content, sector, title } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "광고 내용이 필요합니다." },
        { status: 400 }
      );
    }

    const model = getGeminiModel();

    if (!model) {
      // Return mock response for demo
      console.log("Using mock response for recommend agent");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      return NextResponse.json({
        success: true,
        data: {
          improvedContent: `${content}\n\n※ 본 상품은 예금자보호법에 따라 예금보험공사가 보호하지 않습니다.\n※ 투자 전 설명서를 반드시 읽어보시기 바랍니다.\n※ 과거의 운용실적이 미래의 수익률을 보장하지 않습니다.`,
          suggestions: [
            "필수 고지사항 추가를 권장합니다.",
            "금리/수익률 표시 시 조건을 명확히 기재해주세요.",
            "과장 표현을 자제하고 객관적 사실 위주로 작성해주세요."
          ],
          complianceScore: 75
        },
        isMock: true,
      });
    }

    const sectorGuidelines: Record<string, string> = {
      "은행": `- 예금자보호 여부 명시 필수
- 금리 조건 및 우대조건 명확히 기재
- 중도해지 시 불이익 안내
- 세금 관련 안내 포함`,
      "카드": `- 연회비 정보 필수 기재
- 할부 이자율 명시
- 연체 시 불이익 안내
- 부가서비스 조건 명확히 기재`,
      "증권": `- 투자 위험 고지 필수
- 과거 수익률이 미래를 보장하지 않음 명시
- 원금 손실 가능성 안내
- 투자설명서 확인 권유`,
      "라이프": `- 보험계약 전 상품설명서 확인 안내
- 해지환급금 안내
- 보장 제외 사항 명시
- 청약철회 가능 기간 안내`
    };

    const guidelines = sectorGuidelines[sector] || sectorGuidelines["은행"];

    const prompt = `당신은 한국 금융 광고 컴플라이언스 전문가입니다. 아래 광고 내용을 검토하고 개선된 버전을 제안해주세요.

[그룹사]: ${sector}
[광고 제목]: ${title || "제목 없음"}
[광고 내용]:
${content}

[${sector} 그룹사 필수 준수사항]:
${guidelines}

다음 형식의 JSON으로만 응답해주세요 (마크다운 코드블록 없이):
{
  "improvedContent": "개선된 광고 내용 (원본 내용을 유지하면서 필수 고지사항과 컴플라이언스 문구를 추가)",
  "suggestions": ["개선 제안 1", "개선 제안 2", "개선 제안 3"],
  "complianceScore": 0-100 사이의 현재 광고 컴플라이언스 점수
}

중요사항:
- 원본 광고의 핵심 메시지는 유지하세요
- 과장된 표현이 있다면 완화하세요
- 필수 고지사항을 자연스럽게 추가하세요
- 모든 응답은 한국어로 작성하세요`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let parsedResult;
    try {
      const cleanedResult = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResult = JSON.parse(cleanedResult);
    } catch {
      parsedResult = {
        improvedContent: content,
        suggestions: ["AI 응답 파싱에 실패했습니다. 다시 시도해주세요."],
        complianceScore: 50
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
      isMock: false,
    });
  } catch (error) {
    console.error("Recommend agent error:", error);

    return NextResponse.json({
      success: false,
      error: "AI 추천 생성 중 오류가 발생했습니다.",
    }, { status: 500 });
  }
}
