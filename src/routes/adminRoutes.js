const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const requireAdminAuth = require("../middleware/auth");
const Admin = require("../models/Admin");
const Blog = require("../models/Blog");
const Consultation = require("../models/Consultation");
const Newsletter = require("../models/Newsletter");

const router = express.Router();

function signToken(admin) {
  return jwt.sign(
    { id: admin._id.toString(), email: admin.email },
    process.env.JWT_SECRET || "development-secret-change-me",
    { expiresIn: "8h" }
  );
}

router.get("/status", async (req, res, next) => {
  try {
    const hasAdmin = (await Admin.countDocuments()) > 0;

    res.json({
      success: true,
      hasAdmin
    });
  } catch (error) {
    next(error);
  }
});

router.post("/setup", async (req, res, next) => {
  try {
    const existingAdmin = await Admin.countDocuments();

    if (existingAdmin > 0) {
      return res.status(409).json({
        success: false,
        message: "Admin account has already been created."
      });
    }

    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Valid email and password of at least 8 characters are required."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ email, passwordHash });
    const token = signToken(admin);

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully.",
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = signToken(admin);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAdminAuth, async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

router.get("/dashboard", requireAdminAuth, async (req, res, next) => {
  try {
    const [blogCount, consultationCount, newsletterCount, recentConsultations] =
      await Promise.all([
        Blog.countDocuments(),
        Consultation.countDocuments(),
        Newsletter.countDocuments(),
        Consultation.find().sort({ createdAt: -1 }).limit(6).lean()
      ]);

    res.json({
      success: true,
      stats: {
        blogCount,
        consultationCount,
        newsletterCount
      },
      recentConsultations
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
