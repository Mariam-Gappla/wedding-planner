const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    method: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  });

module.exports = mongoose.model("Payment", paymentSchema);
