import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    const token = authHeader.split(" ")[1];

    // Empty token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
        code: "TOKEN_MISSING",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    const account = await User.findById(decoded.userId).select("role");
    if (!account) return res.status(401).json({ success: false, message: "Account not found.", code: "ACCOUNT_NOT_FOUND" });

    // Resolve the current database role; role values are never trusted from the browser.
    req.user = {
      id: decoded.userId,
      role: account.role || "owner",
    };

    next();
  } catch (error) {
    // Expired token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    // Invalid / malformed token
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
        code: "TOKEN_INVALID",
      });
    }

    console.error(
      "Authentication error:",
      error,
    );

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTH_FAILED",
    });
  }
};

export const requireRole = (role) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select("role doctorProfile.isApproved");
    if (!user || user.role !== role || (role === "doctor" && !user.doctorProfile?.isApproved)) {
      return res.status(403).json({ success: false, message: "This account is not authorized to access this area." });
    }
    req.user.role = user.role;
    next();
  } catch {
    return res.status(500).json({ success: false, message: "Unable to verify account access." });
  }
};
