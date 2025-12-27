const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Extract authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        message: "No authorization token provided" 
      });
    }

    // Validate Bearer scheme
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ 
        message: "Invalid authorization format. Expected: Bearer <token>" 
      });
    }

    const token = parts[1];
    if (!token || token.trim() === "") {
      return res.status(401).json({ 
        message: "Token is empty" 
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate decoded token structure for regular users
    if (decoded.role !== "guest") {
      if (!decoded.id) {
        console.error("Token missing required 'id' field:", decoded);
        return res.status(401).json({ message: "Invalid token structure" });
      }
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token has expired",
        expiredAt: err.expiredAt 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      console.warn("Invalid JWT attempt:", err.message);
      return res.status(401).json({ 
        message: "Invalid token" 
      });
    }
    
    if (err.name === "NotBeforeError") {
      return res.status(401).json({ 
        message: "Token not yet valid" 
      });
    }

    // Log unexpected errors
    console.error("Authentication middleware error:", err);
    return res.status(500).json({ 
      message: "Authentication failed" 
    });
  }
};
