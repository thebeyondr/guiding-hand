import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, missingPersonName, foundPersonName, confidenceScore } =
      await request.json();

    if (!to || !missingPersonName || !foundPersonName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Guiding Hand <onboarding@resend.dev>",
      // Note: For production, you need to verify a custom domain in Resend
      // For development, onboarding@resend.dev works but is rate-limited
      to: [to],
      subject: `Match Found: ${missingPersonName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Match Found for ${missingPersonName}</h1>
          
          <p>We have found a potential match for <strong>${missingPersonName}</strong> with a confidence score of <strong>${confidenceScore}%</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Found Person Details</h2>
            <p><strong>Name:</strong> ${foundPersonName}</p>
            <p><strong>Confidence Score:</strong> ${confidenceScore}%</p>
          </div>
          
          <p style="color: #666;">
            <strong>Important:</strong> This is an automated match. Please verify the information carefully.
            ${confidenceScore < 100 ? " This match requires human verification." : ""}
          </p>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If this information is correct, please contact local authorities or the person who submitted the found person report.
          </p>
          
          <p style="margin-top: 20px; color: #999; font-size: 12px;">
            This email was sent from Guiding Hand - Missing Persons Tracking System for Jamaica.
          </p>
        </div>
      `,
      text: `
Match Found: ${missingPersonName}

We have found a potential match for ${missingPersonName} with a confidence score of ${confidenceScore}%.

Found Person Details:
- Name: ${foundPersonName}
- Confidence Score: ${confidenceScore}%

Important: This is an automated match. Please verify the information carefully.
${confidenceScore < 100 ? " This match requires human verification." : ""}

If this information is correct, please contact local authorities or the person who submitted the found person report.

---
This email was sent from Guiding Hand - Missing Persons Tracking System for Jamaica.
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

