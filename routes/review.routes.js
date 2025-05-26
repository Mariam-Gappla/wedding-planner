const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByVendorId,
  getReviewsByServiceId,
  getTopRatedVendors,
  getTopRatedVendorsWithTopServiceByCategory
} = require('../controllers/reviewsController');

router.get('/top-rated/category', getTopRatedVendorsWithTopServiceByCategory);
router.get('/top-rated', getTopRatedVendors);
router.post('/', createReview);
router.get('/:vendorId', getReviewsByVendorId);
router.get('/service/:serviceId', getReviewsByServiceId);

module.exports = router;
