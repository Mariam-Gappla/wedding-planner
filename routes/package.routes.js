const express = require("express");
const Package = require("../models/package");
const router = express.Router();
const upload = require("../config/uploadimage");

// Add Package
router.post("/", upload.single("image"), async (req, res, next) => {
    const { title, price, description, features, serviceId } = req.body;
    try {
        const newPackage = await Package.create({
            title: title,
            price: price,
            description: description,
            img: req.file.originalname,
            features: features,
            serviceId: serviceId,
        });
        res.status(200).send({
            status: res.status,
            message: "Package added successfully",
            data: newPackage
        });
    } catch (err) {
        next(err);
    }
});

// Get All Packages
router.get("/", async (req, res, next) => {
    try {
        const packages = await Package.find();
        res.status(200).send({
            status: res.status,
            message: "Packages fetched successfully",
            data: packages
        });
    } catch (err) {
        next(err);
    }
});

// Get Package by ID
router.get("/:id", async (req, res, next) => {
    const packageId = req.params.id;
    try {
        const package = await Package.findById(packageId);
        if (!package) {
            return res.status(404).send({
                status: 404,
                message: "Package not found"
            });
        }
        res.status(200).send({
            status: res.status,
            message: "Package fetched successfully",
            data: package
        });
    } catch (err) {
        next(err);
    }
});

// Update Package
router.put("/:id", upload.single("image"), async (req, res, next) => {
    const packageId = req.params.id;
    const { title, price, description, features, serviceId } = req.body;

    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            {
                title: title,
                price: price,
                description: description,
                img: req.file ? req.file.originalname : undefined,  // Check if a new image is uploaded
                features: features,
                serviceId: serviceId,
            },
            { new: true }  // Return the updated package
        );
        if (!updatedPackage) {
            return res.status(404).send({
                status: 404,
                message: "Package not found"
            });
        }
        res.status(200).send({
            status: res.status,
            message: "Package updated successfully",
            data: updatedPackage
        });
    } catch (err) {
        next(err);
    }
});

// Delete Package
router.delete("/:id", async (req, res, next) => {
    const packageId = req.params.id;
    try {
        const deletedPackage = await Package.findByIdAndDelete(packageId);
        if (!deletedPackage) {
            return res.status(404).send({
                status: 404,
                message: "Package not found"
            });
        }
        res.status(200).send({
            status: res.status,
            message: "Package deleted successfully",
            data: deletedPackage
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
