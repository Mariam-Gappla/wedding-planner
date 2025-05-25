const express = require('express');
const router = express.Router()
const Service = require('../models/service');
const User = require('../models/user');
const upload = require('../config/uploadimage');
const Order = require("../models/order")
const path = require('path');
const fs = require('fs');
router.use(express.static("images"));
const { serviceSchema } = require('../validition/servicevalidation');
//get all services
router.get("/all", async (req, res, next) => {
    try {
        console.log("allservices");
        const allservices = await Service.find({});
        if (!allservices) {
            return res.status(200).send({
                status: res.status,
                message: "there is no services"
            })
        }
        res.status(200).send({
            status: res.status,
            data: allservices
        })

    }
    catch (err) {
        next(err);
    }
})
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
            Address: address,
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
//get all services with packages
router.get("/servicespackages", async (req, res, next) => {
    try {
        const servicesWithPackages = await Service.find({})
            .populate({
                path: 'packages', // populate الحقل "packages" في الـ Service
            });
        if (!servicesWithPackages) {
            return res.status(200).send({
                status: res.status,
                message: "there is no services"
            })
        }
        res.status(200).send({
            status: res.status,
            data: servicesWithPackages
        })
    } catch (err) {
        next(err);
    }
});
//sort services by max and min price
router.get("/sort", async (req, res, next) => {
        console.log("sort");
        const sortBy = req.query.sortBy; // 'asc' or 'desc'
        const sortOrder = sortBy === 'asc' ? 1 : -1; // 1 for ascending, -1 for descending

        if (!sortBy) {
            return res.status(400).send({
                status: res.status,
                message: "Invalid sort parameter. Use 'asc' or 'desc'."
            });
        }
        try {
            if (sortOrder == 1) {
                const services = await Service.aggregate([
                    {
                        $lookup: {
                            from: 'packages',              // اسم مجموعة الباكدجات
                            localField: '_id',             // يربط _id من service
                            foreignField: 'serviceId',     // مع serviceId في package
                            as: 'packages'
                        }
                    },
                    {
                        $addFields: {
                            minPackagePrice: { $min: '$packages.price' }  // أقل سعر باكدج
                        }
                    },
                    {
                        $sort: { minPackagePrice: 1 }  // ترتيب تنازلي
                    }
                ]);
                res.status(200).send({
                    status: res.status,
                    data: services
                })
            }
            else {
                const services = await Service.aggregate([
                    {
                        $lookup: {
                            from: 'packages',              // اسم مجموعة الباكدجات
                            localField: '_id',             // يربط _id من service
                            foreignField: 'serviceId',     // مع serviceId في package
                            as: 'packages'
                        }
                    },
                    {
                        $addFields: {
                            minPackagePrice: { $min: '$packages.price' }  // أقل سعر باكدج
                        }
                    },
                    {
                        $sort: { minPackagePrice: -1 }  // ترتيب تصاعدي
                    }
                ]);
                res.status(200).send({
                    status: res.status,
                    data: services
                })
            }


        }
    
        catch (err) {
            next(err);
        }
    });
 // sort services by likes
router.get("/sortlikes", async (req, res, next) => {
  try {
    const services = await Service.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } }
        }
      },
      { $sort: { likesCount: -1 } }
    ]);

    if (!services || services.length === 0) {
      return res.status(200).send({
        status: res.statusCode,
        message: "No services found"
      });
    }

    res.status(200).send({
      status: res.statusCode,
      data: services
    });
  } catch (err) {
    next(err);
  }
});

