import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/products?q=...&category=...
router.get("/", async (req, res) => {
  try {
    const { q, category } = req.query;

    const where = {};

    if (category) {
      where.category = { equals: String(category), mode: "insensitive" };
    }

    if (q) {
      const query = String(q);
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (e) {
    res.status(500).json({ message: "Failed to load products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

export default router;
