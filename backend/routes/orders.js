const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

// PUBLIC – Place Order
router.post("/", async (req, res) => {
  const order = new Order({
    items: req.body.items,
    total: req.body.total,
    status: "Pending",
  });
  await order.save();
  res.json(order);
});

// ADMIN – View Orders
router.get("/", auth, async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// ADMIN – Update Status
router.put("/:id", auth, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });
  res.json({ message: "Updated" });
});

module.exports = router;
