const mongoose=require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    businessType: { type: String, enum: ['photographer', 'seller', 'hall_owner', 'dress_designer'] },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: String,
    website: String,
    socialLinks: [String],
    verified: { type: Boolean, default: false }
  });

module.exports = mongoose.model("Vendor", vendorSchema);