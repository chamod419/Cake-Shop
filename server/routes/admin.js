import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// GET /api/admin/orders?status=Pending
router.get("/", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status;

    const where = status ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    // Return in same shape your AdminOrders page expects
    const shaped = orders.map((o) => ({
      id: o.id,
      status: o.status,
      customer: { name: o.name, phone: o.phone, email: o.email },
      fulfillment: { type: o.type, date: o.date, time: o.time, address: o.address },
      items: o.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        size: i.size,
        flavor: i.flavor,
        image: i.image,
        lineTotal: i.price * i.qty,
      })),
      totals: { total: o.total },
      createdAt: o.createdAt,
    }));

    res.json(shaped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = ["Pending", "Baking", "Ready", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    const shaped = {
      id: updated.id,
      status: updated.status,
      customer: { name: updated.name, phone: updated.phone, email: updated.email },
      fulfillment: {
        type: updated.type,
        date: updated.date,
        time: updated.time,
        address: updated.address,
      },
      items: updated.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        size: i.size,
        flavor: i.flavor,
        image: i.image,
        lineTotal: i.price * i.qty,
      })),
      totals: { total: updated.total },
      createdAt: updated.createdAt,
    };

    res.json(shaped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error updating status" });
  }
});

export default router;
