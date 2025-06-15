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
      status: { $in: ["confirmed", "paid"] },
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

const getReviewsByServiceId = async (req, res) => {
  const { serviceId } = req.params;

  try {
    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required." });
    }

    const reviews = await Review.find({ serviceId })
      .populate('userId') // ✅ Full user info
      .populate('vendorId', 'name'); // Still only vendor name (optional)

    if (reviews.length === 0) {
      return res.status(200).json({ message: "No reviews found for this service." });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews by service ID:", error);
    res.status(500).json({ message: "Server error while fetching service reviews." });
  }
};

const getTopRatedVendors = async (req, res) => {
  try {
    const topVendors = await Review.aggregate([
      {
        $group: {
          _id: "$vendorId",
          averageRating: { $avg: "$rate" },
          totalReviews: { $sum: 1 }
        }
      },
      {
        $sort: { averageRating: -1 } // Descending
      },
      {
        $lookup: {
          from: "users", // ⚠️ This should match your actual vendors collection name
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails"
        }
      },
      {
        $unwind: "$vendorDetails"
      },
      {
        $project: {
          _id: 0,
          vendorId: "$_id",
          averageRating: { $round: ["$averageRating", 2] },
          totalReviews: 1,
          vendorName: "$vendorDetails.name"
        }
      }
    ]);

    res.status(200).json(topVendors);
  } catch (error) {
    console.error("Error fetching top-rated vendors:", error);
    res.status(500).json({ message: "Server error while fetching top-rated vendors." });
  }
};

const getTopRatedVendorsWithTopServiceByCategory = async (req, res) => {
  try {
    const topVendorsByCategory = await Review.aggregate([
      // Join services on vendorId to get category and service details
      {
        $lookup: {
          from: "services",
          localField: "vendorId",
          foreignField: "vendorId",
          as: "services"
        }
      },

      // Unwind services array (multiple services per vendor)
      { $unwind: "$services" },

      // Group by category, vendorId, and serviceId to get avg rating per service
      {
        $group: {
          _id: {
            category: "$services.category",
            vendorId: "$vendorId",
            serviceId: "$services._id",
            serviceTitle: "$services.title",
            serviceImage: "$services.profileImage"
          },
          avgServiceRating: { $avg: "$rate" },
          totalReviews: { $sum: 1 }
        }
      },

      // Group by category & vendorId to find the top-rated service per vendor
      {
        $sort: {
          "_id.category": 1,
          "_id.vendorId": 1,
          avgServiceRating: -1 // sort services desc by rating
        }
      },
      {
        $group: {
          _id: {
            category: "$_id.category",
            vendorId: "$_id.vendorId"
          },
          topService: {
            $first: {
              serviceId: "$_id.serviceId",
              serviceTitle: "$_id.serviceTitle",
              serviceImage: "$_id.serviceImage",
              avgServiceRating: { $round: ["$avgServiceRating", 2] },
              totalReviews: "$totalReviews"
            }
          }
        }
      },

      // Group by category to get the top vendor by highest service rating
      {
        $sort: {
          "_id.category": 1,
          "topService.avgServiceRating": -1
        }
      },
      {
        $group: {
          _id: "$_id.category",
          topVendor: { $first: "$_id.vendorId" },
          topService: { $first: "$topService" }
        }
      },

      // Lookup vendor details from users collection
      {
        $lookup: {
          from: "users",
          localField: "topVendor",
          foreignField: "_id",
          as: "vendorDetails"
        }
      },
      { $unwind: "$vendorDetails" },

      // Format output
      {
        $project: {
          _id: 0,
          category: "$_id",
          vendorId: "$topVendor",
          vendorName: "$vendorDetails.name",
          topService: 1
        }
      }
    ]);

    res.status(200).json(topVendorsByCategory);
  } catch (error) {
    console.error("Error fetching top-rated vendors with top services by category:", error);
    res.status(500).json({ message: "Server error while fetching top-rated vendors with top services by category." });
  }
};

module.exports = {
  createReview,
  getReviewsByVendorId,
  getReviewsByServiceId,
  getTopRatedVendors,
  getTopRatedVendorsWithTopServiceByCategory
};
