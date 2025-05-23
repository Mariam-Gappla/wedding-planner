const Order = require("../models/order");
const Package = require("../models/package"); // Assuming this is the correct model

const createOrder = async (req, res) => {
  try {
    const { bookingDate, name, paymentId, notes, packageId, userId, method } = req.body;

    if (!packageId || !name || !bookingDate || !userId || !method) {
      return res.status(400).json({
        message: "Missing required fields: bookingDate, name, packageId, userId, or method."
      });
    }

    // ✅ استخدم موديل Package بدلاً من Order هنا
    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ message: "Package not found." });
    }

    // ✅ Check that vendorId is not the same as userId
    if (selectedPackage.vendorId.toString() === userId.toString()) {
      return res.status(403).json({
        message: "Vendors cannot book their own packages."
      });
    }

    // إنشاء الطلب الجديد
    const newOrder = await Order.create({
      date: bookingDate,
      total_price: Number(selectedPackage.price),
      shipping_info: notes || "",
      full_name: name,
      package: packageId,
      userId: userId,
      method,
      paymentId: method === "cash" ? null : paymentId || null,
    });

    // تحديث الحزمة بإضافة الـ order الجديد إلى مصفوفة الطلبات
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
    console.error("Error creating order:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get order by ID
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId"
        }
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name"
      })
      .sort({ date: -1 });

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
        package: order.package,
        userId: order.userId,
        userName,
        vendorId,
        method: order.method,
        paymentId: order.method === "cash" ? null : order.paymentId,
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
}

//get order by vendorId
const getOrdersByVendorId =async (req, res, next) => {
  try {
    const vendorId = req.params.vendorId;

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

    // Filter only orders where service's vendorId matches
    const vendorOrders = orders.filter(order =>
      order.package?.serviceId?.vendorId?.toString() === vendorId
    );

    const formattedOrders = vendorOrders.map(order => ({
      _id: order._id,
      status: order.status,
      date: order.date,
      total_price: order.total_price,
      shipping_info: order.shipping_info,
      full_name: order.full_name,
      package: order.package,
      userName: order.userId?.name,
      vendorId: order.package?.serviceId?.vendorId,
      method: order.method,
      paymentId: order.method === "cash" ? null : order.paymentId,
    }));

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
}

//update order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'refused', 'confirmed'];
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
}

//filter orders by order status and vendorId
const filterOrdersbyStatusAndVendorId = async (req, res) => {
  try {
    const { status, vendorId } = req.query;

    const allowedStatuses = ['pending', 'confirmed', 'refused'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Allowed values are pending, confirmed, refused." });
    }

    // Get all orders (filtered by status if provided)
    const statusFilter = status ? { status } : {};
    const orders = await Order.find(statusFilter)
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId"
        }
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name"
      })
      .sort({ date: -1 });

    // Filter by vendorId if provided
    const filteredOrders = vendorId
      ? orders.filter(order =>
          order.package?.serviceId?.vendorId?.toString() === vendorId
        )
      : orders;

    const formattedOrders = filteredOrders.map(order => ({
      _id: order._id,
      status: order.status,
      date: order.date,
      total_price: order.total_price,
      shipping_info: order.shipping_info,
      full_name: order.full_name,
      package: order.package,
      userName: order.userId?.name,
      vendorId: order.package?.serviceId?.vendorId,
      method: order.method,
      paymentId: order.method === "cash" ? null : order.paymentId,
    }));

    return res.status(200).json({
      status: 200,
      message: `Orders retrieved successfully${status ? ` with status '${status}'` : ""}${vendorId ? ` for vendor '${vendorId}'` : ""}`,
      data: formattedOrders,
    });

  } catch (error) {
    console.error("Error fetching orders by filters:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

//get order by userId
const getOrdersByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ userId })
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

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      status: order.status,
      date: order.date,
      total_price: order.total_price,
      shipping_info: order.shipping_info,
      full_name: order.full_name,
      package: order.package,
      userName: order.userId?.name,
      vendorId: order.package?.serviceId?.vendorId,
      method: order.method,
      paymentId: order.method === "cash" ? null : order.paymentId,
    }));

    if (formattedOrders.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No orders found for this user",
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
}

//delete order
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

    return res.status(200).json({
      status: 200,
      message: "Order deleted successfully",
      data: deletedOrder,
    });

  } catch (error) {
    next(error);
  }
}

const getConfirmedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "confirmed" }) // filter for confirmed orders
      .populate({
        path: "package",
        populate: {
          path: "serviceId",
          model: "Service",
          select: "title category vendorId"
        }
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name"
      })
      .sort({ date: -1 });

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
        package: order.package,
        userId: order.userId,
        userName,
        vendorId,
        method: order.method,
        paymentId: order.method === "cash" ? null : order.paymentId,
      };
    });

    return res.status(200).json({
      status: 200,
      message: "Confirmed orders retrieved successfully",
      data: formattedOrders,
    });

  } catch (error) {
    console.error("Error fetching confirmed orders:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
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
  getConfirmedOrders
};
