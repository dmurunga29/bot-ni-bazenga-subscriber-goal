
const REDIRECT_URI =
  "https://singular-bienenstitch-ad22d2.netlify.app/.netlify/functions/oauth";

const COOKIE = "youtube_oauth_state";

export default async (request) => {
  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in Netlify." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookies = Object.fromEntries(
    (request.headers.get("cookie") || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [item.slice(0, index), item.slice(index + 1)];
      })
  );

  if (!code) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const newState = Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const authUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );

    authUrl.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      access_type: "offline",
      prompt: "consent",
      state: newState,
    }).toString();

    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl.toString(),
        "Set-Cookie":
          `${COOKIE}=${newState}; Max-Age=600; Path=/.netlify/functions/oauth; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (!state || !cookies[COOKIE] || state !== cookies[COOKIE]) {
    return Response.json(
      { error: "Invalid or expired OAuth state. Start authorization again." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const tokenResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    }
  );

  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return Response.json(
      { error: "Google token exchange failed.", details: tokens.error },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(
    {
      message: "Google authorization successful.",
      refresh_token: tokens.refresh_token || null,
      note: tokens.refresh_token
        ? "Save this refresh token securely in Netlify."
        : "Google did not return a refresh token. Reauthorize with consent.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie":
          `${COOKIE}=; Max-Age=0; Path=/.netlify/functions/oauth; HttpOnly; Secure; SameSite=Lax`,
      },
    }
  );
};
