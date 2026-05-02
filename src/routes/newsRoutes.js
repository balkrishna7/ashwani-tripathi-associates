const express = require("express");

const { getLegalNews } = require("../services/newsService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const payload = await getLegalNews({
      force: req.query.refresh === "1"
    });

    res.json({
      success: true,
      mode: payload.mode,
      fetchedAt: payload.fetchedAt,
      news: payload.items
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
