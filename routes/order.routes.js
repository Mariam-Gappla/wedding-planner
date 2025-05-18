const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Package = require("../models/package");
const User = require("../models/user");
const Service = require('../models/service');

// Create Order (accessible by both users and vendors)
router.post("/", async (req, res, next) => {
  try {
    const { bookingDate, name, payment, notes, packageId, userId } = req.body;

    // 1. Validate required fields
    if (!packageId || !name || !bookingDate || !userId) {
      return res.status(400).json({ message: "Missing required fields: bookingDate, name, packageId, or userId." });
    }

    // 2. Fetch the selected package
    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ message: "Package not found." });
    }

    // 3. Create new order
    const newOrder = await Order.create({
      date: bookingDate,
      total_price: Number(selectedPackage.price),
      shipping_info: notes || "",
      full_name: name,
      package: packageId,
      userId: userId,
      payment: payment || "", // Include payment if your Order model supports it
    });

    // 4. Link order to package if orders field exists and is an array
    if (Array.isArray(selectedPackage.orders)) {
      selectedPackage.orders.push(newOrder._id);
      await selectedPackage.save();
    }

    // 5. Send response
    return res.status(201).json({
      status: 201,
      message: "Order created successfully",
      data: newOrder,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// GET all orders with populated package, service, and user details
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId" // Include vendorId
        }
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name" //  include user name
      })
      .sort({ createdAt: -1 });

    // Format the data to include vendorId
    const formattedOrders = orders.map(order => {
      const vendorId = order.package?.serviceId?.vendorId;
       const userName = order.userId?.name;

      return {
        _id: order._id,
        status: order.status,
        date: order.date,
        total_price: order.total_price,
        shipping_info: order.shipping_info,
        full_name: order.full_name,
        package: order.package, //  whole package
        userId: order.userId,
        userName: userName,
        vendorId: vendorId, // Include vendorId in the response
        paymentId: order.paymentId,
      };
    });

    return res.status(200).json({
      status: 200,
      message: "All orders retrieved successfully",
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

//get orders by vendorId

router.get("/vendor/:vendorId", async (req, res, next) => {
  try {
    const vendorId = req.params.vendorId;

    // Find orders where the package's service's vendorId matches the requested vendorId
    const orders = await Order.find()
      .populate({
        path: 'package',
        populate: {
          path: 'serviceId',
          model: 'Service',
          select: 'title category vendorId',
        },
      })
      .populate({
        path: 'userId',
        model: 'User',
        select: 'name',
      })
      .sort({ date: -1 });

    const vendorOrders = orders.filter(
      (order) => order.package?.vendorId?.toString() === vendorId
    );

    const formattedOrders = vendorOrders.map((order) => ({
      _id: order._id,
      status: order.status,
      date: order.date,
      total_price: order.total_price,
      shipping_info: order.shipping_info,
      full_name: order.full_name,
      package: order.package,
      userName: order.userId?.name,
      vendorId: order.package?.serviceId?.vendorId,
      paymentId: order.paymentId,
    }));

    if (!formattedOrders || formattedOrders.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No orders found for this vendor",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Orders for vendor retrieved successfully",
      data: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE order status
router.patch("/:orderId/status", async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    // 1. Validate status
    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'delivered'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 2. Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 3. Authorization check (Optional -  check if the user is allowed to update this order)
    // Example: Only the vendor who owns the service in the order can change the status
    // if (req.user.role === 'vendor') {
    //   const package = await Package.findById(order.package).populate('serviceId');
    //   if (package.serviceId.vendorId.toString() !== req.user._id.toString()) {
    //     return res.status(403).json({ message: "Unauthorized to update this order" });
    //   }
    // }

    // 4. Update the status
    order.status = status;
    await order.save();

    // 5. Send response
    return res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
