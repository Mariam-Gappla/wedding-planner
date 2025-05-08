const mongoose=require('mongoose');

// Package Schema
const packageSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    img: String,
    features: [String],
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }
  });

module.exports = mongoose.model("Package", packageSchema);