const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required."
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-secret-change-me"
    );

    const admin = await Admin.findById(payload.id).select("-passwordHash");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found."
      });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token."
    });
  }
}

module.exports = requireAdminAuth;
