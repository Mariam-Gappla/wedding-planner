const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  content: { type: String, required: true },
  rate: { type: Number, min: 1, max: 5 },
  date: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
