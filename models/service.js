const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  exprience: { type: String, required: true },
  profileImage: { type: String, required: true },
  serviceImage: [{ type: String, required: true }],
  serviceDetails: { type: String, required: true },
  Address: { type: String },
  phone: { type: String, required: true },
  facebookLink: { type: String },
  instgrameLink: { type: String },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ["Accepted", "Pending", "Refused"],
    default: "Pending"
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: { type: Date, default: Date.now },
});

serviceSchema.virtual('packages', {
  ref: 'Package',
  localField: '_id',
  foreignField: 'serviceId'
});
serviceSchema.set('toObject', { virtuals: true });
serviceSchema.set('toJSON', { virtuals: true });

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;