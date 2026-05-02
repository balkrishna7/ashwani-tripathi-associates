const CONFIG = {
  apiBase: "https://lawyer-website-yske.onrender.com",
  newsEndpoints: [
    "https://lawyer-website-yske.onrender.com/api/news",
    "https://lawyer-website-yske.onrender.com/news",
    "https://lawyer-website-yske.onrender.com/api/legal-news"
  ],
  blogEndpoints: [
    "https://lawyer-website-yske.onrender.com/api/blog",
    "https://lawyer-website-yske.onrender.com/blog",
    "https://lawyer-website-yske.onrender.com/api/blogs"
  ],
  blogPostEndpoints: [
    "https://lawyer-website-yske.onrender.com/api/blog",
    "https://lawyer-website-yske.onrender.com/blog",
    "https://lawyer-website-yske.onrender.com/api/blogs"
  ],
  whatsappNumber: "919454098550"
};

const STORAGE_KEYS = {
  disclaimer: "ashwaniDisclaimerAccepted",
  localBlogs: "ashwaniLocalBlogs",
  newsletter: "ashwaniNewsletterSubscribers",
  adminProfile: "ashwaniAdminProfile",
  adminSession: "ashwaniAdminSession",
  consultations: "ashwaniConsultationRequests"
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

const FALLBACK_NEWS = [
  {
    id: "fallback-news-1",
    title: "Early record review reduces avoidable delays in civil litigation.",
    excerpt: "Property papers, notices, prior communications, and timeline notes often shape the first strategic move in a civil matter.",
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=900&q=80",
    category: "Civil",
    source: "Editorial Briefing",
    date: "2026-05-02T09:00:00.000Z",
    insight: "AI takeaway: documentation quality often determines how quickly a civil strategy can be framed."
  },
  {
    id: "fallback-news-2",
    title: "Commercial disputes become easier to assess when email trails are mapped early.",
    excerpt: "Agreements, payment trails, board approvals, and escalation messages help identify both risk and negotiation leverage.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    category: "Corporate",
    source: "Editorial Briefing",
    date: "2026-05-01T11:15:00.000Z",
    insight: "AI takeaway: corporate matters move faster when commercial records are organized before notices are exchanged."
  },
  {
    id: "fallback-news-3",
    title: "Criminal defence preparation improves with immediate preservation of key facts and papers.",
    excerpt: "Complaint copies, FIR details, witness references, and event chronology help build a practical response with less confusion.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80",
    category: "Criminal",
    source: "Editorial Briefing",
    date: "2026-04-30T13:30:00.000Z",
    insight: "AI takeaway: strong defence planning begins with speed, clarity, and factual preservation."
  }
];

const FALLBACK_BLOGS = [
  {
    id: "fallback-blog-1",
    title: "How to prepare for your first legal consultation.",
    excerpt: "Carry a clear timeline, identity records, notice copies, and a short summary of what outcome you are seeking from the consultation.",
    image: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?auto=format&fit=crop&w=900&q=80",
    category: "Practice Note",
    author: "Ashwani Tripathi & Associates",
    date: "2026-05-01T08:30:00.000Z",
    readingTime: "3 min read"
  },
  {
    id: "fallback-blog-2",
    title: "Documentation checklist for civil and corporate matters.",
    excerpt: "Agreements, email exchanges, payment proofs, ownership records, and prior correspondence can all influence legal strategy and timing.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
    category: "Civil Law",
    author: "Ashwani Tripathi & Associates",
    date: "2026-04-28T10:00:00.000Z",
    readingTime: "4 min read"
  },
  {
    id: "fallback-blog-3",
    title: "Why prompt legal advice matters in criminal proceedings.",
    excerpt: "Fast legal guidance helps preserve facts, assess procedure, and reduce avoidable mistakes in communication or documentation.",
    image: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&w=900&q=80",
    category: "Criminal Law",
    author: "Ashwani Tripathi & Associates",
    date: "2026-04-25T12:00:00.000Z",
    readingTime: "3 min read"
  }
];

const state = {
  news: [],
  blogs: [],
  newsMode: "fallback",
  blogMode: "fallback"
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  initDisclaimer();
  initReveal();
  bindNav();
  bindForms();
  restoreSession();
  renderAdminState();
  renderConsultationRequests();
  loadNews();
  loadBlog();
  window.setInterval(() => loadNews(true), 15 * 60 * 1000);
}

function bindNav() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-links a, .nav-actions a");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu && navMenu.classList.contains("is-open")) {
        navMenu.classList.remove("is-open");
      }
      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

