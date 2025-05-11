const express = require("express");
const Package = require("../models/package");
const Service=require("../models/service")
const router = express.Router();
const upload = require("../config/uploadimage");
const User=require("../models/user")

// Add Package
router.post("/add", upload.single("image"), async (req, res, next) => {
    const { title, price} = req.body;
    const role=req.user.role;
    const VendorId=req.user.id;
    console.log(VendorId);
    const service = await Service.findOne({ vendorId :VendorId });
    console.log(service)
    if (!service) {
    return res.status(404).send({
        status: 404,
        message: "No service found for this vendor"
    });
}

    if(role=="Vendor")
    {
        try {
        const newPackage = await Package.create({
            title: title,
            price: price,
            serviceId: service._id,
            vendorId:VendorId
        });
        res.status(200).send({
            status: res.status,
            message: "Package added successfully",
            data: newPackage
        });
    } catch (err) {
        next(err);
    }
    }
    else
    {
        res.status(400).send({
            status:res.status,
            message:"not allow foe you"
        })
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
