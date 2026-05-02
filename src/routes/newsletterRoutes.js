const express = require("express");

const Newsletter = require("../models/Newsletter");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required."
      });
    }

    const existingSubscription = await Newsletter.findOne({ email });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed."
      });
    }

    await Newsletter.create({ email });

    res.status(201).json({
      success: true,
      message: "Newsletter subscription saved successfully."
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
