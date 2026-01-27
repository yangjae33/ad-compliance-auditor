# Project: Smart Compliance Agent (Integration Phase)
# Goal: Integrate 3 AI Agents using Google Gemini API (Free Tier) and Nodemailer into the existing Next.js App Router project.

I need you to implement backend API routes and connect them to the frontend.
The tech stack is Next.js 14, Tailwind CSS, TypeScript.

## 🔑 Prerequisites (I will handle these)
- I have a Google Gemini API Key.
- I will install dependencies: `npm install @google/generative-ai nodemailer`

## 🤖 Agent 1: Auto-Drafting Agent (Vision-to-Form)
- **Trigger:** User uploads an ad image and clicks "AI Auto-Fill".
- **Logic:**
  1. Send the image to Gemini 1.5 Flash.
  2. Prompt: "Analyze this image. It's a financial ad. Extract the 'Product Name', 'Target Audience', and write a 'Compliance-friendly Description' based on the image content."
  3. Return JSON to fill the form inputs automatically.

## ⚖️ Agent 2: Compliance Review Agent (Auditor)
- **Trigger:** User clicks "Start Review" after filling the form.
- **Logic:**
  1. Send the form text AND the uploaded image to Gemini 1.5 Flash.
  2. System Prompt: "You are a strict Financial Compliance Officer. Check for banned words (e.g., 'guaranteed', 'best') and check if the image contains misleading graphs. Return a JSON with { status: 'PASS' | 'FAIL', score: 0-100, riskFactors: string[], detailedFeedback: string }."
  3. Frontend: Display the result card with Red (Fail) or Green (Pass) badges.

## 📧 Agent 3: Email Notification Agent
- **Trigger:** User clicks "Approve & Send Mail" on the result card.
- **Logic:**
  1. Use `nodemailer` to send an email to a target address (hardcoded or input).
  2. Content: "Your ad review is complete. Status: [Status]. Feedback: [Feedback]."
  3. **Fallback:** If SMTP fails, log it and show a success toast for demo purposes.

## 📂 Required File Structure & Code
Please generate the full code for these files:

1. `src/app/api/agent/draft/route.ts` (For Agent 1)
2. `src/app/api/agent/review/route.ts` (For Agent 2)
3. `src/app/api/agent/email/route.ts` (For Agent 3)
4. `src/utils/gemini.ts` (Gemini Client Setup)
5. `src/app/page.tsx` (Update the existing page to connect these APIs)

## ⚠️ Important Implementation Details
- Use `@google/generative-ai` library.
- Handle `FormData` in the API routes to process image uploads.
- Convert images to `base64` before sending to Gemini.
- For `page.tsx`, ensure the UI shows "Scanning..." loading states clearly.
- **Mock Data:** If the API call fails (or key is missing), provide a realistic Mock Response so the demo doesn't crash.

## Execution
Generate the code now.
