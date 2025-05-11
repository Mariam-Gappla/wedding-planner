const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String },
  category:{ type: String },
  exprience:{ type: String },
  profileImage: { type: String },
  serviceImage:[{ type: String }],
 serviceDetails: { type: String },
 Address:{ type: String },
 phone:{ type: String },
 facebookLink:{ type: String },
 instgrameLink:{ type: String },
 vendorId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
   },
  createdAt: { type: Date, default: Date.now },
});

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;