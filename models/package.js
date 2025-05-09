const mongoose=require('mongoose');

// Package Schema
const packageSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    img: String,
    features: [String],
    serviceId:{type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }

  });

const Package=mongoose.model("Package",packageSchema);
  module.exports=Package;