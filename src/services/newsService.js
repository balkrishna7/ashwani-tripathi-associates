const Parser = require("rss-parser");

const { fallbackNews } = require("../utils/fallbacks");

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["description", "description"]
    ]
  }
});

const FEEDS = [
  { query: "India legal news", category: "Civil" },
  { query: "Supreme Court India latest judgement", category: "Criminal" },
  { query: "Allahabad High Court latest order", category: "Civil" },
  { query: "India corporate law compliance", category: "Corporate" }
];

const imageByCategory = {
  Civil:
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=900&q=80",
  Criminal:
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80",
  Corporate:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80"
};

let cache = {
  mode: "fallback",
  fetchedAt: null,
  items: [...fallbackNews]
};

function buildFeedUrl(query) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-IN&gl=IN&ceid=IN:en`;
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function limitText(value = "", limit = 180) {
  const text = stripHtml(value);
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trimEnd()}...`;
}

function detectCategory(title = "", body = "", defaultCategory = "Civil") {
  const text = `${title} ${body}`.toLowerCase();

  if (text.includes("criminal") || text.includes("bail") || text.includes("fir")) {
    return "Criminal";
  }

  if (
    text.includes("company") ||
    text.includes("corporate") ||
    text.includes("sebi") ||
    text.includes("compliance") ||
    text.includes("gst")
  ) {
    return "Corporate";
  }

  return defaultCategory;
}

function buildInsight(title = "", excerpt = "", category = "Civil") {
  if (category === "Criminal") {
    return "AI takeaway: fast factual preservation and procedural clarity remain critical in criminal matters.";
  }

  if (category === "Corporate") {
    return "AI takeaway: documentation, regulation, and commercial records often shape the next legal step.";
  }

  return "AI takeaway: accurate records and early legal framing usually improve dispute readiness.";
}

function parseImage(item, category) {
  const mediaContent = item.mediaContent?.[0]?.$?.url;
  const mediaThumbnail = item.mediaThumbnail?.[0]?.$?.url;
  const descriptionMatch = String(item.description || "").match(
    /<img[^>]+src="([^"]+)"/i
  );

  return (
    mediaContent ||
    mediaThumbnail ||
    descriptionMatch?.[1] ||
    imageByCategory[category] ||
    imageByCategory.Civil
  );
}

function normalizeItem(item, feed, index) {
  const title = String(item.title || "").replace(/\s+-\s+[^-]+$/, "").trim();
  const excerpt = limitText(
    item.contentSnippet || item.content || item.description || title
  );
  const category = detectCategory(title, excerpt, feed.category);

  return {
    id: item.guid || item.link || `${category.toLowerCase()}-${index}-${Date.now()}`,
    title,
    excerpt,
    image: parseImage(item, category),
    category,
    source: item.source?.title || "Google News",
    date: item.isoDate || item.pubDate || new Date().toISOString(),
    link: item.link || "",
    insight: buildInsight(title, excerpt, category)
  };
}

function uniqueNews(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.title}-${item.source}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function refreshNews() {
  const settled = await Promise.allSettled(
    FEEDS.map((feed) => parser.parseURL(buildFeedUrl(feed.query)))
  );

  const liveItems = settled.flatMap((result, feedIndex) => {
    if (result.status !== "fulfilled") {
      return [];
    }

    const feed = FEEDS[feedIndex];
    return (result.value.items || []).slice(0, 4).map((item, itemIndex) =>
      normalizeItem(item, feed, itemIndex)
    );
  });

  const items = uniqueNews(liveItems)
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 6);

  if (!items.length) {
    throw new Error("No live news items were returned from the feeds.");
  }

  cache = {
    mode: "live",
    fetchedAt: new Date().toISOString(),
    items
  };

  return cache;
}

async function getLegalNews(options = {}) {
  const cacheMinutes = Number(process.env.NEWS_CACHE_MINUTES || 15);
  const isFresh =
    cache.fetchedAt &&
    Date.now() - new Date(cache.fetchedAt).getTime() < cacheMinutes * 60 * 1000;

  if (!options.force && isFresh && cache.items.length) {
    return cache;
  }

  try {
    return await refreshNews();
  } catch (error) {
    cache = {
      mode: "fallback",
      fetchedAt: new Date().toISOString(),
      items: cache.items.length ? cache.items : [...fallbackNews]
    };

    return cache;
  }
}

module.exports = {
  getLegalNews
};
