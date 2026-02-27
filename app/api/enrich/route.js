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
    const websiteText = extractVisibleText(html);
    const summary = buildSummary(parsedUrl, title);
    const whatTheyDo = buildWhatTheyDo(parsedUrl, description, websiteText);
    const { keywords, signals } = detectVcSignals(websiteText, title, description);
    const technicalSignals = buildSignals(websiteFetchWarning, title, description);
    const sources = [parsedUrl.toString()];

    const result = [
      "Summary:",
      summary,
      "",
      "What they do:",
      whatTheyDo,
      "",
      "Keywords:",
      ...keywords.map((item) => `- ${item}`),
      "",
      "Signals:",
      ...signals.map((item) => `- ${item}`),
      ...technicalSignals.map((item) => `- ${item}`),
      "",
      "Sources:",
      ...sources.map((item) => `- ${item}`),
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

function extractVisibleText(html) {
  if (!html) return "";
  return sanitizeString(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function getDomainKeyword(url) {
  const host = url.hostname.replace(/^www\./, "");
  return host.split(".")[0];
}

function buildSummary(url, title) {
  const domain = getDomainKeyword(url);
  if (title) return `${title} is a company currently tracked in this VC discovery workflow.`;
  return `${domain} appears to be an active startup/company website identified for investment research.`;
}

function buildWhatTheyDo(url, description, websiteText) {
  const domain = getDomainKeyword(url);
  if (description) return description;

  const snippet = websiteText.slice(0, 180);
  if (snippet) return `${snippet}...`;

  return `${domain} has limited public metadata; additional diligence is recommended to confirm product and market focus.`;
}

function detectVcSignals(text, title, description) {
  const corpus = `${text} ${title || ""} ${description || ""}`.toLowerCase();
  const keywords = [];
  const signals = [];

  const add = (keyword, signal) => {
    if (!keywords.includes(keyword)) keywords.push(keyword);
    if (!signals.includes(signal)) signals.push(signal);
  };

  if (includesAny(corpus, ["fintech", "payment", "payments"])) {
    add("Fintech", "💳 Payments infrastructure");
  }
  if (includesAny(corpus, ["api", "developer", "sdk"])) {
    add("Developer Platform", "⚙️ Developer ecosystem");
  }
  if (includesAny(corpus, ["ai", "artificial intelligence", "machine learning", "ml"])) {
    add("Artificial Intelligence", "🧠 AI-driven product");
  }
  if (includesAny(corpus, ["saas", "software as a service", "subscription"])) {
    add("SaaS", "☁️ Recurring software model");
  }
  if (includesAny(corpus, ["productivity", "workspace", "collaboration"])) {
    add("Productivity", "📊 Productivity software");
  }
  if (includesAny(corpus, ["platform"])) {
    add("Platform", "🧩 Platform business model");
  }

  if (keywords.length === 0) {
    keywords.push("Early Signal");
    signals.push("🔎 Limited explicit signals detected from public metadata");
  }

  return {
    keywords: keywords.slice(0, 5),
    signals: signals.slice(0, 5),
  };
}

function buildSignals(fetchWarning, title, description) {
  return [
    fetchWarning || "Website fetched successfully for enrichment.",
    title ? "Title metadata is present." : "Title metadata is missing.",
    description ? "Meta description is present." : "Meta description is missing.",
  ];
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}