function bindForms() {
  const refreshNewsBtn = document.getElementById("refreshNewsBtn");
  const refreshBlogBtn = document.getElementById("refreshBlogBtn");
  const newsletterForm = document.getElementById("newsletterForm");
  const consultationForm = document.getElementById("consultationForm");
  const adminSetupForm = document.getElementById("adminSetupForm");
  const adminLoginForm = document.getElementById("adminLoginForm");

  refreshNewsBtn?.addEventListener("click", () => loadNews());
  refreshBlogBtn?.addEventListener("click", () => loadBlog());
  newsletterForm?.addEventListener("submit", handleNewsletterSubmit);
  consultationForm?.addEventListener("submit", handleConsultationSubmit);
  adminSetupForm?.addEventListener("submit", setupAdminAccess);
  adminLoginForm?.addEventListener("submit", loginAdmin);
}

function initReveal() {
  const elements = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((element) => observer.observe(element));
}

function initDisclaimer() {
  const accepted = readText(STORAGE_KEYS.disclaimer);
  const modal = document.getElementById("disclaimerModal");

  if (!modal) {
    return;
  }

  if (accepted === "accepted") {
    modal.classList.add("is-hidden");
    document.body.classList.remove("modal-open");
    return;
  }

  modal.classList.remove("is-hidden");
  document.body.classList.add("modal-open");
}

function acceptDisclaimer() {
  writeText(STORAGE_KEYS.disclaimer, "accepted");
  document.getElementById("disclaimerModal")?.classList.add("is-hidden");
  document.body.classList.remove("modal-open");
}

function showLoader(loaderId, show) {
  const loader = document.getElementById(loaderId);
  if (!loader) {
    return;
  }

  loader.classList.toggle("is-hidden", !show);
}

function setStatus(elementId, text, mode = "default") {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("is-live", "is-fallback");

  if (mode === "live") {
    element.classList.add("is-live");
  } else if (mode === "fallback") {
    element.classList.add("is-fallback");
  }
}

function readText(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeText(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function limitText(value, limit = 150) {
  const text = String(value ?? "").trim();
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).trimEnd()}...`;
}

function toId(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortByNewest(left, right) {
  return new Date(right.date).getTime() - new Date(left.date).getTime();
}

function parseMaybeJson(raw) {
  if (!raw || !raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

async function fetchEndpoint(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {})
    }
  });

  const raw = await response.text();
  const parsed = parseMaybeJson(raw);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) at ${url}`);
  }

  if (parsed !== null) {
    return parsed;
  }

  if (!raw.trim()) {
    return { success: true };
  }

  return { success: true, raw };
}

