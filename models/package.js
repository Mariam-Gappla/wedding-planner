const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: [3, 'Title must be at least 3 characters long'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be less than 0'],
  },
  description: {
    type: String,
    required: true,
    minlength: [10, 'Description must be at least 10 characters long'],
  },
  img: {
    type: String, 
  },
  features: [{
    type: String,
    required: true,
  }],
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor', 
    required: true,
  },
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
