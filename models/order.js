const { required } = require('joi');
const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'refused'], 
    default: 'pending' 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  method: {
    type: String,
    enum: ['Visa', 'cash'], 
    default: 'cash'         
  },
  total_price: Number,
  shipping_info: String,
full_name: { 
    type: String,
    required: true
  },
  // Changed from array to single reference
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
