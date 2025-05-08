const mongoose=require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: String,
    desc: String,
    img: String,
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model("Service", serviceSchema);