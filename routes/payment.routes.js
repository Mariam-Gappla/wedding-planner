const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const PaymentController = require("../controllers/payment.controller");

const storge = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storge });
router.post('/payment', upload.single('screenshot'), PaymentController.createPayment);
module.exports = router;