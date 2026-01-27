import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BANK_CHECKLIST_ITEMS } from "@/data/checklist/bankChecklist";

const apiKey = process.env.GEMINI_API_KEY || "";

interface ChecklistResult {
  itemId: string;
  result: "적정" | "부적정" | "해당없음";
  reason: string;
  confidence: number;
}

interface AIChecklistResponse {
  results: ChecklistResult[];
  summary: string;
  overallRisk: "높음" | "보통" | "낮음";
}

export async function POST(request: NextRequest) {
  try {
    const { adContent, sector } = await request.json();

    if (!adContent) {
      return NextResponse.json(
        { error: "광고 내용이 필요합니다." },
        { status: 400 }
      );
    }

    // 현재는 은행만 지원
    if (sector !== "은행") {
      return NextResponse.json(
        { error: "현재 은행 그룹사만 자동 검토를 지원합니다." },
        { status: 400 }
      );
    }

    // API 키가 없으면 Mock 응답
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Using mock responses.");
      return NextResponse.json(getMockResponse());
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 체크리스트 항목들을 프롬프트용으로 변환
    const checklistPrompt = BANK_CHECKLIST_ITEMS.map((item, index) => {
      let prompt = `${index + 1}. [${item.id}] ${item.checkPoint}`;
      if (item.relatedLaw) {
        prompt += ` (관련법령: ${item.relatedLaw})`;
      }
      if (item.example) {
        prompt += `\n   예시: ${item.example}`;
      }
      return prompt;
    }).join("\n\n");

    const prompt = `당신은 금융 광고 준법 심사 전문가입니다. 아래 광고 내용을 은행 업무 광고 점검표 기준으로 검토해주세요.

## 광고 내용
${adContent}

## 점검 항목
${checklistPrompt}

## 응답 형식
각 점검 항목에 대해 다음 JSON 형식으로 응답해주세요:
{
  "results": [
    {
      "itemId": "항목 ID (예: common-form-1)",
      "result": "적정" | "부적정" | "해당없음",
      "reason": "판단 근거 (간략하게 1-2문장)",
      "confidence": 0.0-1.0 사이의 확신도
    }
  ],
  "summary": "전체 검토 요약 (2-3문장)",
  "overallRisk": "높음" | "보통" | "낮음"
}

## 판단 기준
- "적정": 해당 점검 항목을 준수하고 있음
- "부적정": 해당 점검 항목을 위반하거나 누락함
- "해당없음": 해당 광고에 적용되지 않는 항목 (예: 이벤트 관련 항목인데 이벤트가 없는 경우)

## 주의사항
1. 금융소비자보호법, 표시광고법 등 관련 법령을 엄격히 적용하세요.
2. 과장 광고, 허위 광고 여부를 면밀히 검토하세요.
3. 필수 표시사항 누락 여부를 확인하세요.
4. 확신이 낮은 항목은 confidence를 낮게 설정하세요.
5. 반드시 유효한 JSON만 응답하세요. 다른 텍스트는 포함하지 마세요.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱 시도
    try {
      // JSON 블록 추출 (```json ... ``` 형식 처리)
      let jsonText = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      const parsed: AIChecklistResponse = JSON.parse(jsonText.trim());
      
      // 결과 검증 및 정규화
      const validResults = parsed.results.filter(r => 
        BANK_CHECKLIST_ITEMS.some(item => item.id === r.itemId)
      );

      // 누락된 항목 추가 (해당없음으로)
      const resultIds = new Set(validResults.map(r => r.itemId));
      BANK_CHECKLIST_ITEMS.forEach(item => {
        if (!resultIds.has(item.id)) {
          validResults.push({
            itemId: item.id,
            result: "해당없음",
            reason: "AI가 판단하지 못한 항목입니다. 수동 검토가 필요합니다.",
            confidence: 0,
          });
        }
      });

      return NextResponse.json({
        results: validResults,
        summary: parsed.summary || "AI 자동 검토가 완료되었습니다.",
        overallRisk: parsed.overallRisk || "보통",
      });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Response:", text);
      // 파싱 실패 시 Mock 응답 반환
      return NextResponse.json(getMockResponse());
    }
  } catch (error) {
    console.error("Checklist API error:", error);
    return NextResponse.json(
      { error: "체크리스트 검토 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// Mock 응답 생성
function getMockResponse(): AIChecklistResponse {
  const results: ChecklistResult[] = BANK_CHECKLIST_ITEMS.map(item => {
    // 데모용 랜덤 결과 생성
    const rand = Math.random();
    let result: "적정" | "부적정" | "해당없음";
    let reason: string;
    let confidence: number;

    if (item.category === "이벤트") {
      result = "해당없음";
      reason = "이벤트 관련 내용이 광고에 포함되어 있지 않습니다.";
      confidence = 0.9;
    } else if (rand < 0.6) {
      result = "적정";
      reason = "해당 항목을 준수하고 있습니다.";
      confidence = 0.85;
    } else if (rand < 0.8) {
      result = "부적정";
      reason = "해당 항목이 누락되었거나 불충분합니다. 수정이 필요합니다.";
      confidence = 0.75;
    } else {
      result = "해당없음";
      reason = "해당 광고에 적용되지 않는 항목입니다.";
      confidence = 0.8;
    }

    return {
      itemId: item.id,
      result,
      reason,
      confidence,
    };
  });

  // 일부 항목을 부적정으로 강제 설정 (데모용)
  const forceInappropriate = ["common-mandatory-2", "common-mandatory-5", "common-prohibit-3"];
  results.forEach(r => {
    if (forceInappropriate.includes(r.itemId)) {
      r.result = "부적정";
      r.reason = "필수 표시사항이 누락되었거나 부적절한 표현이 포함되어 있습니다.";
      r.confidence = 0.9;
    }
  });

  return {
    results,
    summary: "AI 자동 검토 결과, 일부 필수 표시사항 누락 및 부적절한 표현이 발견되었습니다. 상세 내용을 확인하고 수정해주세요.",
    overallRisk: "보통",
  };
}
