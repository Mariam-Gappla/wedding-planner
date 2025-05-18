const express = require('express');
const router = express.Router()
const Service = require('../models/service');
const User=require('../models/user');
const upload = require('../config/uploadimage');
const Order = require("../models/order")
const path = require('path');
const fs = require('fs');
router.use(express.static("images"));
const { serviceSchema } = require('../validition/servicevalidation');
//add service

router.post('/add', upload.fields([
    { name: "image", maxCount: 1 },
    { name: "serviceimages", maxCount: 10 },
]), async (req, res, next) => {
    const role = req.user.role;
    if (role !== "Vendor") {
        return res.status(400).send({
            status: res.statusCode,
            message: "not allowed for you"
        });
    }

    try {
        const dataToValidate = {
            ...req.body,
            profileImage: req.files?.image?.[0]?.originalname,
            serviceImage: req.files?.serviceimages?.map(f => f.originalname)
        };

        const { error } = serviceSchema.validate(dataToValidate);
        if (error) {
            console.log('Validation Error:', error.details);
            return res.status(400).send({
                status: res.statusCode,
                message: error.details[0].message
            });
        }

        // ✅ validation passed → نحفظ الصور يدويًا
        const saveImage = (fileBuffer, filename) => {
            const fullPath = path.join(__dirname, '..', 'images', filename);
            fs.writeFileSync(fullPath, fileBuffer);
            return "images/" + filename;
        };

        const profileImageFile = req.files?.image?.[0];
        const serviceImageFiles = req.files?.serviceimages || [];

        const profileImagePath = profileImageFile
            ? saveImage(profileImageFile.buffer, Date.now() + '-' + profileImageFile.originalname)
            : "";

        const serviceImagePaths = serviceImageFiles.map(file =>
            saveImage(file.buffer, Date.now() + '-' + file.originalname)
        );

        const { title, category, exprience, serviceDetails, address, phone, facebookLink, instgrameLink, likes } = req.body;

        const service = await Service.create({
            title,
            category,
            exprience,
            profileImage: profileImagePath,
            serviceImage: serviceImagePaths,
            serviceDetails,
            Address:address,
            phone,
            facebookLink,
            instgrameLink,
            likes,
            vendorId: req.user.id
        });

        res.status(200).send({
            status: res.statusCode,
            data: service
        });

    } catch (err) {
        console.error("Unexpected error:", err);
        next(err);
    }
});

//update service
router.patch("/:id", upload.fields([
    { name: "image", maxCount: 1 }, // رفع صورة واحدة
    { name: "serviceimages", maxCount: 10 }, // رفع فيديو واحد
]), async (req, res, next) => {

    const role = req.user.role;
    if (role == "Vendor") {
        try {
            const { title, category, exprience, serviceDetails, address, phone, facebookLink, instgrameLink, likes } = req.body;
            const serviceId = req.params.id;
            const findservice = await Service.findById(serviceId)
            console.log(req.file)
            if (!findservice) {
                res.send("not found")
            }
            const service = await Service.findByIdAndUpdate(serviceId, {
                title: title || findservice.title,
                category: category || findservice.category,
                exprience: exprience || findservice.exprience,
                profileImage: req.files['image'][0].originalname || findservice.profileImage,
                serviceImage: req.files['serviceimages'] ? req.files['serviceimages'].map(file => file.originalname) : [] ||
                    findservice.serviceImage.map(file => file),
                serviceDetails: serviceDetails || findservice.serviceDetails,
                address: address || findservice.address,
                phone: phone || findservice.phone,
                facebookLink: facebookLink || findservice.facebookLink,
                instgrameLink: instgrameLink || findservice.instgrameLink,
                likes: likes || findservice.likes,
                vendorId: req.user._id

            }, { new: true })
            console.log(service)
            res.status(200).json({
                message: "service updated sucessfully",
                data: service
            });

        } catch (err) {
            if (req.file) {
                const newImagePath = path.join(__dirname, '..', 'images', req.file.filename);
                fs.unlink(newImagePath, () => { });
            }
            next(err);
        }
    }
    else {
        res.status(400).send({
            status: res.status,
            message: "not allow for you"
        })
    }
});
//delete service
router.delete("/:id", async (req, res, next) => {
    const role = req.user.role;
    console.log(role)
    const id = req.params.id;
    if (role == "Vendor") {
        try {
            const findservice = await Service.findByIdAndDelete({ "_id": id });
            if (!findservice) {
                return res.status(200).send({
                    status: res.status,
                    message: "this service not found"
                })
            }
            res.status(200).send({
                status: res.status,
                message: "service deleted sucessfully"
            })
        }
        catch (err) {
            next(err)
        }

    }
    else {
        res.status(400).send({
            status: res.status,
            message: "not allow for you"
        })
    }
});
//get service by vendorid
router.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const vendor= await User.findById({_id:id});
        if(!vendor)
        {
            return res.status(200).send({
                status: res.status,
                message: "this vendor does not exist"
            }) 
        }
        const vendorservices = await Service.find({ vendorId: id })
        if (!vendorservices) {
            return res.status(200).send({
                status: res.status,
                message: "this vendor does not have any services"
            })

        }
         return res.status(200).send({
                status: res.status,
               data: vendorservices
            })
    }
    catch (err) {
        next(err);
    }
});
//get service by category
router.get("/", async (req, res, next) => {
    try {
        const category = req.query.category;
        console.log(category)
        const servicesWithPackagesAndOrders = await Service.find({ category: category })
            .populate({
                path: 'packages', // populate الحقل "packages" في الـ Service
            });
        if (!servicesWithPackagesAndOrders) {
            return res.status(200).send({
                status: res.status,
                message: "this category doesnot exist"
            })
        }
        res.status(200).send({
            status: res.status,
            data: servicesWithPackagesAndOrders
        })
    }
    catch (err) {
        next(err);
    }
});
//getservicebyid
router.get("/packages/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const servicesWithPackagesAndOrders = await Service.find({ _id: id })
            .populate({
                path: 'packages', // populate الحقل "packages" في الـ Service
            });
        if (!servicesWithPackagesAndOrders) {
            return res.status(200).send({
                status: res.status,
                message: "this category doesnot exist"
            })
        }
        res.status(200).send({
            status: res.status,
            data: servicesWithPackagesAndOrders
        })
    }
    catch (err) {
        next(err);
    }
});

router.get("/service/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).send({
                status: 404,
                message: "Service not found"
            });
        }
        res.status(200).send({
            status: 200,
            data: service
        });
    } catch (err) {
        next(err);
    }
});
module.exports = router;