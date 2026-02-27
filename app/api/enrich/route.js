export async function POST(req) {
  try {
    const { website } = await req.json();

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
    const summary = buildSummary(parsedUrl, title, description);
    const whatTheyDo = buildWhatTheyDo(parsedUrl, title, description);
    const keywords = buildKeywords(parsedUrl, title, description);
    const signals = buildSignals(websiteFetchWarning, title, description);
    const sources = [parsedUrl.toString()];

    const result = [
      `Summary: ${summary}`,
      "",
      "What they do:",
      ...whatTheyDo.map((item) => `- ${item}`),
      "",
      "Keywords:",
      `- ${keywords.join(", ")}`,
      "",
      "Signals:",
      ...signals.map((item) => `- ${item}`),
      "",
      "Sources:",
      ...sources.map((item) => `- ${item}`),
      "",
      "Metadata:",
      `- Title: ${title || "Unavailable"}`,
      `- Description: ${description || "Unavailable"}`,
    ].join("\n");

    return Response.json({ result });
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

function getDomainKeyword(url) {
  const host = url.hostname.replace(/^www\./, "");
  return host.split(".")[0];
}

function buildSummary(url, title, description) {
  const domain = getDomainKeyword(url);
  if (description) return `${description} Further validation is recommended from additional public sources.`;
  if (title) return `${title} appears to be an active company website for ${domain}. Further validation is recommended from additional public sources.`;
  return `${domain} appears to be an active company domain. Further validation is recommended from additional public sources.`;
}

function buildWhatTheyDo(url, title, description) {
  const domain = getDomainKeyword(url);
  const titleHint = title ? `Website title suggests focus around: ${title}.` : "Website title is unavailable.";
  return [
    description || "Primary positioning could not be confirmed from website metadata.",
    titleHint,
    `Operates under the ${domain} brand/domain presence.`,
    "Public website content is available for diligence review.",
    "Requires manual validation of product, target users, and business model.",
  ];
}

function buildKeywords(url, title, description) {
  const domain = getDomainKeyword(url);
  const words = `${title || ""} ${description || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3);

  const unique = Array.from(new Set([domain, ...words]));
  return unique.slice(0, 5).length ? unique.slice(0, 5) : [domain, "startup", "company", "product", "market"];
}

function buildSignals(fetchWarning, title, description) {
  return [
    fetchWarning || "Website fetched successfully for enrichment.",
    title ? "Title metadata is present." : "Title metadata is missing.",
    description ? "Meta description is present." : "Meta description is missing.",
  ];
}