async function fetchFromCandidates(urls, options = {}) {
  let lastError = new Error("No endpoint responded successfully.");

  for (const url of urls) {
    try {
      const data = await fetchEndpoint(url, options);
      return { data, url };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && typeof payload.data === "object") {
    return extractArray(payload.data, keys);
  }

  return [];
}

function mergeUnique(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = item.id || `${item.title}-${item.date}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function detectCategory(title = "", body = "") {
  const text = `${title} ${body}`.toLowerCase();

  if (text.includes("criminal") || text.includes("bail") || text.includes("fir")) {
    return "Criminal";
  }
  if (text.includes("corporate") || text.includes("company") || text.includes("commercial")) {
    return "Corporate";
  }
  return "Civil";
}

function buildInsight(title = "", body = "") {
  const category = detectCategory(title, body);

  if (category === "Criminal") {
    return "AI takeaway: quick factual preservation and procedural clarity matter early.";
  }
  if (category === "Corporate") {
    return "AI takeaway: records, approvals, and notices shape commercial leverage.";
  }
  return "AI takeaway: documentation depth often improves legal strategy from day one.";
}

function normalizeNewsItem(item, index = 0) {
  const fallback = FALLBACK_NEWS[index % FALLBACK_NEWS.length];
  const title = item.title || item.headline || item.name || fallback.title;
  const excerpt = limitText(
    item.content || item.description || item.summary || item.body || fallback.excerpt,
    170
  );

  return {
    id: item.id || item._id || item.slug || `${toId(title)}-${index}`,
    title,
    excerpt,
    image: item.image || item.imageUrl || item.thumbnail || item.urlToImage || fallback.image,
    category: item.category || detectCategory(title, excerpt),
    source:
      (typeof item.source === "object" ? item.source?.name : item.source) ||
      fallback.source,
    date: item.date || item.publishedAt || item.createdAt || fallback.date,
    insight: item.insight || buildInsight(title, excerpt)
  };
}

function normalizeBlogItem(item, index = 0) {
  const fallback = FALLBACK_BLOGS[index % FALLBACK_BLOGS.length];
  const title = item.title || item.headline || fallback.title;
  const content = item.content || item.description || item.summary || item.body || fallback.excerpt;
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(2, Math.ceil(words / 120))} min read`;

  return {
    id: item.id || item._id || item.slug || `${toId(title)}-${index}`,
    title,
    excerpt: limitText(content, 190),
    image: item.image || item.imageUrl || item.thumbnail || fallback.image,
    category: item.category || fallback.category,
    author: item.author || "Ashwani Tripathi & Associates",
    date: item.date || item.publishedAt || item.createdAt || fallback.date,
    readingTime: item.readingTime || readingTime
  };
}

function renderNews(items) {
  const grid = document.getElementById("newsGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="news-card glass-card">
          <div class="news-card__image">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
          </div>
          <div class="news-card__content">
            <span class="card-badge">${escapeHtml(item.category)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt)}</p>
            <p>${escapeHtml(item.insight)}</p>
            <div class="news-card__meta">
              <span>${escapeHtml(item.source)}</span>
              <span>${escapeHtml(formatDate(item.date))}</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderBlog(items) {
  const grid = document.getElementById("blogGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="blog-card glass-card">
          <span class="card-badge">${escapeHtml(item.category)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
          <div class="blog-card__meta">
            <span>${escapeHtml(item.author)}</span>
            <span>${escapeHtml(item.readingTime)}</span>
            <span>${escapeHtml(formatDate(item.date))}</span>
          </div>
        </article>
      `
    )
    .join("");
}

async function loadNews(silent = false) {
  if (!silent) {
    showLoader("newsLoader", true);
  }

  setStatus("newsStatus", "Loading live legal intelligence...", "default");

  try {
    const { data } = await fetchFromCandidates(CONFIG.newsEndpoints);
    const items = extractArray(data, ["news", "articles", "items", "updates", "results"]);

    if (!items.length) {
      throw new Error("News response was empty.");
    }

    const normalized = items.map((item, index) => normalizeNewsItem(item, index));
    const merged = mergeUnique([...normalized, ...FALLBACK_NEWS]).slice(0, 6);

    state.news = merged;
    state.newsMode = "live";

    renderNews(merged);
    setStatus("newsStatus", `Live feed ready - ${formatDate(new Date())}`, "live");
  } catch (error) {
    state.news = [...FALLBACK_NEWS];
    state.newsMode = "fallback";

    renderNews(state.news);
    setStatus("newsStatus", "Fallback legal briefings active", "fallback");
  } finally {
    showLoader("newsLoader", false);
    renderDashboardStats();
  }
}

async function loadBlog() {
  showLoader("blogLoader", true);
  setStatus("blogStatus", "Loading blog desk...", "default");

  const localBlogs = readJson(STORAGE_KEYS.localBlogs, []).map((item, index) =>
    normalizeBlogItem(item, index)
  );

  let remoteBlogs = [];

  try {
    const { data } = await fetchFromCandidates(CONFIG.blogEndpoints);
    const items = extractArray(data, ["blogs", "posts", "articles", "items", "results"]);

    if (!items.length) {
      throw new Error("Blog response was empty.");
    }

    remoteBlogs = items.map((item, index) => normalizeBlogItem(item, index));
    state.blogMode = "live";
  } catch (error) {
    state.blogMode = localBlogs.length ? "hybrid" : "fallback";
  }

  const combined = mergeUnique([...localBlogs, ...remoteBlogs, ...FALLBACK_BLOGS])
    .sort(sortByNewest)
    .slice(0, 6);

  state.blogs = combined;
  renderBlog(combined);

  if (remoteBlogs.length) {
    const blogText = localBlogs.length
      ? "Live blog + local publishing cache ready"
      : "Live blog desk ready";
    setStatus("blogStatus", blogText, "live");
  } else if (localBlogs.length) {
    setStatus("blogStatus", "Local publishing cache active", "fallback");
  } else {
    setStatus("blogStatus", "Fallback articles active", "fallback");
  }

  showLoader("blogLoader", false);
  renderDashboardStats();
}

async function postBlog(payload) {
  return fetchFromCandidates(CONFIG.blogPostEndpoints, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

function saveBlogLocally(blog) {
  const localBlogs = readJson(STORAGE_KEYS.localBlogs, []);
  const updatedBlogs = mergeUnique([blog, ...localBlogs]).slice(0, 20);
  writeJson(STORAGE_KEYS.localBlogs, updatedBlogs);
}

function getAdminProfile() {
  return readJson(STORAGE_KEYS.adminProfile, null);
}

function getAdminSession() {
  return readJson(STORAGE_KEYS.adminSession, null);
}

function restoreSession() {
  const session = getAdminSession();

  if (!session?.createdAt) {
    return;
  }

  const isExpired = Date.now() - new Date(session.createdAt).getTime() > SESSION_TTL_MS;
  if (isExpired) {
    try {
      localStorage.removeItem(STORAGE_KEYS.adminSession);
    } catch (error) {
      return;
    }
  }
}

function isAdminAuthenticated() {
  const profile = getAdminProfile();
  const session = getAdminSession();

  if (!profile || !session?.createdAt || session.email !== profile.email) {
    return false;
  }

  const isExpired = Date.now() - new Date(session.createdAt).getTime() > SESSION_TTL_MS;
  return !isExpired;
}

async function hashText(value) {
  const content = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", content);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function renderAdminState() {
  const profile = getAdminProfile();
  const setupBlock = document.getElementById("adminSetupBlock");
  const loginBlock = document.getElementById("adminLoginBlock");
  const dashboard = document.getElementById("adminDashboard");
  const authStatus = document.getElementById("adminAuthStatus");

  if (!profile) {
    setupBlock?.classList.remove("is-hidden");
    loginBlock?.classList.add("is-hidden");
    dashboard?.classList.add("is-hidden");
    if (authStatus) {
      authStatus.textContent = "Create local admin credentials to unlock publishing tools.";
    }
    return;
  }

  setupBlock?.classList.add("is-hidden");

  if (isAdminAuthenticated()) {
    loginBlock?.classList.add("is-hidden");
    dashboard?.classList.remove("is-hidden");
    dashboard?.classList.add("is-visible");
    if (authStatus) {
      authStatus.textContent = `Logged in as ${profile.email}`;
    }
  } else {
    loginBlock?.classList.remove("is-hidden");
    dashboard?.classList.add("is-hidden");
    if (authStatus) {
      authStatus.textContent = "Login required for blog publishing and request review.";
    }
  }

  renderDashboardStats();
  renderConsultationRequests();
}

function renderDashboardStats() {
  const stats = document.getElementById("dashboardStats");
  if (!stats) {
    return;
  }

  const consultations = readJson(STORAGE_KEYS.consultations, []);
  const cards = [
    {
      value: state.blogs.length || FALLBACK_BLOGS.length,
      label: "Visible Blog Items"
    },
    {
      value: consultations.length,
      label: "Consultancy Requests"
    },
    {
      value: state.newsMode === "live" ? "Live" : "Fallback",
      label: "News Source Mode"
    }
  ];

  stats.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <strong>${escapeHtml(card.value)}</strong>
          <span>${escapeHtml(card.label)}</span>
        </article>
      `
    )
    .join("");
}

async function setupAdminAccess(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("setupEmail") || "").trim().toLowerCase();
  const password = String(formData.get("setupPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 8) {
    setStatus("adminAuthStatus", "Password must be at least 8 characters long.", "fallback");
    return;
  }

  if (password !== confirmPassword) {
    setStatus("adminAuthStatus", "Passwords do not match.", "fallback");
    return;
  }

  try {
    const passwordHash = await hashText(password);

    writeJson(STORAGE_KEYS.adminProfile, {
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    });

    writeJson(STORAGE_KEYS.adminSession, {
      email,
      createdAt: new Date().toISOString()
    });

    form.reset();
    renderAdminState();
    setStatus("adminAuthStatus", "Admin access created successfully.", "live");
  } catch (error) {
    setStatus("adminAuthStatus", "This browser could not complete secure local setup.", "fallback");
  }
}

async function loginAdmin(event) {
  event.preventDefault();

  const profile = getAdminProfile();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("loginEmail") || "").trim().toLowerCase();
  const password = String(formData.get("loginPassword") || "");

  if (!profile) {
    setStatus("adminAuthStatus", "Please create admin access first.", "fallback");
    return;
  }

  try {
    const passwordHash = await hashText(password);

    if (email !== profile.email || passwordHash !== profile.passwordHash) {
      setStatus("adminAuthStatus", "Invalid email or password.", "fallback");
      return;
    }

    writeJson(STORAGE_KEYS.adminSession, {
      email,
      createdAt: new Date().toISOString()
    });

    form.reset();
    renderAdminState();
    setStatus("adminAuthStatus", "Admin login successful.", "live");
  } catch (error) {
    setStatus("adminAuthStatus", "Secure local login is unavailable in this browser.", "fallback");
  }
}

function logoutAdmin() {
  try {
    localStorage.removeItem(STORAGE_KEYS.adminSession);
  } catch (error) {
    return;
  }
  renderAdminState();
  setStatus("adminAuthStatus", "You have been logged out.", "fallback");
}

async function addBlog(event) {
  event.preventDefault();

  if (!isAdminAuthenticated()) {
    setStatus("blogFormStatus", "Please login to publish blog updates.", "fallback");
    renderAdminState();
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    id: `local-blog-${Date.now()}`,
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "Practice Note"),
    image: String(formData.get("image") || "").trim(),
    content: String(formData.get("content") || "").trim(),
    author: "Ashwani Tripathi & Associates",
    createdAt: new Date().toISOString()
  };

  if (!payload.title || !payload.content) {
    setStatus("blogFormStatus", "Blog title and content are required.", "fallback");
    return;
  }

  let remoteSuccess = false;

  try {
    await postBlog(payload);
    remoteSuccess = true;
  } catch (error) {
    remoteSuccess = false;
  }

  saveBlogLocally(payload);
  form.reset();

  if (remoteSuccess) {
    setStatus("blogFormStatus", "Blog published and feed refreshed.", "live");
  } else {
    setStatus("blogFormStatus", "API unavailable. Blog saved locally and feed refreshed.", "fallback");
  }

  await loadBlog();
}

function renderConsultationRequests() {
  const target = document.getElementById("consultationLeadList");
  if (!target) {
    return;
  }

  const requests = readJson(STORAGE_KEYS.consultations, []).sort(sortByNewest).slice(0, 6);

  if (!requests.length) {
    target.innerHTML = `<div class="lead-empty">No consultation requests captured on this device yet.</div>`;
    renderDashboardStats();
    return;
  }

  target.innerHTML = requests
    .map(
      (request) => `
        <article class="lead-item">
          <strong>${escapeHtml(request.fullName)}</strong>
          <small>${escapeHtml(request.service)} - ${escapeHtml(request.mode)}</small>
          <p>${escapeHtml(limitText(request.message, 110))}</p>
          <small>${escapeHtml(request.phone)} - ${escapeHtml(formatDate(request.date))}</small>
        </article>
      `
    )
    .join("");

  renderDashboardStats();
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function handleConsultationSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const request = {
    id: `consult-${Date.now()}`,
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    mode: String(formData.get("mode") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    date: new Date().toISOString()
  };

  const requests = readJson(STORAGE_KEYS.consultations, []);
  writeJson(STORAGE_KEYS.consultations, [request, ...requests].slice(0, 30));

  form.reset();
  renderConsultationRequests();
  setStatus("consultationStatus", "Consultancy request saved. Opening WhatsApp for faster follow-up...", "live");

  const whatsappMessage =
    `Hello Ashwani Tripathi & Associates, I would like to request an online consultancy.\n` +
    `Name: ${request.fullName}\n` +
    `Email: ${request.email}\n` +
    `Phone: ${request.phone}\n` +
    `Service: ${request.service}\n` +
    `Preferred Mode: ${request.mode}\n` +
    `Case Summary: ${request.message}`;

  const popup = window.open(buildWhatsAppUrl(whatsappMessage), "_blank", "noopener");

  if (!popup) {
    setStatus(
      "consultationStatus",
      "Consultancy request saved. Please allow pop-ups or use the WhatsApp button to continue.",
      "fallback"
    );
  }
}

function handleNewsletterSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("newsletterEmail") || "").trim().toLowerCase();
  const currentList = readJson(STORAGE_KEYS.newsletter, []);

  if (currentList.includes(email)) {
    setStatus("newsletterStatus", "This email is already saved for UI demo purposes.", "fallback");
    return;
  }

  writeJson(STORAGE_KEYS.newsletter, [email, ...currentList].slice(0, 50));
  form.reset();
  setStatus("newsletterStatus", "Subscribed successfully. This deployment stores the email locally only.", "live");
}

window.acceptDisclaimer = acceptDisclaimer;
window.loadNews = loadNews;
window.loadBlog = loadBlog;
window.addBlog = addBlog;
window.logoutAdmin = logoutAdmin;
