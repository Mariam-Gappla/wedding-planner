const mongoose=require('mongoose');

const paymentSchema = new mongoose.Schema({
    method: String,
    amount: Number,
    payment_status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    date: { type: Date, default: Date.now },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  });

module.exports = mongoose.model("Payment", paymentSchema);