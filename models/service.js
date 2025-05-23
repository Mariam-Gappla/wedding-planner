const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String,require:true },
  category:{ type: String,require:true },
  exprience:{ type: String,require:true },
  profileImage: { type: String,require:true},
  serviceImage:[{ type: String,require:true }],
 serviceDetails: { type: String ,require:true},
 Address:{ type: String },
 phone:{ type: String,require:true },
 facebookLink:{ type: String},
 instgrameLink:{ type: String},
 likes:{type:String},
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