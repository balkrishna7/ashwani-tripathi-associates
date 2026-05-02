const express = require("express");

const requireAdminAuth = require("../middleware/auth");
const Blog = require("../models/Blog");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(20).lean();

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdminAuth, async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "Practice Note").trim();
    const image = String(req.body.image || "").trim();
    const content = String(req.body.content || "").trim();
    const author = String(
      req.body.author || "Ashwani Tripathi & Associates"
    ).trim();

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Blog title and content are required."
      });
    }

    const blog = await Blog.create({
      title,
      category,
      image,
      content,
      author
    });

    res.status(201).json({
      success: true,
      message: "Blog published successfully.",
      blog
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
