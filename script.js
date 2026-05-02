const CONFIG = {
  apiBase: window.API_BASE_URL || "",
  whatsappNumber: "919454098550"
};

const STORAGE_KEYS = {
  disclaimer: "ashwaniDisclaimerAccepted",
  adminToken: "ashwaniAdminToken"
};

const FALLBACK_NEWS = [
  {
    id: "fallback-news-1",
    title: "Early record review reduces avoidable delays in civil litigation.",
    excerpt:
      "Property papers, notices, prior communications, and timeline notes often shape the first strategic move in a civil matter.",
    image:
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=900&q=80",
    category: "Civil",
    source: "Editorial Briefing",
    date: "2026-05-02T09:00:00.000Z",
    link: "",
    insight:
      "AI takeaway: documentation quality often determines how quickly a civil strategy can be framed."
  },
  {
    id: "fallback-news-2",
    title: "Commercial disputes become easier to assess when email trails are mapped early.",
    excerpt:
      "Agreements, payment trails, board approvals, and escalation messages help identify both risk and negotiation leverage.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    category: "Corporate",
    source: "Editorial Briefing",
    date: "2026-05-01T11:15:00.000Z",
    link: "",
    insight:
      "AI takeaway: corporate matters move faster when commercial records are organized before notices are exchanged."
  },
  {
    id: "fallback-news-3",
    title: "Criminal defence preparation improves with immediate preservation of key facts and papers.",
    excerpt:
      "Complaint copies, FIR details, witness references, and event chronology help build a practical response with less confusion.",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80",
    category: "Criminal",
    source: "Editorial Briefing",
    date: "2026-04-30T13:30:00.000Z",
    link: "",
    insight:
      "AI takeaway: strong defence planning begins with speed, clarity, and factual preservation."
  }
];

const FALLBACK_BLOGS = [
  {
    id: "fallback-blog-1",
    title: "How to prepare for your first legal consultation.",
    excerpt:
      "Carry a clear timeline, identity records, notice copies, and a short summary of what outcome you are seeking from the consultation.",
    image:
      "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?auto=format&fit=crop&w=900&q=80",
    category: "Practice Note",
    author: "Ashwani Tripathi & Associates",
    date: "2026-05-01T08:30:00.000Z",
    readingTime: "3 min read"
  },
  {
    id: "fallback-blog-2",
    title: "Documentation checklist for civil and corporate matters.",
    excerpt:
      "Agreements, email exchanges, payment proofs, ownership records, and prior correspondence can all influence legal strategy and timing.",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
    category: "Civil Law",
    author: "Ashwani Tripathi & Associates",
    date: "2026-04-28T10:00:00.000Z",
    readingTime: "4 min read"
  },
  {
    id: "fallback-blog-3",
    title: "Why prompt legal advice matters in criminal proceedings.",
    excerpt:
      "Fast legal guidance helps preserve facts, assess procedure, and reduce avoidable mistakes in communication or documentation.",
    image:
      "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&w=900&q=80",
    category: "Criminal Law",
    author: "Ashwani Tripathi & Associates",
    date: "2026-04-25T12:00:00.000Z",
    readingTime: "3 min read"
  }
];

const state = {
  news: [],
  blogs: [],
  hasAdmin: false,
  admin: null,
  stats: null,
  consultations: []
};

document.addEventListener("DOMContentLoaded", () => {
  void init();
});

async function init() {
  initDisclaimer();
  initReveal();
  initMediaFallbacks();
  bindNav();
  bindForms();
  renderDashboardStats();
  renderConsultationRequests();
  await syncAdminState();
  await Promise.allSettled([loadNews(), loadBlog()]);
}

