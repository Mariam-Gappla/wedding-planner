const mongoose=require('mongoose');

const reviewSchema = new mongoose.Schema({
    content: String,
    rate: { type: Number, min: 1, max: 5 },
    date: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId:{type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  });

const Review=mongoose.model("Review",reviewSchema);
module.exports=Review;