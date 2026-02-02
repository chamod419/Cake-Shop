import jwt from "jsonwebtoken";

export function authOptional(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, username: payload.username };
  } catch {
    // ignore invalid token
  }

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Forbidden" });
  next();
}
