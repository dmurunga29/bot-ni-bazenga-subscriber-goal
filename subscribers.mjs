export default async () => {
  const apiKey = Netlify.env.get("YOUTUBE_API_KEY");
  const channelId = Netlify.env.get("YOUTUBE_CHANNEL_ID");

  if (!apiKey || !channelId) {
    return Response.json(
      { error: "Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID environment variable." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const endpoint = new URL("https://www.googleapis.com/youtube/v3/channels");
  endpoint.searchParams.set("part", "statistics");
  endpoint.searchParams.set("id", channelId);
  endpoint.searchParams.set("key", apiKey);

  try {
    const response = await fetch(endpoint, { headers: { "Accept": "application/json" } });
    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: "YouTube API request failed. Check API key restrictions and quota." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }
    const channel = data.items?.[0];
    if (!channel) {
      return Response.json(
        { error: "Channel not found. Check YOUTUBE_CHANNEL_ID." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (channel.statistics?.hiddenSubscriberCount) {
      return Response.json(
        { error: "This channel's subscriber count is hidden." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const count = Number(channel.statistics?.subscriberCount);
    return Response.json(
      { subscriberCount: count, rounded: true, goal: 1000 },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch {
    return Response.json(
      { error: "Could not reach YouTube API." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
};
