require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDatabase = require("./src/config/database");
const adminRoutes = require("./src/routes/adminRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const consultationRoutes = require("./src/routes/consultationRoutes");
const newsletterRoutes = require("./src/routes/newsletterRoutes");
const newsRoutes = require("./src/routes/newsRoutes");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 5000);

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length
      ? {
          origin: allowedOrigins,
          credentials: true
        }
      : {}
  )
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ashwani Tripathi & Associates API is healthy."
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/news", newsRoutes);

app.use("/images", express.static(path.join(ROOT_DIR, "images")));

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "style.css"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "script.js"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "API route not found."
    });
  }

  return res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
