const Order = require("../models/order");
const path = require('path');
const express = require('express');
const router = express.Router();
const fs = require('fs');
router.use(express.static("images"));
const Payment = require("../models/payments");
const { sendPaymentStatusEmail } = require('../utils/email');
const User = require('../models/user'); // import User model if needed
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

    // Check for required fields
    if (
      !fullName ||
      !phoneNumber ||
      !amount ||
      !paymentMethod ||
      !userId ||
      !orderId ||
      !vendorId
    ) {
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

    // Save screenshot
    const saveImage = (fileBuffer, filename) => {
      const fullPath = path.join(__dirname, '..', 'uploads', filename);
      fs.writeFileSync(fullPath, fileBuffer);
      return 'uploads/' + filename;
    };

    const screenshotFilename = Date.now() + '-' + screenshotFile.originalname;
    const screenshotPath = saveImage(screenshotFile.buffer, screenshotFilename);

    // Create payment document with explicit default status
    const newPayment = await Payment.create({
      fullName,
      phoneNumber,
      amount,
      paymentMethod,
      screenshot: screenshotPath,
      userId,
      orderId,
      vendorId,
      status: 'pending', // <- Added this line to explicitly set status default
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

const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Validate orderId
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required.' });
    }

    // Find payment by orderId
    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(200).json({
        status: 200,
        message: 'No payment for this order',
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

const getPaymentByPaymentId = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    // Validate orderId
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required.' });
    }

    // Find payment by orderId
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(200).json({
        status: 200,
        message: 'Error fetching payment',
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
                ...(note !== undefined && { note })
            },
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }

        // ✅ Now send email to user
        const user = await User.findById(updatedPayment.userId);
        if (user && user.email) {
            await sendPaymentStatusEmail(user.email, status, note);
        } else {
            console.warn('User email not found, skipping email.');
        }

        return res.status(200).json({
            status: 200,
            message: 'Payment updated successfully and email sent.',
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
  updatePaymentStatusAndNote
};
