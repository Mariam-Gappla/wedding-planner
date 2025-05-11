const express = require('express');
const router = express.Router()
const Service = require('../models/service');
const upload = require('../config/uploadimage');
const path = require('path');
const fs = require('fs');
router.use(express.static("images"));
//add service
router.post('/add', upload.fields([
    { name: "image", maxCount: 1 }, // رفع صورة واحدة
    { name: "serviceimages", maxCount: 10 }, // رفع فيديو واحد
]), async (req, res, next) => {
    const role = req.user.role;
    if (role == "Vendor") {
        try {
            const { title, category, exprience, serviceDetails, address, phone, facebookLink, instgrameLink } = req.body;
            const service = await Service.create({
                title: title,
                category: category,
                exprience: exprience,
                profileImage: req.files['image'][0].originalname,
                serviceImage: req.files['serviceimages'] ? req.files['serviceimages'].map(file => file.originalname) : [],
                serviceDetails: serviceDetails,
                address: address,
                phone: phone,
                facebookLink: facebookLink,
                instgrameLink: instgrameLink,
                vendorId:req.user.id
            });
            res.status(200).send({
                status: res.status,
                data: service
            })

        }
        catch (err) {
            if (req.file) {
                const filePath = path.join(__dirname, '..', 'images', req.file.filename);
                fs.unlink(filePath, (unlinkErr) => { });
            }
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
//update service
router.patch("/:id", upload.fields([
    { name: "image", maxCount: 1 }, // رفع صورة واحدة
    { name: "serviceimages", maxCount: 10 }, // رفع فيديو واحد
]), async (req, res, next) => {

    const role = req.user.role;
    if (role == "Vendor") {
        try {
            const { title, category, exprience, serviceDetails, address, phone, facebookLink, instgrameLink } = req.body;
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
                vendorId:req.user._id

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
router.delete("/:id", (req, res, next) => {
    const role = req.user.role;
    console.log(role)
    const id = req.params.id;
    if (role == "Vendor") {
        try {
              const findservice=Service.findByIdAndDelete({"_id":id});
              if(!findservice)
              {
                return res.status(400).send({
                    status:res.status,
                    message:"not allow for you"
                });
              }
              res.status(200).send({
                status:res.status,
                message:"service deleted sucessfully"
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
})

module.exports = router;