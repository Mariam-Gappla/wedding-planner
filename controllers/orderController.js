const Order = require("../models/order");
const Package = require("../models/package");

const formatOrder = (order) => {
  const vendorId = order.package?.serviceId?.vendorId;
  const userName = order.userId?.name;

  return {
    _id: order._id,
    status: order.status,
    date: order.date,
    total_price: order.total_price,
    shipping_info: order.shipping_info,
    full_name: order.full_name,
    package: order.package,
    userId: order.userId,
    userName,
    vendorId,
    method: order.method,
    paymentId: order.method === "cash" ? null : order.paymentId,
  };
};

// Create order (one order per package allowed)
const createOrder = async (req, res, next) => {
  try {
    const { bookingDate, name, notes, packageId, userId, method } = req.body;

    if (!packageId || !name || !bookingDate || !userId || !method) {
      return res.status(400).json({
        message: "Missing required fields: bookingDate, name, packageId, userId, or method.",
      });
    }

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ message: "Package not found." });
    }

    // Vendor cannot book own package
    if (selectedPackage.vendorId.toString() === userId.toString()) {
      return res.status(403).json({ message: "Vendors cannot book their own packages." });
    }

    // One order per package check
    // const existingOrder = await Order.findOne({ package: packageId });
    // if (existingOrder) {
    //   return res.status(400).json({ message: "This package is already booked." });
    // }

    // Create new order
    const newOrder = await Order.create({
      date: bookingDate,
      total_price: Number(selectedPackage.price),
      shipping_info: notes || "",
      full_name: name,
      package: packageId,
      userId: userId,
      method,
    });

    // Add order to Package.orders array
    if (Array.isArray(selectedPackage.orders)) {
      selectedPackage.orders.push(newOrder._id);
      await selectedPackage.save();
    }

    return res.status(201).json({
      status: 201,
      message: "Order created successfully",
      data: newOrder,
    });

  } catch (error) {
    next(error);
  }
};

// Get all orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId",
        },
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name",
      })
      .sort({ date: -1 });

    const formattedOrders = orders.map(formatOrder);

    return res.status(200).json({
      status: 200,
      message: "All orders retrieved successfully",
      data: formattedOrders,
    });

  } catch (error) {
    next(error);
  }
};

// Get orders by vendorId
const getOrdersByVendorId = async (req, res, next) => {
  try {
    const vendorId = req.params.vendorId;

    const orders = await Order.find()
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId",
        },
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name",
      })
      .sort({ date: -1 });

    const vendorOrders = orders.filter(
      (order) => order.package?.serviceId?.vendorId?.toString() === vendorId
    );

    const formattedOrders = vendorOrders.map(formatOrder);

    if (formattedOrders.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No orders found for this vendor",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Orders for vendor retrieved successfully",
      data: formattedOrders,
    });

  } catch (error) {
    next(error);
  }
};

// Update order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const allowedStatuses = ["pending", "refused", "confirmed", "paid", "payment_refused"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
      data: order,
    });

  } catch (error) {
    next(error);
  }
};

// Filter orders by status and vendorId
const filterOrdersbyStatusAndVendorId = async (req, res, next) => {
  try {
    const { status, vendorId } = req.query;

    const allowedStatuses = ["pending", "confirmed", "refused"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values are pending, confirmed, refused.",
      });
    }

    const statusFilter = status ? { status } : {};

    const orders = await Order.find(statusFilter)
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId",
        },
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name",
      })
      .sort({ date: -1 });

    const filteredOrders = vendorId
      ? orders.filter(
          (order) => order.package?.serviceId?.vendorId?.toString() === vendorId
        )
      : orders;

    const formattedOrders = filteredOrders.map(formatOrder);

    return res.status(200).json({
      status: 200,
      message: `Orders retrieved successfully${status ? ` with status '${status}'` : ""}${vendorId ? ` for vendor '${vendorId}'` : ""}`,
      data: formattedOrders,
    });

  } catch (error) {
    next(error);
  }
};

// Get orders by userId
const getOrdersByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ userId })
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId",
        },
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name",
      })
      .sort({ date: -1 });

    const formattedOrders = orders.map(formatOrder);

    if (formattedOrders.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No orders found for this user",
        data: []
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Orders for user retrieved successfully",
      data: formattedOrders,
    });

  } catch (error) {
    next(error);
  }
};

// Delete order
const deleteOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // Clean Package.orders array
    await Package.updateOne(
      { _id: deletedOrder.package },
      { $pull: { orders: deletedOrder._id } }
    );

    return res.status(200).json({
      status: 200,
      message: "Order deleted successfully",
      data: deletedOrder,
    });

  } catch (error) {
    next(error);
  }
};

// Get confirmed orders
const getConfirmedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: { $in: ["confirmed", "paid"] } })
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId",
        },
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name",
      })
      .sort({ date: -1 });

    const formattedOrders = orders.map(formatOrder);

    return res.status(200).json({
      status: 200,
      message: "Confirmed orders retrieved successfully",
      data: formattedOrders,
    });

  } catch (error) {
    next(error);
  }
};

// GET /orders/:orderId
const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find the order by its _id
    const order = await Order.findById(id)
      .populate('package') // Optional: populate package info
      .populate('userId', 'username email') // Optional: populate user info
      .exec();

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: 'Order not foundd',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Order retrieved successfully',
      data: order,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByVendorId,
  updateOrderStatus,
  filterOrdersbyStatusAndVendorId,
  getOrdersByUserId,
  deleteOrder,
  getConfirmedOrders,
  getOrderById
};
