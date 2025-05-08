const mongoose=require('mongoose');

const reviewSchema = new mongoose.Schema({
    content: String,
    rate: { type: Number, min: 1, max: 5 },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    date: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  });

module.exports = mongoose.model("Review", reviewSchema);