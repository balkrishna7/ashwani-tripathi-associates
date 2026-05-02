const express = require("express");

const requireAdminAuth = require("../middleware/auth");
const Consultation = require("../models/Consultation");

const router = express.Router();

router.get("/", requireAdminAuth, async (req, res, next) => {
  try {
    const consultations = await Consultation.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      consultations
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const service = String(req.body.service || "").trim();
    const mode = String(req.body.mode || "").trim();
    const message = String(req.body.message || "").trim();

    if (!fullName || !email || !phone || !service || !mode || !message) {
      return res.status(400).json({
        success: false,
        message: "All consultation fields are required."
      });
    }

    const consultation = await Consultation.create({
      fullName,
      email,
      phone,
      service,
      mode,
      message
    });

    res.status(201).json({
      success: true,
      message: "Consultation request submitted successfully.",
      consultation
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
