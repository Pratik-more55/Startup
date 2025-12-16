const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URL = process.env.MONGO_URI;

// MongoDB
mongoose
  .connect(MONGO_URL )
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Error ❌", err));

// Order Schema
const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    items: Array,
    total: Number,
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
  })
);

// Health
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    const token = jwt.sign(
      { role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

// Place Order (PUBLIC)
app.post("/api/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ message: "Order placed successfully" });
  } catch {
    res.status(500).json({ message: "Order failed" });
  }
});

// Get Orders (ADMIN)
app.get("/api/orders", auth, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// Update Order Status (ADMIN)
app.put("/api/orders/:id", auth, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });
  res.json({ message: "Status updated" });
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT} 🚀`)
);
