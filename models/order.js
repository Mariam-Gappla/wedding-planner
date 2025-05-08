const mongoose=require('mongoose');

const orderSchema = new mongoose.Schema({
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'delivered'], default: 'pending' },
    date: { type: Date, default: Date.now },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    quantity: Number,
    total_price: Number,
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    shipping_info: String
  });

module.exports = mongoose.model("Order", orderSchema);