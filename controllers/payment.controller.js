const path = require('path');
const fs = require('fs/promises');
const Order = require("../models/order");
const Payment = require("../models/payments");
const User = require('../models/user');
const { sendPaymentStatusEmail } = require('../utils/email');

// === Create Payment ===
const createPayment = async (req, res, next) => {
  try {
    const {
      fullName,
      phoneNumber,
      amount,
      paymentMethod,
      userId,
      orderId,
      vendorId,
    } = req.body;

    // Validate input
    if (!fullName || !phoneNumber || !amount || !paymentMethod || !userId || !orderId || !vendorId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Check screenshot file
    const screenshotFile = req.files?.screenshot?.[0];
    if (!screenshotFile) {
      return res.status(400).json({ message: 'Screenshot file is required.' });
    }

    // Validate order existence
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Save screenshot to /uploads
    const filename = Date.now() + '-' + screenshotFile.originalname;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    await fs.writeFile(filePath, screenshotFile.buffer);
    const screenshotPath = 'uploads/' + filename;

    // Create payment
    const newPayment = await Payment.create({
      fullName,
      phoneNumber,
      amount,
      paymentMethod,
      screenshot: screenshotPath,
      userId,
      orderId,
      vendorId,
      status: 'pending',
    });

    return res.status(201).json({
      status: 201,
      message: 'Payment created successfully.',
      data: newPayment,
    });
  } catch (error) {
    next(error);
  }
};

// === Get Payment by Order ID ===
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required.' });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(200).json({
        status: 200,
        message: 'No payment found for this order.',
        data: [],
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Payment retrieved successfully.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// === Get Payment by Payment ID ===
const getPaymentByPaymentId = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required.' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        status: 404,
        message: 'Payment not found.',
        data: [],
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Payment retrieved successfully.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// === Update Payment Status and Note ===
const updatePaymentStatusAndNote = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = ['pending', 'accepted', 'refused'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        ...(status && { status }),
        ...(note !== undefined && { note }),
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    // Send email
    const user = await User.findById(updatedPayment.userId);
    if (user?.email) {
      await sendPaymentStatusEmail(user.email, status, note);
    } else {
      console.warn('⚠️ User email not found, email not sent.');
    }

    return res.status(200).json({
      status: 200,
      message: 'Payment updated successfully.',
      data: updatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getPaymentByOrderId,
  getPaymentByPaymentId,
  updatePaymentStatusAndNote,
};
