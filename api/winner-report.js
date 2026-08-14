const MAX_NICKNAME_LENGTH = 32;
const MAX_PASSWORD_LENGTH = 64;
const MAX_MESSAGE_LENGTH = 240;

function response(body, status, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

function permittedOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return undefined;
  const requestOrigin = new URL(request.url).origin;
  const configured = (process.env.ALLOWED_ORIGIN ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return origin === requestOrigin || configured.includes(origin) ? origin : null;
}

function formatUtc(value) {
  const pad = (number) => String(number).padStart(2, "0");
  return `${pad(value.getUTCMonth() + 1)}/${pad(value.getUTCDate())}/${value.getUTCFullYear()} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())} UTC`;
}

export default {
  async fetch(request) {
    const origin = permittedOrigin(request);
    if (origin === null) return response({ message: "Origin is not allowed." }, 403);

    if (request.method === "OPTIONS") {
      const headers = {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      };
      if (origin) headers["Access-Control-Allow-Origin"] = origin;
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") return response({ message: "Method not allowed." }, 405, origin);

    let body;
    try {
      body = await request.json();
    } catch {
      return response({ message: "Invalid JSON body." }, 400, origin);
    }

    const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
    const gameVersion = typeof body.gameVersion === "string" ? body.gameVersion.trim() : "";
    const hiddenPassword = typeof body.hiddenPassword === "string" ? body.hiddenPassword : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!nickname || nickname.length > MAX_NICKNAME_LENGTH) {
      return response({ message: "Nickname must contain 1 to 32 characters." }, 400, origin);
    }
    if (!/^[0-9A-Za-z][0-9A-Za-z.+_-]{0,23}$/.test(gameVersion)) {
      return response({ message: "Game version is missing or invalid." }, 400, origin);
    }
    if (!hiddenPassword || hiddenPassword.length > MAX_PASSWORD_LENGTH) {
      return response({ message: "Hidden password must contain 1 to 64 characters." }, 400, origin);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return response({ message: "Message must not exceed 240 characters." }, 400, origin);
    }

    const webhookUrl = process.env.DISCORD_WINNER_WEBHOOK_URL;
    if (!webhookUrl) return response({ message: "Winner report webhook is not configured." }, 503, origin);

    const arrivedAt = new Date();
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "NELG++ Winner Reports",
        allowed_mentions: { parse: [] },
        embeds: [{
          title: "NELG++ Winner Report",
          color: 0xff9900,
          fields: [
            { name: "Nickname", value: nickname, inline: true },
            { name: "Arrival Time", value: formatUtc(arrivedAt), inline: true },
            { name: "Game Version", value: gameVersion, inline: true },
            { name: "Hidden Password", value: `||${hiddenPassword.replaceAll("|", "¦")}||`, inline: false },
            { name: "Message", value: message || "(No message)", inline: false },
          ],
          footer: { text: "Never Ending Level Game ++ - Manual Hall of Fame review required" },
          timestamp: arrivedAt.toISOString(),
        }],
      }),
    });

    if (!webhookResponse.ok) {
      const retryAfter = webhookResponse.headers.get("Retry-After");
      return response({
        message: webhookResponse.status === 429
          ? `Discord is rate limiting reports. Try again after ${retryAfter ?? "a short wait"}.`
          : `Discord rejected the report (${webhookResponse.status}).`,
      }, 502, origin);
    }

    return response({ ok: true, achievedAt: arrivedAt.toISOString(), displayTime: formatUtc(arrivedAt) }, 200, origin);
  },
};
