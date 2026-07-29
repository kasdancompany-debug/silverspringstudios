import { SITE } from "@/lib/constants";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const brandColor = "#1a1a1a";
const accentColor = "#8b7355";
const mutedColor = "#6b6b6b";
const backgroundColor = "#f7f5f2";

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Silver Spring Studios</title>
</head>
<body style="margin:0;padding:0;background-color:${backgroundColor};font-family:Georgia,'Times New Roman',serif;color:${brandColor};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${backgroundColor};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e8e4df;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #e8e4df;">
              <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${accentColor};">Silver Spring Studios</p>
              <p style="margin:6px 0 0;font-size:14px;color:${mutedColor};">${SITE.tagline}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:16px;line-height:1.65;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid #e8e4df;font-size:13px;line-height:1.6;color:${mutedColor};">
              <p style="margin:0 0 8px;">Silver Spring Studios</p>
              <p style="margin:0 0 8px;"><a href="${SITE.url}" style="color:${accentColor};text-decoration:none;">${SITE.url.replace(/^https?:\/\//, "")}</a></p>
              <p style="margin:0;">Questions? Reply to this email or write to <a href="mailto:${SITE.email}" style="color:${accentColor};text-decoration:none;">${SITE.email}</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;">${text}</p>`;
}

function referenceBlock(referenceNumber: string): string {
  return `<p style="margin:0 0 16px;padding:16px;background-color:${backgroundColor};border-left:3px solid ${accentColor};font-size:15px;"><strong>Reference:</strong> ${referenceNumber}</p>`;
}

export function submissionConfirmationEmail({
  filmmakerName,
  filmTitle,
  referenceNumber,
}: {
  filmmakerName: string;
  filmTitle: string;
  referenceNumber: string;
}): EmailContent {
  const subject = `We received your submission — ${filmTitle}`;

  const html = emailLayout(`
    ${paragraph(`Dear ${filmmakerName},`)}
    ${paragraph(`Thank you for submitting <em>${filmTitle}</em> to Silver Spring Studios. We have received your materials and added them to our review queue.`)}
    ${referenceBlock(referenceNumber)}
    ${paragraph("What happens next: our team will review your submission in the order it was received. If your project aligns with what we are actively pursuing, we will reach out with specific questions or next steps. We cannot respond to every submission individually, and receiving materials does not create any obligation on either side.")}
    ${paragraph("Please keep this reference number for your records. If you need to send updated materials, reply to this email and include the reference number in your message.")}
    ${paragraph("We appreciate the work that went into your film and the trust you placed in sharing it with us.")}
    ${paragraph("Warm regards,<br />The Silver Spring Studios team")}
  `);

  const text = [
    `Dear ${filmmakerName},`,
    "",
    `Thank you for submitting "${filmTitle}" to Silver Spring Studios. We have received your materials and added them to our review queue.`,
    "",
    `Reference: ${referenceNumber}`,
    "",
    "What happens next: our team will review your submission in the order it was received. If your project aligns with what we are actively pursuing, we will reach out with specific questions or next steps. We cannot respond to every submission individually, and receiving materials does not create any obligation on either side.",
    "",
    "Please keep this reference number for your records. If you need to send updated materials, reply to this email and include the reference number in your message.",
    "",
    "We appreciate the work that went into your film and the trust you placed in sharing it with us.",
    "",
    "Warm regards,",
    "The Silver Spring Studios team",
    "",
    SITE.url,
  ].join("\n");

  return { subject, html, text };
}

export function adminSubmissionNotificationEmail({
  filmmakerName,
  filmTitle,
  referenceNumber,
  genre,
  email,
}: {
  filmmakerName: string;
  filmTitle: string;
  referenceNumber: string;
  genre: string;
  email: string;
}): EmailContent {
  const adminUrl = `${SITE.url.replace(/\/$/, "")}/admin/submissions`;
  const subject = `New submission: ${filmTitle} (${referenceNumber})`;

  const html = emailLayout(`
    ${paragraph("A new film submission has been received.")}
    ${referenceBlock(referenceNumber)}
    ${paragraph(`<strong>Title:</strong> ${filmTitle}<br /><strong>Genre:</strong> ${genre}<br /><strong>Filmmaker:</strong> ${filmmakerName}<br /><strong>Email:</strong> <a href="mailto:${email}" style="color:${accentColor};text-decoration:none;">${email}</a>`)}
    ${paragraph(`<a href="${adminUrl}" style="color:${accentColor};">Open the submissions desk →</a>`)}
  `);

  const text = [
    "A new film submission has been received.",
    "",
    `Reference: ${referenceNumber}`,
    "",
    `Title: ${filmTitle}`,
    `Genre: ${genre}`,
    `Filmmaker: ${filmmakerName}`,
    `Email: ${email}`,
    "",
    `Review: ${adminUrl}`,
  ].join("\n");

  return { subject, html, text };
}

export function contactConfirmationEmail({ name }: { name: string }): EmailContent {
  const subject = "We received your message";

  const html = emailLayout(`
    ${paragraph(`Dear ${name},`)}
    ${paragraph("Thank you for contacting Silver Spring Studios. We have received your message and will read it carefully.")}
    ${paragraph("We aim to respond to substantive inquiries within a few business days. If your note is time-sensitive, please say so in a follow-up and we will do our best to prioritize it.")}
    ${paragraph("We appreciate you reaching out.")}
    ${paragraph("Warm regards,<br />The Silver Spring Studios team")}
  `);

  const text = [
    `Dear ${name},`,
    "",
    "Thank you for contacting Silver Spring Studios. We have received your message and will read it carefully.",
    "",
    "We aim to respond to substantive inquiries within a few business days. If your note is time-sensitive, please say so in a follow-up and we will do our best to prioritize it.",
    "",
    "We appreciate you reaching out.",
    "",
    "Warm regards,",
    "The Silver Spring Studios team",
    "",
    SITE.url,
  ].join("\n");

  return { subject, html, text };
}

export function adminContactNotificationEmail({
  name,
  email,
  subject: inquirySubject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): EmailContent {
  const subject = `Contact form: ${inquirySubject}`;

  const html = emailLayout(`
    ${paragraph("A new message was submitted through the contact form.")}
    ${paragraph(`<strong>From:</strong> ${name}<br /><strong>Email:</strong> <a href="mailto:${email}" style="color:${accentColor};text-decoration:none;">${email}</a><br /><strong>Subject:</strong> ${inquirySubject}`)}
    ${paragraph(`<strong>Message:</strong><br />${message.replace(/\n/g, "<br />")}`)}
  `);

  const text = [
    "A new message was submitted through the contact form.",
    "",
    `From: ${name}`,
    `Email: ${email}`,
    `Subject: ${inquirySubject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  return { subject, html, text };
}

export function draftResumeEmail({
  filmmakerName,
  resumeUrl,
  filmTitle,
}: {
  filmmakerName: string;
  resumeUrl: string;
  filmTitle?: string;
}): EmailContent {
  const titleFragment = filmTitle ? ` for <em>${filmTitle}</em>` : "";
  const subject = filmTitle
    ? `Continue your submission — ${filmTitle}`
    : "Continue your Silver Spring Studios submission";

  const html = emailLayout(`
    ${paragraph(`Dear ${filmmakerName},`)}
    ${paragraph(`You asked us to send a link so you can continue your submission${titleFragment}. Your progress has been saved.`)}
    ${paragraph(`<a href="${resumeUrl}" style="display:inline-block;padding:12px 20px;background-color:${brandColor};color:#ffffff;text-decoration:none;font-size:15px;">Continue submission</a>`)}
    ${paragraph(`If the button does not work, copy and paste this link into your browser:<br /><a href="${resumeUrl}" style="color:${accentColor};word-break:break-all;">${resumeUrl}</a>`)}
    ${paragraph("This link is private. Anyone with access to it can view and edit your draft, so please do not share it publicly.")}
    ${paragraph("If you did not request this email, you can safely ignore it.")}
    ${paragraph("Warm regards,<br />The Silver Spring Studios team")}
  `);

  const text = [
    `Dear ${filmmakerName},`,
    "",
    `You asked us to send a link so you can continue your submission${filmTitle ? ` for "${filmTitle}"` : ""}. Your progress has been saved.`,
    "",
    `Continue here: ${resumeUrl}`,
    "",
    "This link is private. Anyone with access to it can view and edit your draft, so please do not share it publicly.",
    "",
    "If you did not request this email, you can safely ignore it.",
    "",
    "Warm regards,",
    "The Silver Spring Studios team",
    "",
    SITE.url,
  ].join("\n");

  return { subject, html, text };
}
