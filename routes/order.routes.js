const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getOrdersByVendorId, updateOrderStatus, getOrdersByUserId, filterOrdersbyStatusAndVendorId, deleteOrder, getConfirmedOrders } = require("../controllers/orderController");

// CREATE ORDER
router.post("/", createOrder);

// GET ALL ORDERS
router.get("/", getAllOrders);

// GET ORDERS BY VENDOR ID
router.get("/vendor/:vendorId", getOrdersByVendorId);

// UPDATE ORDER STATUS
router.patch("/:orderId/status", updateOrderStatus);


// GET ORDERS with optional filters: status and vendorId
router.get("/filter", filterOrdersbyStatusAndVendorId);

router.get("/user/:userId", getOrdersByUserId);

router.delete("/:orderId", deleteOrder);
router.get('/confirmed', getConfirmedOrders);

module.exports = router;
