import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
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

    // Attach user information
    req.user = {
      id: decoded.userId,
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