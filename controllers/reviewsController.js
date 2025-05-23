const Review = require('../models/reviews');
const Order = require("../models/order");

const createReview = async (req, res) => {
  const { content, rate, serviceId, userId, vendorId } = req.body;

  try {
    // Basic field validation
    if (!content || !rate || !serviceId || !userId || !vendorId) {
      return res.status(400).json({ message: "All fields (content, rate, serviceId, userId, vendorId) are required." });
    }

    if (rate < 1 || rate > 5) {
      return res.status(400).json({ message: "Rate must be between 1 and 5." });
    }

    if (content.trim() === "") {
      return res.status(400).json({ message: "Content cannot be empty." });
    }

    const reviewDate = new Date();

    // Step 1: Check if user has a confirmed order linked to the service & vendor
    const confirmedOrders = await Order.find({
      userId,
      status: "confirmed",
      date: { $lte: reviewDate }
    }).populate({
      path: 'package',
      populate: {
        path: 'serviceId',
        select: 'vendorId _id'
      }
    });

    const validOrder = confirmedOrders.find(order => {
      const pkg = order.package;
      return pkg &&
         pkg.serviceId &&
         pkg.serviceId._id.toString() === serviceId &&
         pkg.serviceId.vendorId.toString() === vendorId;
    });

    if (!validOrder) {
      return res.status(403).json({
        message: "You can only review vendors you've completed an order with.",
      });
    }
    // console.log("Valid order found:", validOrder);

    // Step 2: Check if review already exists
    const existingReview = await Review.findOne({
      userId,
      vendorId,
      serviceId
    });

    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this service." });
    }

    // Step 3: Create and save review
    const newReview = new Review({
      content,
      rate,
      serviceId,
      userId,
      vendorId,
      verified: true,
      date: reviewDate
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error while creating review." });
  }
};


const getReviewsByVendorId = async (req, res) => {
  const { vendorId } = req.params;

  try {
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required." });
    }

    const reviews = await Review.find({ vendorId })
      .populate('userId', 'name') // Optional: Populate user name
      .populate('serviceId', 'name'); // Optional: Populate service name

    if (reviews.length === 0) {
      return res.status(200).json({ message: "No reviews found for this vendor." });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews by vendor ID:", error);
    res.status(500).json({ message: "Server error while fetching reviews." });
  }
};


module.exports = {
  createReview,
  getReviewsByVendorId
};
