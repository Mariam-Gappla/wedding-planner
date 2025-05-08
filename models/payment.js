const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    method: { type: String, enum: ['cash', 'card', 'paypal'], required: true },
    amount: Number
  });

module.exports = mongoose.model("Payment", paymentSchema);
