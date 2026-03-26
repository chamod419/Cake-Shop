import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { prisma } from "./lib/prisma.js";
import { authOptional } from "./middleware/auth.js";

import authRoutes from "./routes/auth.js";
import ordersRoutes from "./routes/orders.js";
import adminOrdersDbRoutes from "./routes/adminOrdersDb.js";
import adminProductsRoutes from "./routes/adminProducts.js";

const app = express();

app.use(
  cors({
    origin: isProd
      ? [process.env.CLIENT_URL]
      : ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(authOptional);

// serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.use("/api/orders", ordersRoutes);
app.use("/api/admin/orders", adminOrdersDbRoutes);
app.use("/api/admin/products", adminProductsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
