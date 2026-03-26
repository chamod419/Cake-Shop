import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Parse size label into weight in KG.
 * Supports: "0.5kg", "1kg", "2 kg", "500g", "1/2kg"
 */
function parseWeightKg(sizeLabel) {
  if (!sizeLabel) return null;
  const s = String(sizeLabel).trim().toLowerCase();

  // fraction like 1/2kg
  const frac = s.match(/(\d+)\s*\/\s*(\d+)\s*(kg|g)?/i);
  if (frac) {
    const a = Number(frac[1]);
    const b = Number(frac[2]);
    const unit = (frac[3] || "kg").toLowerCase();
    if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) {
      const val = a / b;
      return unit === "g" ? val / 1000 : val;
    }
  }

  // grams
  const mg = s.match(/([\d.]+)\s*g\b/i);
  if (mg) {
    const g = Number(mg[1]);
    if (Number.isFinite(g) && g > 0) return g / 1000;
  }

  // kilograms
  const mk = s.match(/([\d.]+)\s*kg\b/i);
  if (mk) {
    const kg = Number(mk[1]);
    if (Number.isFinite(kg) && kg > 0) return kg;
  }

  // numeric only -> assume KG
  const numOnly = s.match(/^([\d.]+)$/);
  if (numOnly) {
    const kg = Number(numOnly[1]);
    if (Number.isFinite(kg) && kg > 0) return kg;
  }

  return null;
}

/**
 * Choose a default size from product.sizes (smallest weight).
 */
function chooseDefaultSize(sizes) {
  if (!Array.isArray(sizes) || sizes.length === 0) return null;

  let best = sizes[0];
  let bestKg = parseWeightKg(best);

  for (const s of sizes) {
    const kg = parseWeightKg(s);
    if (kg == null) continue;
    if (bestKg == null || kg < bestKg) {
      best = s;
      bestKg = kg;
    }
  }

  return best;
}

/**
 * Calculate price based on weight.
 * Assumption: product.price is 1kg price.
 */
function calcPriceByWeight(product, sizeLabel) {
  const base = Number(product?.price ?? 0);
  const kg = parseWeightKg(sizeLabel) ?? 1; // fallback 1kg if cannot parse
  return Math.round(base * kg);
}

function norm(v) {
  return String(v ?? "").trim().toLowerCase();
}

// ✅ Create order (requires login)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { customer, fulfillment, items } = req.body || {};

    if (!customer?.name?.trim())
      return res.status(400).json({ message: "Customer name is required" });
    if (!customer?.phone?.trim())
      return res.status(400).json({ message: "Customer phone is required" });

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

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    // allow both productId and id coming from client (robust)
    const productIds = [...new Set(items.map((i) => i.productId || i.id).filter(Boolean))];
    if (productIds.length === 0) {
      return res.status(400).json({ message: "Invalid cart items" });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItemsData = [];

    for (const i of items) {
      const pid = i.productId || i.id;
      const p = productMap.get(pid);
      if (!p) return res.status(400).json({ message: "Invalid product in cart" });

      const qty = Number(i.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const hasSizes = Array.isArray(p.sizes) && p.sizes.length > 0;

      // ✅ If client didn't send size, server picks a safe default (smallest)
      let selectedSize = i.size ?? null;
      if (!selectedSize && hasSizes) {
        selectedSize = chooseDefaultSize(p.sizes);
      }

      // validate size if sizes exist
      if (hasSizes && selectedSize) {
        const ok = p.sizes.some((s) => norm(s) === norm(selectedSize));
        if (!ok) {
          return res.status(400).json({ message: `Invalid size for product: ${p.name}` });
        }
      }

      // compute unit price from size
      const computedUnitPrice = calcPriceByWeight(p, selectedSize);

      orderItemsData.push({
        productId: p.id,
        name: p.name,
        price: computedUnitPrice, // ✅ computed unit price saved
        qty,
        size: selectedSize,
        flavor: i.flavor || null,
        image: p.image || null,
      });
    }

    const total = orderItemsData.reduce((sum, x) => sum + x.price * x.qty, 0);

    const created = await prisma.order.create({
      data: {
        user: { connect: { id: req.user.id } },

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

// ✅ Get orders list (mine=1 => my orders only)
router.get("/", requireAuth, async (req, res) => {
  try {
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
