# Google Calendar & Meet Setup Guide
# Safe Room

Follow these steps to connect Google Calendar and Meet to the platform.
This only needs to be done once.

---

## Step 1 — Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name it: `safe-room`
4. Click **Create**

---

## Step 2 — Enable Required APIs

In the Google Cloud Console, go to **APIs & Services → Library** and enable:

- **Google Calendar API**
- (Meet links are automatically generated via Calendar — no separate Meet API needed)

---

## Step 3 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - User type: **External**
   - App name: `Safe Room`
   - Support email: your email
   - Developer contact: your email
   - Add scope: `https://www.googleapis.com/auth/calendar`
   - Add your own Google account as a **Test user**
4. Back in Credentials, choose:
   - Application type: **Web application**
   - Name: `Safe Room`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
   - For production, also add: `https://yourdomain.com/api/auth/google/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** into your `.env.local`:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Step 4 — Get a Refresh Token

This is a one-time step to authorise the Google account.

1. In your terminal, create a temporary file `get-token.js`:

```js
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET",
  "http://localhost:3000/api/auth/google/callback"
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/calendar"],
  prompt: "consent",
});

console.log("Visit this URL and authorise:", url);
```

2. Run it:  `node get-token.js`
3. Open the URL it prints in your browser
4. Sign in with **The Google account** (the one whose calendar will be used)
5. After approving, you'll be redirected to a localhost URL with a `?code=` param

6. Exchange the code for tokens — add this to `get-token.js`:

```js
// replace "THE_CODE" with the code from the URL
const { tokens } = await oauth2Client.getToken("THE_CODE");
console.log("Refresh token:", tokens.refresh_token);
```

7. Copy the `refresh_token` into your `.env.local`:

```
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

---

## Step 5 — Set Calendar ID

If Efe wants sessions to appear on her primary Google Calendar:
```
GOOGLE_CALENDAR_ID=primary
```

If she wants a separate calendar, create one in Google Calendar settings and
use its calendar ID (looks like an email address).

---

## Step 6 — Set Counselor Email

```
COUNSELOR_EMAIL=saveroom@gmail.com   #The actual Google account email
```

This email is added as the organiser on every calendar event.

---

## Done! 

When a booking is made, the platform will:
1. Create a Google Calendar event on Efe's calendar
2. Auto-generate a Google Meet link via the conferencing data API
3. Add both Efe and the client as attendees
4. Send calendar invites to both parties
5. Include the Meet link in the confirmation email

---

## Troubleshooting

**"invalid_grant" error** — Your refresh token expired. Repeat Step 4.
**"Access Not Configured"** — You forgot to enable the Calendar API in Step 2.
**"redirect_uri_mismatch"** — The redirect URI in your OAuth credentials doesn't
  match `GOOGLE_REDIRECT_URI` in `.env.local`.