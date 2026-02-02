import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { calcUnitPrice } from "../utils/pricing";

const CartContext = createContext(null);

function keyOf(item) {
  return `${item.productId}|${item.size || ""}|${item.flavor || ""}`;
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function migrateCartState(rawState) {
  // Expect: { items: [...] }
  if (!rawState || typeof rawState !== "object") return { items: [] };
  const items = Array.isArray(rawState.items) ? rawState.items : [];

  // If old format had "price" but new needs "unitPrice", migrate
  const migratedItems = items.map((it) => {
    const unitPrice = safeNumber(it.unitPrice, NaN);

    // if unitPrice not present, fallback to old "price"
    const fallbackUnit = Number.isFinite(unitPrice) ? unitPrice : safeNumber(it.price, 0);

    return {
      productId: it.productId,
      name: it.name,
      image: it.image,
      size: it.size ?? null,
      flavor: it.flavor ?? null,
      qty: Math.max(1, safeNumber(it.qty, 1)),
      unitPrice: fallbackUnit,
    };
  });

  return { items: migratedItems };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET":
      return migrateCartState(action.payload);

    case "ADD": {
      const incoming = action.payload;
      const k = keyOf(incoming);

      const idx = state.items.findIndex((x) => keyOf(x) === k);
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = {
          ...items[idx],
          qty: safeNumber(items[idx].qty, 1) + safeNumber(incoming.qty, 1),
          // keep latest unitPrice (in case price changed by size)
          unitPrice: safeNumber(incoming.unitPrice, items[idx].unitPrice),
        };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, incoming] };
    }

    case "QTY": {
      const { k, qty } = action.payload;
      const q = Math.max(1, safeNumber(qty, 1));
      const items = state.items
        .map((x) => (keyOf(x) === k ? { ...x, qty: q } : x))
        .filter((x) => safeNumber(x.qty, 0) > 0);
      return { ...state, items };
    }

    case "REMOVE": {
      const { k } = action.payload;
      return { ...state, items: state.items.filter((x) => keyOf(x) !== k) };
    }

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

const initial = { items: [] };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // ✅ Load + migrate safely
  useEffect(() => {
    const raw = localStorage.getItem("cake_cart");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      dispatch({ type: "SET", payload: parsed });
    } catch {
      // if corrupted, reset
      localStorage.removeItem("cake_cart");
      dispatch({ type: "SET", payload: { items: [] } });
    }
  }, []);

  // ✅ Save
  useEffect(() => {
    localStorage.setItem("cake_cart", JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => {
    function addToCart(product, { size, flavor, qty = 1 } = {}) {
      const unitPrice = safeNumber(calcUnitPrice(product, size), 0);

      dispatch({
        type: "ADD",
        payload: {
          productId: product.id,
          name: product.name,
          image: product.image,
          size: size || null,
          flavor: flavor || null,
          qty: Math.max(1, safeNumber(qty, 1)),
          unitPrice,
        },
      });
    }

    function setQty(itemKey, qty) {
      dispatch({ type: "QTY", payload: { k: itemKey, qty } });
    }

    function remove(itemKey) {
      dispatch({ type: "REMOVE", payload: { k: itemKey } });
    }

    function clear() {
      dispatch({ type: "CLEAR" });
    }

    // ✅ Safe subtotal
    const subtotal = state.items.reduce((sum, it) => {
      const unit = safeNumber(it.unitPrice, 0);
      const q = safeNumber(it.qty, 0);
      return sum + unit * q;
    }, 0);

    return { items: state.items, addToCart, setQty, remove, clear, subtotal };
  }, [state.items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
