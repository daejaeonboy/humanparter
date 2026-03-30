import type { QuoteInquiryPayload } from "../api/inquiryApi";

const DEFAULT_SITE_EMAIL_API_URL =
    "https://us-central1-humanpartner-77b4c.cloudfunctions.net/sendSiteEmail";
const configuredSiteEmailApiUrl = (import.meta.env.VITE_SITE_EMAIL_API_URL || "").trim();
const DEFAULT_QUOTE_REQUEST_RECEIVER_EMAIL = "hm_solution@naver.com";

const getSiteEmailApiUrl = () => {
    if (configuredSiteEmailApiUrl) {
        return configuredSiteEmailApiUrl;
    }

    return DEFAULT_SITE_EMAIL_API_URL;
};

const sendSiteEmailRequest = async (params: {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
}) => {
    const response = await fetch(getSiteEmailApiUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Email send failed");
    }

    return response.json();
};

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const getDisplayValue = (value?: string) => {
    const normalized = (value || "").trim();
    return normalized ? escapeHtml(normalized) : "-";
};

const getMultilineDisplayValue = (value?: string) => {
    const normalized = (value || "").trim();
    return normalized ? escapeHtml(normalized).replace(/\n/g, "<br />") : "-";
};

const getMailtoLink = (email?: string) => {
    const normalized = (email || "").trim();
    if (!normalized) {
        return "-";
    }

    return `<a href="mailto:${encodeURI(normalized)}" style="color:#1d4ed8; text-decoration:none; font-weight:600;">${escapeHtml(normalized)}</a>`;
};

const getTelLink = (phone?: string) => {
    const normalized = (phone || "").trim();
    if (!normalized) {
        return "-";
    }

    return `<a href="tel:${escapeHtml(normalized)}" style="color:#0f172a; text-decoration:none; font-weight:600;">${escapeHtml(normalized)}</a>`;
};

const createDetailRow = (label: string, value: string, borderless = false) => `
    <tr>
        <td style="padding:14px 0; ${borderless ? "" : "border-bottom:1px solid #e2e8f0;"}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td valign="top" style="width:130px; padding-right:16px; color:#64748b; font-size:13px; font-weight:700; letter-spacing:0.02em;">
                        ${label}
                    </td>
                    <td valign="top" style="color:#0f172a; font-size:15px; line-height:1.7; font-weight:600;">
                        ${value}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
`;

