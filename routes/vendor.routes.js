const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor'); // تأكد من المسار الصح لموديل Vendor

router.use(express.json());

// ✅ Example handler for POST /add
router.post('/add', async (req, res, next) => {
    try {
        const newVendor = await Vendor.create(req.body);
        res.status(201).send({
            status: res.statusCode,
            message: "Vendor created successfully",
            data: newVendor
        });
    } catch (err) {
        next(err);
    }
});

// ✅ Get all vendors
router.get('/', async (req, res, next) => {
    try {
        const vendors = await Vendor.find({});
        res.status(200).send({
            status: res.statusCode,
            data: vendors,
        });
    } catch (err) {
        next(err);
    }
});

// ✅ Get vendor by ID
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const vendor = await Vendor.findById(id);
        res.status(200).send({
            status: res.statusCode,
            data: vendor,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
