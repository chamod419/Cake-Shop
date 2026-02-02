import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Convert size label like "0.5kg", "1kg", "2kg" to numeric kg
 * Default: 1kg
 */
function parseWeightKg(sizeLabel) {
  if (!sizeLabel) return 1;

  const m = String(sizeLabel).match(/([\d.]+)\s*kg/i);
  const kg = m ? Number(m[1]) : 1;

  return Number.isFinite(kg) && kg > 0 ? kg : 1;
}

/**
 * Calculate price based on weight.
 * product.price is assumed to be price for 1kg.
 */
function calcPriceByWeight(product, sizeLabel) {
  const base = Number(product?.price ?? 0); // 1kg price
  const kg = parseWeightKg(sizeLabel);
  const val = base * kg;

  // round to nearest rupee
  return Math.round(val);
}

// ✅ Create order (requires login)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { customer, fulfillment, items } = req.body || {};

    // ----- Validate customer -----
    if (!customer?.name?.trim()) return res.status(400).json({ message: "Customer name is required" });
    if (!customer?.phone?.trim()) return res.status(400).json({ message: "Customer phone is required" });

    // ----- Validate fulfillment -----
    const type = fulfillment?.type;
    if (type !== "pickup" && type !== "delivery") {
      return res.status(400).json({ message: "Fulfillment type must be pickup or delivery" });
    }
    if (!fulfillment?.date?.trim() || !fulfillment?.time?.trim()) {
      return res.status(400).json({ message: "Fulfillment date and time are required" });
    }
    if (type === "delivery" && !fulfillment?.address?.trim()) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    // ----- Validate items -----
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    const productIds = [...new Set(items.map((i) => i.productId).filter(Boolean))];
    if (productIds.length === 0) {
      return res.status(400).json({ message: "Invalid cart items" });
    }

    // fetch products
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // validate each item
    for (const i of items) {
      const p = productMap.get(i.productId);
      if (!p) return res.status(400).json({ message: "Invalid product in cart" });

      const qty = Number(i.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      // optional: validate size exists in product.sizes
      const selectedSize = i.size || null;
      if (selectedSize && Array.isArray(p.sizes) && p.sizes.length) {
        if (!p.sizes.includes(selectedSize)) {
          return res.status(400).json({ message: `Invalid size for product: ${p.name}` });
        }
      }
    }

    // build order items with computed price
    const orderItemsData = items.map((i) => {
      const p = productMap.get(i.productId);

      const selectedSize = i.size || null;
      const computedUnitPrice = calcPriceByWeight(p, selectedSize);

      return {
        productId: p.id,
        name: p.name,
        price: computedUnitPrice,       // ✅ price adjusted by weight
        qty: Number(i.qty),
        size: selectedSize,
        flavor: i.flavor || null,
        image: p.image || null,         // uses product image
      };
    });

    // compute total from computed prices
    const total = orderItemsData.reduce((sum, x) => sum + x.price * x.qty, 0);

    const created = await prisma.order.create({
      data: {
        user: { connect: { id: req.user.id } }, // ✅ required link to user

        status: "Pending",
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || null,
        note: customer.note?.trim() || null,

        type,
        date: fulfillment.date.trim(),
        time: fulfillment.time.trim(),
        address: type === "delivery" ? fulfillment.address.trim() : null,

        total,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    res.json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error creating order" });
  }
});

// ✅ Get one order (owner or admin)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.userId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    res.json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error fetching order" });
  }
});

// ✅ Get my orders list (or all for admin if mine=0)
router.get("/", requireAuth, async (req, res) => {
  try {
    // /api/orders?mine=1
    const mine = String(req.query.mine || "") === "1";

    const where =
      req.user.role === "ADMIN" && !mine
        ? {}
        : { userId: req.user.id };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

export default router;
