const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined.");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Expected: { id, role }
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
