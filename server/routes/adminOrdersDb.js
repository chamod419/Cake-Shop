import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Adminlist all orders
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { id: true, username: true, role: true } },
      },
    });
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error fetching admin orders" });
  }
});

// Admin update order status
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const status = String(req.body?.status || "").trim();
    const allowed = ["Pending", "Accepted", "Baking", "Ready", "Delivered", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true, user: { select: { id: true, username: true } } },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error updating order" });
  }
});

export default router;
