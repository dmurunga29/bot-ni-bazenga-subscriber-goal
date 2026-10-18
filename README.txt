BOT_NI_BAZENGA LIVE SUBSCRIBER GOAL — DEPLOY GUIDE

This package includes:
- index.html: Meld-style red/black widget, transparent outside the panel, gentle animated lower glow, goal 501 / 1000.
- netlify/functions/subscribers.mjs: server-side YouTube Data API function.
- netlify.toml: tells Netlify where the published files and function are.

IMPORTANT: Because you used Netlify Drop, the function needs a deployment that processes Netlify Functions. Netlify docs describe deploying function code from a project folder via Netlify CLI or a connected Git repository. A simple static drag-and-drop deploy may publish the function file as a file rather than execute it.

Netlify environment variables needed:
1. YOUTUBE_API_KEY = your API key (already added in Netlify)
2. YOUTUBE_CHANNEL_ID = your channel's UC... ID

To get the channel ID:
- Open YouTube Studio for @bot_ni_bazenga, then Settings > Channel > Advanced settings and copy the Channel ID.
- Add it in Netlify Project configuration > Environment variables under key YOUTUBE_CHANNEL_ID.
- Do not put the API key in index.html or send it to anyone.

Then deploy this project using Netlify CLI or connect it to a Git repository so Netlify processes netlify/functions/subscribers.mjs. Once deployed, test:
https://YOUR-SITE.netlify.app/.netlify/functions/subscribers

The function returns YouTube's public subscriber count, which may be rounded to three significant figures (e.g. 501 can appear as 500). It cannot read Meld's private Spark widget URL.
