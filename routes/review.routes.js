const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByVendorId
} = require('../controllers/reviewsController');


router.post('/', createReview);
router.get('/:vendorId', getReviewsByVendorId);
module.exports = router;
