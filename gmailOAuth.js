const { google } = require("googleapis");
const gmailTokenModel = require("./api/models/gmailTokenModel");

const GOOGLE_CLIENT_ID = process.env.google_client_id;
const GOOGLE_CLIENT_SECRET = process.env.google_client_secret;
const ENV_TYPE = (process.env.env_type || "development").trim().toLowerCase();
const GOOGLE_REDIRECT_URI = ENV_TYPE === "production"
  ? (process.env.google_redirect_uri || process.env.google_redirect_uri_render || process.env.google_redirect_uri_local)
  : (process.env.google_redirect_uri_local || process.env.google_redirect_uri || process.env.google_redirect_uri_render);
const GMAIL_USER = process.env.gmail_user;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !GMAIL_USER) {
  console.warn("Gmail OAuth env vars are incomplete. Gmail email sending will be unavailable until .env is configured.");
}


const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const getGoogleAuthUrl = () => {
  const scopes = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
};

const saveToken = async ({ refreshToken, accessToken, expiryDate, tokenType }) => {
  const payload = {
    provider: "gmail",
    refreshToken,
    accessToken,
    expiryDate,
    tokenType,
  };

  const existing = await gmailTokenModel.findOne({ provider: "gmail" });
  if (existing) {
    return gmailTokenModel.findByIdAndUpdate(
      existing._id,
      { $set: payload },
      { new: true }
    );
  }

  return gmailTokenModel.create(payload);
};

const loadStoredToken = async () => {
  const tokenDoc = await gmailTokenModel.findOne({ provider: "gmail" });
  if (!tokenDoc || !tokenDoc.refreshToken) {
    return null;
  }

  return {
    refresh_token: tokenDoc.refreshToken,
    access_token: tokenDoc.accessToken,
    expiry_date: tokenDoc.expiryDate ? new Date(tokenDoc.expiryDate).getTime() : undefined,
    token_type: tokenDoc.tokenType,
  };
};

const setOAuthCredentials = async () => {
  const storedToken = await loadStoredToken();

  if (!storedToken) {
    return null;
  }

  oauth2Client.setCredentials(storedToken);
  return oauth2Client;
};

const exchangeCodeForToken = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  await saveToken({
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    tokenType: tokens.token_type || "Bearer",
  });

  return tokens;
};

const createGmailTransporter = async () => {
  const authClient = await setOAuthCredentials();

  if (!authClient) {
    throw new Error("No Gmail refresh token is configured. Generate one via the Google OAuth route first.");
  }

  const gmail = google.gmail({ version: "v1", auth: authClient });

  return {
    gmail,
    authClient,
    sender: GMAIL_USER,
  };
};

const sendGmailMail = async ({ to, subject, html, text }) => {
  const { gmail, sender } = await createGmailTransporter();
  const messageParts = [
    `From: "HealthSupport" <${sender}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html || text || "",
  ];

  const raw = Buffer.from(messageParts.join("\r\n")).toString("base64url");
  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return response.data;
};

module.exports = {
  oauth2Client,
  getGoogleAuthUrl,
  exchangeCodeForToken,
  saveToken,
  loadStoredToken,
  setOAuthCredentials,
  createGmailTransporter,
  sendGmailMail,
  getGoogleClientId: () => GOOGLE_CLIENT_ID,
  getGoogleRedirectUri: () => GOOGLE_REDIRECT_URI,
};
