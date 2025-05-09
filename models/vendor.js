const mongoose=require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    businessType: { type: [String]},
    phone: String,
    socialLinks: [String],
    verified: { type: Boolean, default: false }
  });

const Vendor=mongoose.model("Vendor",vendorSchema);
module.exports=Vendor;