export const sendQuoteInquiryFallbackEmail = async (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
) => {
    return sendQuoteInquiryNotificationEmail(
        payload,
        [DEFAULT_QUOTE_REQUEST_RECEIVER_EMAIL],
        requester,
        { variant: "fallback" },
    );
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const getQuoteInquiryEmailHtml = (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
    variant: "standard" | "fallback" = "standard",
) => {
    const statusLabel = variant === "fallback" ? "Fallback 접수" : "정상 접수";
    const statusTone =
        variant === "fallback"
            ? "background:#fff1e6; color:#c2410c; border:1px solid #fdba74;"
            : "background:#dbeafe; color:#1d4ed8; border:1px solid #93c5fd;";
    const summaryMessage =
        variant === "fallback"
            ? "온라인 문의가 메일 fallback 경로로 접수되었습니다. DB 저장 상태도 함께 확인해 주세요."
            : "온라인 견적문의가 정상 접수되었습니다. 아래 내용을 확인한 뒤 고객에게 회신해 주세요.";
    const requesterEmail = requester?.userEmail || payload.email;
    const replyLink = requesterEmail
        ? `mailto:${encodeURI(requesterEmail)}?subject=${encodeURIComponent(`[휴먼파트너 답변] ${payload.companyName}`)}`
        : "";
    const productBadges =
        payload.neededProducts.length > 0
            ? payload.neededProducts
                  .map(
                      (item) => `
                        <span style="display:inline-block; margin:0 8px 8px 0; padding:10px 14px; border-radius:999px; background:#eef4ff; color:#153e75; font-size:13px; font-weight:700; border:1px solid #c7d7fe;">
                            ${escapeHtml(item)}
                        </span>
                    `,
                  )
                  .join("")
            : `
                <span style="display:inline-block; padding:10px 14px; border-radius:999px; background:#f8fafc; color:#64748b; font-size:13px; font-weight:700; border:1px solid #e2e8f0;">
                    선택된 품목 없음
                </span>
            `;

    const htmlContent = `
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
            휴먼파트너 견적문의가 접수되었습니다. 업체명 ${escapeHtml(payload.companyName)}, 담당자 ${escapeHtml(payload.contactName)}.
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#eef2f7; margin:0; padding:24px 0; font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
            <tr>
                <td align="center" style="padding:0 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; max-width:720px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #dbe4f0;">
                        <tr>
                            <td style="padding:0;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#0f2747;">
                                    <tr>
                                        <td style="padding:32px 36px 28px;">
                                            <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#93c5fd; font-weight:700; margin-bottom:14px;">
                                                Human Partner
                                            </div>
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td valign="top">
                                                        <h1 style="margin:0; font-size:30px; line-height:1.25; color:#ffffff; font-weight:800;">
                                                            견적 문의가 접수되었습니다
                                                        </h1>
                                                        <p style="margin:14px 0 0; font-size:15px; line-height:1.8; color:#d8e4f5;">
                                                            ${summaryMessage}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                                                <tr>
                                                    <td style="padding:8px 14px; border-radius:999px; font-size:12px; font-weight:800; ${statusTone}">
                                                        ${statusLabel}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding:28px 36px 0;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#f8fbff; border:1px solid #d7e3f2; border-radius:20px;">
                                                <tr>
                                                    <td style="padding:24px 24px 8px;">
                                                        <div style="font-size:13px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; color:#1d4ed8; margin-bottom:12px;">
                                                            Quick Summary
                                                        </div>
                                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                            ${createDetailRow("업체명", getDisplayValue(payload.companyName))}
                                                            ${createDetailRow("담당자명", getDisplayValue(payload.contactName))}
                                                            ${createDetailRow("이메일", getMailtoLink(payload.email))}
                                                            ${createDetailRow(
                                                                "렌탈 기간",
                                                                `${getDisplayValue(payload.rentalStart)} ~ ${getDisplayValue(payload.rentalEnd)}`,
                                                                true,
                                                            )}
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:24px 36px 0;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px;">
                                                <tr>
                                                    <td style="padding:24px 24px 16px;">
                                                        <div style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:6px;">
                                                            필요 품목
                                                        </div>
                                                        <div style="font-size:14px; color:#64748b; line-height:1.7; margin-bottom:16px;">
                                                            고객이 선택한 렌탈 품목입니다.
                                                        </div>
                                                        <div>
                                                            ${productBadges}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:24px 36px 0;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px;">
                                                <tr>
                                                    <td style="padding:24px 24px 8px;">
                                                        <div style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:16px;">
                                                            상세 정보
                                                        </div>
                                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                            ${createDetailRow("연락처", getTelLink(payload.phone))}
                                                            ${createDetailRow("예상 수량", getDisplayValue(payload.quantity))}
                                                            ${createDetailRow("예산 범위", getDisplayValue(payload.budget))}
                                                            ${createDetailRow("설치 / 회수 장소", getDisplayValue(payload.location), true)}
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:24px 36px 0;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px;">
                                                <tr>
                                                    <td style="padding:24px;">
                                                        <div style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:12px;">
                                                            요청 내용
                                                        </div>
                                                        <div style="padding:18px 18px; border-radius:16px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:15px; line-height:1.8;">
                                                            ${getMultilineDisplayValue(payload.notes)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:24px 36px 36px;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#f8fafc; border:1px solid #dbe5ef; border-radius:20px;">
                                                <tr>
                                                    <td style="padding:24px;">
                                                        <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:14px;">
                                                            문의자 정보
                                                        </div>
                                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                            ${createDetailRow("Requester UID", getDisplayValue(requester?.userId || "guest"))}
                                                            ${createDetailRow("Requester Name", getDisplayValue(requester?.userName || payload.contactName))}
                                                            ${createDetailRow("Requester Email", getMailtoLink(requesterEmail), true)}
                                                        </table>
                                                        ${
                                                            replyLink
                                                                ? `
                                                                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                                                                        <tr>
                                                                            <td>
                                                                                <a href="${replyLink}" style="display:inline-block; padding:13px 18px; border-radius:12px; background:#1d4ed8; color:#ffffff; text-decoration:none; font-size:14px; font-weight:800;">
                                                                                    문의자에게 바로 회신하기
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                `
                                                                : ""
                                                        }
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;

    return htmlContent;
};

export const sendQuoteInquiryNotificationEmail = async (
    payload: QuoteInquiryPayload,
    recipients: string[],
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
    options?: {
        variant?: "standard" | "fallback";
    },
) => {
    const finalRecipients = Array.from(
        new Set(
            recipients
                .map((item) => normalizeEmail(item))
                .filter(Boolean),
        ),
    );

    const targetRecipients =
        finalRecipients.length > 0 ? finalRecipients : [DEFAULT_QUOTE_REQUEST_RECEIVER_EMAIL];

    return sendSiteEmailRequest({
        to: targetRecipients,
        subject: `[휴먼파트너 견적문의] ${payload.companyName} / ${payload.contactName}`,
        html: getQuoteInquiryEmailHtml(payload, requester, options?.variant || "standard"),
        replyTo: requester?.userEmail || payload.email,
    });
};
