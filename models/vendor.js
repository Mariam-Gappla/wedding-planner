const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  role: {
    type: String,
    default: 'vendor',
    enum: ['vendor']
  },
  businessType: {
    type: [String]
  },
  phone: {
    type: String
  },
  socialLinks: {
    type: [String]
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
