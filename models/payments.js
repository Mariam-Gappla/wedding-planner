const mongoose=require('mongoose');
const paymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    paymentDate: { type: Date, default: Date.now },
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId:{type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    vendorId:{type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  });
  
  const Payment=mongoose.model("Payment",paymentSchema);
  module.exports=Payment;