function initMediaFallbacks() {
  const mediaNodes = document.querySelectorAll(
    ".brand-mark img, .hero__portrait img, .hero__seal img"
  );

  mediaNodes.forEach((image) => {
    const container = image.parentElement;

    const applyFallback = () => {
      if (!container) {
        return;
      }

      container.classList.add("is-fallback");
      image.remove();
    };

    if (image.complete) {
      if (!image.naturalWidth) {
        applyFallback();
      }
      return;
    }

    image.addEventListener("error", applyFallback, { once: true });
  });
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

  refreshNewsBtn?.addEventListener("click", () => loadNews(true));
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

function buildApiUrl(path) {
  return CONFIG.apiBase ? `${CONFIG.apiBase}${path}` : path;
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

function removeText(key) {
  try {
    localStorage.removeItem(key);
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

function limitText(value, limit = 180) {
  const text = String(value ?? "").trim();
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trimEnd()}...`;
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
    const key = String(item.id || `${item.title}-${item.date}`).toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function sortByNewest(left, right) {
  return new Date(right.date).getTime() - new Date(left.date).getTime();
}

async function apiRequest(path, options = {}) {
  const token = readText(STORAGE_KEYS.adminToken);
  const headers = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(path), {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const raw = await response.text();
  let payload = {};

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      payload = { message: raw };
    }
  }

  if (!response.ok) {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

function normalizeNewsItem(item, index = 0) {
  const fallback = FALLBACK_NEWS[index % FALLBACK_NEWS.length];

  return {
    id: item.id || item._id || fallback.id,
    title: item.title || fallback.title,
    excerpt: limitText(item.excerpt || item.description || item.summary || fallback.excerpt),
    image: item.image || item.imageUrl || fallback.image,
    category: item.category || fallback.category,
    source: item.source || fallback.source,
    date: item.date || item.createdAt || fallback.date,
    link: item.link || "",
    insight: item.insight || fallback.insight
  };
}

function normalizeBlogItem(item, index = 0) {
  const fallback = FALLBACK_BLOGS[index % FALLBACK_BLOGS.length];
  const content = item.content || item.excerpt || item.description || fallback.excerpt;
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;

  return {
    id: item._id || item.id || fallback.id,
    title: item.title || fallback.title,
    excerpt: limitText(content, 200),
    image: item.image || fallback.image,
    category: item.category || fallback.category,
    author: item.author || "Ashwani Tripathi & Associates",
    date: item.createdAt || item.date || fallback.date,
    readingTime: `${Math.max(2, Math.ceil(words / 120))} min read`
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

async function loadNews(force = false) {
  showLoader("newsLoader", true);
  setStatus("newsStatus", "Loading live legal intelligence...", "default");

  try {
    const payload = await apiRequest(`/api/news${force ? "?refresh=1" : ""}`);
    const newsItems = extractArray(payload, ["news", "items", "articles"]);

    if (!newsItems.length) {
      throw new Error("News response was empty.");
    }

    const normalized = mergeUnique(
      newsItems.map((item, index) => normalizeNewsItem(item, index))
    )
      .sort(sortByNewest)
      .slice(0, 6);

    state.news = normalized.length ? normalized : [...FALLBACK_NEWS];
    renderNews(state.news);

    const isLive = payload.mode === "live";
    setStatus(
      "newsStatus",
      isLive
        ? `Live feed ready - ${formatDate(payload.fetchedAt || new Date())}`
        : "Fallback legal briefings active",
      isLive ? "live" : "fallback"
    );
  } catch (error) {
    state.news = [...FALLBACK_NEWS];
    renderNews(state.news);
    setStatus("newsStatus", "Fallback legal briefings active", "fallback");
  } finally {
    showLoader("newsLoader", false);
  }
}

async function loadBlog() {
  showLoader("blogLoader", true);
  setStatus("blogStatus", "Loading blog desk...", "default");

  try {
    const payload = await apiRequest("/api/blog");
    const blogs = extractArray(payload, ["blogs", "posts", "items"]);

    if (!blogs.length) {
      throw new Error("Blog response was empty.");
    }

    state.blogs = blogs.map((item, index) => normalizeBlogItem(item, index)).slice(0, 6);
    renderBlog(state.blogs);
    setStatus("blogStatus", "Live blog desk ready", "live");
  } catch (error) {
    state.blogs = [...FALLBACK_BLOGS];
    renderBlog(state.blogs);
    setStatus("blogStatus", "Fallback articles active", "fallback");
  } finally {
    showLoader("blogLoader", false);
    renderDashboardStats();
  }
}

async function syncAdminState() {
  try {
    const payload = await apiRequest("/api/admin/status");
    state.hasAdmin = Boolean(payload.hasAdmin);
  } catch (error) {
    state.hasAdmin = false;
  }

  const token = readText(STORAGE_KEYS.adminToken);

  if (!token) {
    state.admin = null;
    state.stats = null;
    state.consultations = [];
    renderAdminState();
    renderDashboardStats();
    renderConsultationRequests();
    return;
  }

  try {
    const payload = await apiRequest("/api/admin/me", { auth: true });
    state.admin = payload.admin || null;
    await refreshDashboard();
  } catch (error) {
    removeText(STORAGE_KEYS.adminToken);
    state.admin = null;
    state.stats = null;
    state.consultations = [];
  }

  renderAdminState();
  renderDashboardStats();
  renderConsultationRequests();
}

function renderAdminState() {
  const setupBlock = document.getElementById("adminSetupBlock");
  const loginBlock = document.getElementById("adminLoginBlock");
  const dashboard = document.getElementById("adminDashboard");
  const authStatus = document.getElementById("adminAuthStatus");

  if (!state.hasAdmin) {
    setupBlock?.classList.remove("is-hidden");
    loginBlock?.classList.add("is-hidden");
    dashboard?.classList.add("is-hidden");
    setStatus(
      "adminAuthStatus",
      "Create the initial admin account to unlock the publishing dashboard.",
      "fallback"
    );
    return;
  }

  setupBlock?.classList.add("is-hidden");

  if (state.admin) {
    loginBlock?.classList.add("is-hidden");
    dashboard?.classList.remove("is-hidden");
    dashboard?.classList.add("is-visible");

    if (authStatus) {
      authStatus.textContent = `Logged in as ${state.admin.email}`;
      authStatus.classList.remove("is-fallback");
      authStatus.classList.add("is-live");
    }
  } else {
    loginBlock?.classList.remove("is-hidden");
    dashboard?.classList.add("is-hidden");
    setStatus("adminAuthStatus", "Login required for blog publishing and enquiry review.", "fallback");
  }
}

async function refreshDashboard() {
  if (!state.admin) {
    return;
  }

  const payload = await apiRequest("/api/admin/dashboard", { auth: true });
  state.stats = payload.stats || null;
  state.consultations = Array.isArray(payload.recentConsultations)
    ? payload.recentConsultations
    : [];
}

function renderDashboardStats() {
  const statsTarget = document.getElementById("dashboardStats");

  if (!statsTarget) {
    return;
  }

  const cards = [
    {
      value: state.stats?.blogCount ?? state.blogs.length,
      label: "Published Blog Items"
    },
    {
      value: state.stats?.consultationCount ?? state.consultations.length,
      label: "Consultancy Requests"
    },
    {
      value: state.stats?.newsletterCount ?? 0,
      label: "Newsletter Subscribers"
    }
  ];

  statsTarget.innerHTML = cards
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

function renderConsultationRequests() {
  const target = document.getElementById("consultationLeadList");

  if (!target) {
    return;
  }

  if (!state.consultations.length) {
    target.innerHTML = `<div class="lead-empty">No consultation requests are available yet.</div>`;
    return;
  }

  target.innerHTML = state.consultations
    .map(
      (request) => `
        <article class="lead-item">
          <strong>${escapeHtml(request.fullName)}</strong>
          <small>${escapeHtml(request.service)} - ${escapeHtml(request.mode)}</small>
          <p>${escapeHtml(limitText(request.message, 120))}</p>
          <small>${escapeHtml(request.phone)} - ${escapeHtml(formatDate(request.createdAt || request.date))}</small>
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
    const payload = await apiRequest("/api/admin/setup", {
      method: "POST",
      body: { email, password }
    });

    writeText(STORAGE_KEYS.adminToken, payload.token);
    state.hasAdmin = true;
    state.admin = payload.admin || null;
    form.reset();
    await refreshDashboard();
    renderAdminState();
    renderDashboardStats();
    renderConsultationRequests();
    setStatus("adminAuthStatus", payload.message || "Admin access created successfully.", "live");
  } catch (error) {
    setStatus("adminAuthStatus", error.message, "fallback");
  }
}

async function loginAdmin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("loginEmail") || "").trim().toLowerCase();
  const password = String(formData.get("loginPassword") || "");

  try {
    const payload = await apiRequest("/api/admin/login", {
      method: "POST",
      body: { email, password }
    });

    writeText(STORAGE_KEYS.adminToken, payload.token);
    state.hasAdmin = true;
    state.admin = payload.admin || null;
    form.reset();
    await refreshDashboard();
    renderAdminState();
    renderDashboardStats();
    renderConsultationRequests();
    setStatus("adminAuthStatus", payload.message || "Admin login successful.", "live");
  } catch (error) {
    setStatus("adminAuthStatus", error.message, "fallback");
  }
}

