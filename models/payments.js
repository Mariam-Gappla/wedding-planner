const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    amount: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now },
    screenshot: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    
    // New fields:
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    note: { 
      type: String, 
      default: '' 
    },
  },
  {
    timestamps: true, 
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
