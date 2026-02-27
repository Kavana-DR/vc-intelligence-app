import OpenAI from "openai";

export async function POST(req) {
  try {
    const { website } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    if (!website || typeof website !== "string") {
      return Response.json({ error: "Website is required" }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(website);
    } catch {
      return Response.json({ error: "Invalid website URL" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return Response.json({ error: "Only http/https URLs are supported" }, { status: 400 });
    }

    let html = "";
    let websiteFetchWarning = "";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VC-Discovery/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if (response.ok) {
        html = await response.text();
      } else {
        websiteFetchWarning = `Website content fetch failed with status ${response.status}.`;
      }
    } catch (fetchError) {
      websiteFetchWarning = `Website content fetch failed: ${fetchError?.message || "Unknown error"}.`;
    } finally {
      clearTimeout(timeout);
    }

    const title = extractTitle(html);
    const description = extractMetaDescription(html);

    const baseResult = {
      summary: "",
      whatTheyDo: [],
      keywords: [],
      signals: [],
      sources: [parsedUrl.toString()],
      metadata: {
        title: title || "Unavailable",
        description: description || "Unavailable",
      },
    };

    const openai = new OpenAI({
      apiKey,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You are a VC research analyst.",
              "Return valid JSON only with keys: summary, whatTheyDo, keywords, signals, sources.",
              "Constraints: summary string (max 2 sentences), whatTheyDo array of 3-5 strings, keywords array of 5 strings, signals array of 3 strings, sources array of URLs/labels.",
            ].join(" "),
          },
          {
            role: "user",
            content: `Website URL: ${parsedUrl.toString()}
Website title: ${title || "Unavailable"}
Meta description: ${description || "Unavailable"}
Website fetch status: ${websiteFetchWarning || "Fetched successfully"}
Website content:
${html ? html.slice(0, 7000) : "No HTML captured. Use only metadata and URL context."}`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw);

      const result = {
        ...baseResult,
        summary: sanitizeString(parsed.summary) || buildFallbackSummary(parsedUrl, title, description),
        whatTheyDo: sanitizeStringArray(parsed.whatTheyDo, 5),
        keywords: sanitizeStringArray(parsed.keywords, 5),
        signals: sanitizeStringArray(parsed.signals, 5),
        sources: sanitizeStringArray(parsed.sources, 5).length
          ? sanitizeStringArray(parsed.sources, 5)
          : baseResult.sources,
      };

      if (websiteFetchWarning) {
        result.signals = [...result.signals, websiteFetchWarning].slice(0, 5);
      }

      return Response.json({ result });
    } catch (aiError) {
      console.error("ENRICH MODEL ERROR:", aiError);

      const result = {
        ...baseResult,
        summary: buildFallbackSummary(parsedUrl, title, description),
        whatTheyDo: buildFallbackWhatTheyDo(parsedUrl, description),
        keywords: buildFallbackKeywords(parsedUrl, title, description),
        signals: [
          websiteFetchWarning || "Website fetched successfully",
          "AI enrichment temporarily unavailable; fallback generated from metadata.",
          "Retry enrichment later for richer model-generated insights.",
        ],
      };

      return Response.json({ result });
    }
  } catch (error) {
    console.error("ENRICH ERROR:", error);
    return Response.json({ error: "Unable to enrich this company right now. Please try again." }, { status: 500 });
  }
}

function extractTitle(html) {
  if (!html) return "";
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return sanitizeString(match?.[1] || "");
}

function extractMetaDescription(html) {
  if (!html) return "";
  const match =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  return sanitizeString(match?.[1] || "");
}

function sanitizeString(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeStringArray(value, maxLen) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeString(String(item)))
    .filter(Boolean)
    .slice(0, maxLen);
}

function getDomainKeyword(url) {
  const host = url.hostname.replace(/^www\./, "");
  return host.split(".")[0];
}

function buildFallbackSummary(url, title, description) {
  const domain = getDomainKeyword(url);
  if (description) return `${description} Further validation is recommended from additional public sources.`;
  if (title) return `${title} appears to be an active company website for ${domain}. Further validation is recommended from additional public sources.`;
  return `${domain} appears to be an active company domain. Further validation is recommended from additional public sources.`;
}

function buildFallbackWhatTheyDo(url, description) {
  const domain = getDomainKeyword(url);
  return [
    description || "Primary positioning could not be confirmed from website metadata.",
    `Operates under the ${domain} brand/domain presence.`,
    "Public website content is available for diligence review.",
    "Requires manual validation of product, target users, and business model.",
    "Likely early-stage digital business based on web footprint.",
  ];
}

function buildFallbackKeywords(url, title, description) {
  const domain = getDomainKeyword(url);
  const words = `${title || ""} ${description || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3);

  const unique = Array.from(new Set([domain, ...words]));
  return unique.slice(0, 5);
}
