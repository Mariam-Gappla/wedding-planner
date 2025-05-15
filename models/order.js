const { verify } = require('jsonwebtoken');
const mongoose=require('mongoose');

const orderSchema = new mongoose.Schema({
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'delivered'], default: 'pending' },
    date: { type: Date, default: Date.now },
    total_price: Number,
    shipping_info: String,
    packages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package', // كل Package يمكن أن يكون مرتبط بـ عدة Orders
    required: true
  }],
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  });

const Order=mongoose.model("Order",orderSchema);
module.exports=Order;