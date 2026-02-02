import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

const COOKIE_NAME = "token";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: false,     // true only in https production
    path: "/",         // ✅ IMPORTANT
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) return res.status(409).json({ message: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, passwordHash, role: "CUSTOMER" },
      select: { id: true, username: true, role: true },
    });

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!username || !password) return res.status(400).json({ message: "Username and password required" });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const safeUser = { id: user.id, username: user.username, role: user.role };
    const token = signToken(safeUser);

    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ user: safeUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error logging in" });
  }
});

router.post("/logout", (req, res) => {
  // ✅ Clear with SAME options (path matters)
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.json({ user: null });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, role: true },
    });

    res.json({ user: user || null });
  } catch {
    res.json({ user: null });
  }
});

export default router;
