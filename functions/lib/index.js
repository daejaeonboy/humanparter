"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSiteEmailV2 = void 0;
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const https_1 = require("firebase-functions/v2/https");
dotenv.config();
const normalizeEnvValue = (value) => {
    if (!value) {
        return "";
    }
    return value.trim().replace(/^['"]|['"]$/g, "");
};
const normalizeRecipientList = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "string" ? normalizeEnvValue(item) : ""))
            .filter(Boolean);
    }
    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => normalizeEnvValue(item))
            .filter(Boolean);
    }
    return [];
};
exports.sendSiteEmailV2 = (0, https_1.onRequest)({
    region: "us-central1",
    cors: true,
    invoker: "public",
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    const { to, subject, html, replyTo } = req.body || {};
    const recipientList = normalizeRecipientList(to);
    const normalizedReplyTo = typeof replyTo === "string" ? normalizeEnvValue(replyTo) : "";
    if (recipientList.length === 0 || !subject || !html) {
        res.status(400).json({ error: "Missing required fields (to, subject, html)" });
        return;
    }
    const emailUser = normalizeEnvValue(process.env.EMAIL_USER);
    const emailPass = normalizeEnvValue(process.env.EMAIL_PASS);
    const emailFromName = normalizeEnvValue(process.env.EMAIL_FROM_NAME) || "\uD734\uBA3C\uD30C\uD2B8\uB108";
    const smtpHost = normalizeEnvValue(process.env.SMTP_HOST);
    const smtpPort = parseInt(normalizeEnvValue(process.env.SMTP_PORT) || "587", 10);
    const smtpSecure = normalizeEnvValue(process.env.SMTP_SECURE) === "true";
    if (!emailUser || !emailPass) {
        console.error("Missing SMTP credentials. Check EMAIL_USER/EMAIL_PASS.");
        res.status(500).json({ error: "Missing SMTP credentials" });
        return;
    }
    const transporter = nodemailer.createTransport(smtpHost
        ? {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        }
        : {
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
    const mailOptions = {
        from: `"${emailFromName}" <${emailUser}>`,
        to: recipientList.join(", "),
        subject,
        html,
        replyTo: normalizedReplyTo || undefined,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        res.status(200).json({ message: "Email sent successfully", info });
    }
    catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email", details: error.message });
    }
});
//# sourceMappingURL=index.js.map