const mongoose=require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: String,
    desc: String,
    img: String,
    category: String,
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model("Service", serviceSchema);