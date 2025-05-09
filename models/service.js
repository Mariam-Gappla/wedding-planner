const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  img: String,
  createdAt: { type: Date, default: Date.now },
});

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;