function logoutAdmin() {
  removeText(STORAGE_KEYS.adminToken);
  state.admin = null;
  state.stats = null;
  state.consultations = [];
  renderAdminState();
  renderDashboardStats();
  renderConsultationRequests();
  setStatus("adminAuthStatus", "You have been logged out.", "fallback");
}

async function addBlog(event) {
  event.preventDefault();

  if (!state.admin) {
    setStatus("blogFormStatus", "Please login to publish blog updates.", "fallback");
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "Practice Note").trim(),
    image: String(formData.get("image") || "").trim(),
    content: String(formData.get("content") || "").trim(),
    author: "Ashwani Tripathi & Associates"
  };

  if (!payload.title || !payload.content) {
    setStatus("blogFormStatus", "Blog title and content are required.", "fallback");
    return;
  }

  try {
    await apiRequest("/api/blog", {
      method: "POST",
      body: payload,
      auth: true
    });

    form.reset();
    await loadBlog();
    await refreshDashboard();
    renderDashboardStats();
    renderConsultationRequests();
    setStatus("blogFormStatus", "Blog published successfully.", "live");
  } catch (error) {
    setStatus("blogFormStatus", error.message, "fallback");
  }
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

async function handleConsultationSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const request = {
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    mode: String(formData.get("mode") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };

  let savedToApi = false;

  try {
    await apiRequest("/api/consultations", {
      method: "POST",
      body: request
    });

    savedToApi = true;
  } catch (error) {
    savedToApi = false;
  }

  form.reset();

  if (state.admin) {
    try {
      await refreshDashboard();
      renderDashboardStats();
      renderConsultationRequests();
    } catch (error) {
      // Keep the public flow smooth even if dashboard refresh fails.
    }
  }

  setStatus(
    "consultationStatus",
    savedToApi
      ? "Consultancy request submitted. Opening WhatsApp for faster follow-up..."
      : "Request could not be saved right now. Opening WhatsApp so you can continue immediately...",
    savedToApi ? "live" : "fallback"
  );

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
      "Please allow pop-ups or use the WhatsApp button to continue your consultation request.",
      "fallback"
    );
  }
}

async function handleNewsletterSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("newsletterEmail") || "").trim().toLowerCase();

  try {
    const payload = await apiRequest("/api/newsletter", {
      method: "POST",
      body: { email }
    });

    form.reset();
    if (state.admin) {
      try {
        await refreshDashboard();
        renderDashboardStats();
      } catch (error) {
        // Ignore dashboard refresh issues in the public flow.
      }
    }
    setStatus("newsletterStatus", payload.message || "Subscribed successfully.", "live");
  } catch (error) {
    setStatus("newsletterStatus", error.message, "fallback");
  }
}

window.acceptDisclaimer = acceptDisclaimer;
window.loadNews = loadNews;
window.loadBlog = loadBlog;
window.addBlog = addBlog;
window.logoutAdmin = logoutAdmin;
