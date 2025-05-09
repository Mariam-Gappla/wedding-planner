// const mongoose = require("mongoose");

// const bookingSchema = new mongoose.Schema({
//   user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   package_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Package",
//     required: true,
//   },
//   date: {
//     type: Date,
//     default: Date.now,  // Ensure date is set to the current date by default
//   },
//   status: {
//     type: String,
//     enum: ["pending", "confirmed", "cancelled"],
//     default: "pending",
//   },
//   payment_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Payment",  // Reference to the payment (if applicable)
//   },
// });

// module.exports = mongoose.model("Booking", bookingSchema);
