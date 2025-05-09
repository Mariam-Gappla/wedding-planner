const mongoose=require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: { type: String, required: true },
  address: String,
  businessType: [String],
  phone: String,
  socialLinks: [String],
  verified: { type: Boolean, default: false },
});

const Vendor=mongoose.model("Vendor",vendorSchema);
module.exports=Vendor;