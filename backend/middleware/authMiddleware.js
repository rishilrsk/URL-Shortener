import jwt from "jsonwebtoken";

const readToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
};

// Requires a valid token.
export const protect = (req, res, next) => {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided. Please log in." });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
};

// Attaches req.user when a valid token is sent, but lets guests through.
export const optionalAuth = (req, res, next) => {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Your session has expired. Please log in again." });
    }
  }
  next();
};
