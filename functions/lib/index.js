"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicDataV1 = exports.sendSiteEmailV2 = void 0;
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const publicData_1 = require("./publicData");
dotenv.config();
const emailUserSecret = (0, params_1.defineSecret)("EMAIL_USER");
const emailPassSecret = (0, params_1.defineSecret)("EMAIL_PASS");
const emailFromNameSecret = (0, params_1.defineSecret)("EMAIL_FROM_NAME");
const smtpHostSecret = (0, params_1.defineSecret)("SMTP_HOST");
const smtpPortSecret = (0, params_1.defineSecret)("SMTP_PORT");
const smtpSecureSecret = (0, params_1.defineSecret)("SMTP_SECURE");
const LOCAL_ENV_KEYS = {
    emailUser: "LOCAL_EMAIL_USER",
    emailPass: "LOCAL_EMAIL_PASS",
    emailFromName: "LOCAL_EMAIL_FROM_NAME",
    smtpHost: "LOCAL_SMTP_HOST",
    smtpPort: "LOCAL_SMTP_PORT",
    smtpSecure: "LOCAL_SMTP_SECURE",
};
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
    secrets: [
        emailUserSecret,
        emailPassSecret,
        emailFromNameSecret,
        smtpHostSecret,
        smtpPortSecret,
        smtpSecureSecret,
    ],
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
    const emailUser = normalizeEnvValue(emailUserSecret.value() || process.env[LOCAL_ENV_KEYS.emailUser]);
    const emailPass = normalizeEnvValue(emailPassSecret.value() || process.env[LOCAL_ENV_KEYS.emailPass]);
    const emailFromName = normalizeEnvValue(emailFromNameSecret.value() || process.env[LOCAL_ENV_KEYS.emailFromName]) || "\uD734\uBA3C\uD30C\uD2B8\uB108";
    const smtpHost = normalizeEnvValue(smtpHostSecret.value() || process.env[LOCAL_ENV_KEYS.smtpHost]);
    const smtpPort = parseInt(normalizeEnvValue(smtpPortSecret.value() || process.env[LOCAL_ENV_KEYS.smtpPort]) || "587", 10);
    const smtpSecure = normalizeEnvValue(smtpSecureSecret.value() || process.env[LOCAL_ENV_KEYS.smtpSecure]) === "true";
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
exports.publicDataV1 = (0, https_1.onRequest)({
    region: "us-central1",
    cors: true,
    invoker: "public",
}, async (req, res) => {
    await (0, publicData_1.handlePublicDataRequest)(req, res);
});
//# sourceMappingURL=index.js.map