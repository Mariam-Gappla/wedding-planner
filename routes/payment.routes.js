const express = require('express');
const router = express.Router()
const upload = require('../config/uploadimage');
router.use(express.static("images"));
const paymentController = require("../controllers/payment.controller");

// Create payment
router.post(
  '/',
  upload.fields([{ name: 'screenshot', maxCount: 1 }]),
  paymentController.createPayment
);

router.get('/order/:orderId', paymentController.getPaymentByOrderId);
router.get('/:paymentId', paymentController.getPaymentByPaymentId);
router.patch('/:paymentId/status', paymentController.updatePaymentStatusAndNote);



module.exports = router;
