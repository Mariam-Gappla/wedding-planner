const mongoose=require('mongoose');

const orderSchema = new mongoose.Schema({
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'delivered'], default: 'pending' },
    date: { type: Date, default: Date.now },
    quantity: Number,
    total_price: Number,
    shipping_info: String,
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  });

const Order=mongoose.model("Order",orderSchema);
module.exports=Order;