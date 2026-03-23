import type { QuoteInquiryPayload } from "../api/inquiryApi";

const DEFAULT_SITE_EMAIL_API_URL =
    "https://us-central1-human-partner.cloudfunctions.net/sendSiteEmail";
const configuredSiteEmailApiUrl = (import.meta.env.VITE_SITE_EMAIL_API_URL || "").trim();
const QUOTE_REQUEST_RECEIVER_EMAIL = "hm_solution@naver.com";

const getSiteEmailApiUrl = () => {
    if (configuredSiteEmailApiUrl) {
        return configuredSiteEmailApiUrl;
    }

    return DEFAULT_SITE_EMAIL_API_URL;
};

const sendSiteEmailRequest = async (params: {
    to: string;
    subject: string;
    html: string;
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

export const sendQuoteInquiryFallbackEmail = async (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
) => {
    const productList =
        payload.neededProducts.length > 0
            ? `<ul style="margin:8px 0 0; padding-left:18px;">${payload.neededProducts
                  .map((item) => `<li>${escapeHtml(item)}</li>`)
                  .join("")}</ul>`
            : '<p style="margin:8px 0 0;">선택된 품목이 없습니다.</p>';

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; color: #0f172a;">
            <h1 style="margin: 0 0 8px; color: #001e45; font-size: 24px;">휴먼파트너 견적 문의 접수</h1>
            <p style="margin: 0 0 20px; color: #475569; font-size: 14px;">
                온라인 문의가 메일 fallback 경로로 접수되었습니다.
            </p>

            <div style="display: grid; gap: 12px; line-height: 1.6;">
                <div><strong>업체명</strong><br/>${escapeHtml(payload.companyName)}</div>
                <div><strong>담당자명</strong><br/>${escapeHtml(payload.contactName)}</div>
                <div><strong>연락처</strong><br/>${escapeHtml(payload.phone)}</div>
                <div><strong>이메일</strong><br/>${escapeHtml(payload.email)}</div>
                <div><strong>필요 품목</strong>${productList}</div>
                <div><strong>렌탈 시작일</strong><br/>${escapeHtml(payload.rentalStart || "-")}</div>
                <div><strong>렌탈 종료일</strong><br/>${escapeHtml(payload.rentalEnd || "-")}</div>
                <div><strong>예상 수량</strong><br/>${escapeHtml(payload.quantity || "-")}</div>
                <div><strong>예산 범위</strong><br/>${escapeHtml(payload.budget || "-")}</div>
                <div><strong>설치 / 회수 장소</strong><br/>${escapeHtml(payload.location || "-")}</div>
                <div><strong>요청 내용</strong><br/><div style="margin-top: 8px; white-space: pre-wrap; padding: 12px; background: #f8fafc; border-radius: 10px;">${escapeHtml(payload.notes)}</div></div>
            </div>

            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

            <div style="font-size: 13px; color: #64748b; line-height: 1.7;">
                <div><strong>Requester UID</strong>: ${escapeHtml(requester?.userId || "guest")}</div>
                <div><strong>Requester Name</strong>: ${escapeHtml(requester?.userName || payload.contactName)}</div>
                <div><strong>Requester Email</strong>: ${escapeHtml(requester?.userEmail || payload.email)}</div>
            </div>
        </div>
    `;

    return sendSiteEmailRequest({
        to: QUOTE_REQUEST_RECEIVER_EMAIL,
        subject: `[휴먼파트너 견적문의] ${payload.companyName} / ${payload.contactName}`,
        html: htmlContent,
    });
};
