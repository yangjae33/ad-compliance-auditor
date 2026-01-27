import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, status, score, feedback, adTitle, sector } = body;

    if (!to || !status) {
      return NextResponse.json(
        { error: "이메일 주소와 상태 정보가 필요합니다." },
        { status: 400 }
      );
    }

    // Check if SMTP credentials are configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Apple SD Gothic Neo', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    .status-pass { background: #dcfce7; color: #166534; }
    .status-fail { background: #fee2e2; color: #991b1b; }
    .score { font-size: 48px; font-weight: bold; color: #2563eb; }
    .footer { background: #1f2937; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">SOLens</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">광고 컴플라이언스 검토 결과</p>
    </div>
    <div class="content">
      <h2>검토 완료 알림</h2>

      <p><strong>광고 제목:</strong> ${adTitle || "N/A"}</p>
      <p><strong>그룹사:</strong> ${sector || "N/A"}</p>

      <div style="margin: 20px 0;">
        <span class="status-badge ${status === "PASS" ? "status-pass" : "status-fail"}">
          ${status === "PASS" ? "승인" : "거부"}
        </span>
      </div>

      <div style="margin: 20px 0;">
        <p style="margin-bottom: 5px; color: #6b7280;">컴플라이언스 점수</p>
        <span class="score">${score || 0}</span><span style="color: #6b7280;">/100</span>
      </div>

      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h3 style="margin-top: 0;">상세 피드백</h3>
        <p>${feedback || "피드백 없음"}</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">이 메일은 SOLens에서 자동으로 발송되었습니다.</p>
      <p style="margin: 10px 0 0 0; opacity: 0.7; font-size: 12px;">© 2024 SOLens</p>
    </div>
  </div>
</body>
</html>
    `;

    // If SMTP is not configured, log and return success for demo
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("=".repeat(60));
      console.log("EMAIL NOTIFICATION (Demo Mode - SMTP not configured)");
      console.log("=".repeat(60));
      console.log(`To: ${to}`);
      console.log(`Subject: [SOLens] 광고 검토 결과 - ${status}`);
      console.log(`Status: ${status}`);
      console.log(`Score: ${score}`);
      console.log(`Feedback: ${feedback}`);
      console.log("=".repeat(60));

      return NextResponse.json({
        success: true,
        message: "데모 모드: 이메일 발송이 시뮬레이션되었습니다.",
        demo: true,
        sentTo: to,
      });
    }

    // Create transporter with actual SMTP settings
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || "587"),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"SOLens" <${smtpUser}>`,
      to: to,
      subject: `[SOLens] 광고 검토 결과 - ${status === "PASS" ? "승인" : "거부"}`,
      html: emailContent,
    });

    console.log("Email sent:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "이메일이 성공적으로 발송되었습니다.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Email agent error:", error);

    // Fallback: return success for demo purposes
    return NextResponse.json({
      success: true,
      message: "데모 모드: 이메일 발송이 시뮬레이션되었습니다. (SMTP 오류 발생)",
      demo: true,
      error: String(error),
    });
  }
}