// sort services by newest
router.get("/sortnewest", async (req, res, next) => {
    try {
        const services = await Service.find({}).sort({ createdAt: -1 });
        if (!services || services.length === 0) {
            return res.status(200).send({
                status: res.status,
                message: "No services found"
            });
        }
        res.status(200).send({
            status: res.status,
            data: services
        });
    } catch (err) {
        next(err);
    }
});
//update service
router.patch("/:id", upload.fields([
    { name: "image", maxCount: 1 },
    { name: "serviceimages", maxCount: 10 },
]), async (req, res, next) => {
    try {
        const serviceId = req.params.id;
        const findService = await Service.findById(serviceId);
        if (!findService) return res.status(404).send({ message: "Service not found" });

        const keepImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        const imagesToDelete = findService.serviceImage.filter(img => !keepImages.includes(img));
        for (const img of imagesToDelete) {
            const imageName = img.replace(/^images[\\/]/, ''); // إزالة المجلد من البداية
            const filePath = path.join(__dirname, '..', 'images', imageName);
            fs.unlink(filePath, err => {
                if (err) console.error(`Error deleting file ${img}:`, err);
            });
        }

        const saveImage = (fileBuffer, filename) => {
            const fullPath = path.join(__dirname, '..', 'images', filename);
            fs.writeFileSync(fullPath, fileBuffer);
            return 'images/' + filename;
        };

        const profileImageFile = req.files?.image?.[0];
        const serviceImageFiles = req.files?.serviceimages || [];

        let newProfileImage = findService.profileImage;
        if (profileImageFile) {
            if (findService.profileImage) {
                const oldProfilePath = path.join(__dirname, '..', findService.profileImage);
                fs.unlink(oldProfilePath, (err) => {
                    if (err) console.error(`Error deleting old profile image:`, err);
                });
            }
            newProfileImage = saveImage(profileImageFile.buffer, Date.now() + '-' + profileImageFile.originalname);
        }

        const newServiceImages = serviceImageFiles.map(file =>
            saveImage(file.buffer, Date.now() + '-' + file.originalname)
        );

        const updatedService = await Service.findByIdAndUpdate(serviceId, {
            title: req.body.title || findService.title,
            category: req.body.category || findService.category,
            exprience: req.body.exprience || findService.exprience,
            serviceDetails: req.body.serviceDetails || findService.serviceDetails,
            address: req.body.address || findService.Address,
            phone: req.body.phone || findService.phone,
            facebookLink: req.body.facebookLink || findService.facebookLink,
            instgrameLink: req.body.instgrameLink || findService.instgrameLink,
            likes: req.body.likes || findService.likes,
            status: req.body.status || findService.status,
            vendorId: req.user._id,
            profileImage: newProfileImage,
            serviceImage: [...keepImages, ...newServiceImages],  // خزن الصور المحتفظ بها + الجديدة
        }, { new: true });

        res.status(200).json({
            message: "Service updated successfully",
            data: updatedService
        });

    } catch (err) {
        next(err);
    }
});
//delete service
router.delete("/:id", async (req, res, next) => {
    const role = req.user.role;
    console.log(role)
    const id = req.params.id;
    if (role == "Vendor") {
        try {
            const findservice = await Service.findById(id);

            if (!findservice) {
                return res.status(404).send({
                    message: "This service not found"
                });
            }

            //  حذف صورة البروفايل من السيرفر
            if (findservice.profileImage) {
                const imageName = findservice.profileImage.replace(/^images[\\/]/, '');
                const profileImagePath = path.join(__dirname, '..', 'images', imageName);
                fs.unlink(profileImagePath, (err) => {
                    if (err) console.error("Error deleting profile image:", err);
                });
            }
            //  حذف كل صور الخدمة من السيرفر
            for (const img of findservice.serviceImage) {
                const imageName = img.replace(/^images[\\/]/, ''); // إزالة المجلد من البداي
                const imagePath = path.join(__dirname, '..', 'images', imageName);
                fs.unlink(imagePath, (err) => {
                    if (err) console.error(`Error deleting service image ${img}:`, err);
                });
            }
            // 🧾 حذف الخدمة من قاعدة البيانات
            await Service.findByIdAndDelete(id);

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
        const vendor = await User.findById({ _id: id });
        if (!vendor) {
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
// add like to service
// PATCH /services/:id/like
router.patch("/like/:id", async (req, res, next) => {
  try {
    const serviceId = req.params.id;
    const userId = req.body.userId;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const alreadyLiked = service.likes.includes(userId);

    if (alreadyLiked) {
      // شيل اللايك
      service.likes = service.likes.filter(id => id.toString() !== userId);
    } else {
      // ضيف اللايك
      service.likes.push(userId);
    }

    await service.save();

    res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Liked successfully",
      totalLikes: service.likes.length,
    });
  } catch (err) {
    next(err);
  }
});












module.exports = router;