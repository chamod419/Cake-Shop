import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import fsp from "fs/promises";
import { fileURLToPath } from "url";

import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute uploads folder path
const uploadsDir = path.join(__dirname, "..", "uploads");

// Make sure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG/PNG/WEBP allowed"));
    }
    cb(null, true);
  },
});

// LIST
router.get("/", requireAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error fetching products" });
  }
});

// CREATE
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const category = String(req.body?.category || "").trim();
    const description = String(req.body?.description || "").trim();
    const price = Number(req.body?.price);
    const rating = req.body?.rating ? Number(req.body.rating) : 4.5;

    const sizes = req.body?.sizes
      ? String(req.body.sizes)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : ["0.5kg", "1kg", "2kg"];

    const flavors = req.body?.flavors
      ? String(req.body.flavors)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : ["Chocolate"];

    const isAvailable = String(req.body?.isAvailable || "true") === "true";

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!category) return res.status(400).json({ message: "Category is required" });
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const image = `/uploads/${req.file.filename}`;

    const created = await prisma.product.create({
      data: {
        name,
        category,
        description,
        price,
        rating,
        image,
        sizes,
        flavors,
        isAvailable,
      },
    });

    res.json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error creating product" });
  }
});

// UPDATE
router.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const data = {};

    if (req.body?.name !== undefined) data.name = String(req.body.name).trim();
    if (req.body?.category !== undefined) data.category = String(req.body.category).trim();
    if (req.body?.description !== undefined) data.description = String(req.body.description).trim();

    if (req.body?.price !== undefined) {
      const price = Number(req.body.price);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      data.price = price;
    }

    if (req.body?.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!Number.isFinite(rating)) {
        return res.status(400).json({ message: "Invalid rating" });
      }
      data.rating = rating;
    }

    if (req.body?.isAvailable !== undefined) {
      data.isAvailable = String(req.body.isAvailable) === "true";
    }

    if (req.body?.sizes !== undefined) {
      data.sizes = String(req.body.sizes)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (req.body?.flavors !== undefined) {
      data.flavors = String(req.body.flavors)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;

      if (existing.image?.startsWith("/uploads/")) {
        const oldName = existing.image.replace("/uploads/", "");
        const oldPath = path.join(uploadsDir, oldName);
        await fsp.unlink(oldPath).catch(() => {});
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error updating product" });
  }
});

// DELETE
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({
      where: { id },
    });

    if (existing.image?.startsWith("/uploads/")) {
      const oldName = existing.image.replace("/uploads/", "");
      const oldPath = path.join(uploadsDir, oldName);
      await fsp.unlink(oldPath).catch(() => {});
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error deleting product" });
  }
});

export default router;