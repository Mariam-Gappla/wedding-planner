const express = require('express');
const router = express.Router();
const Service = require('../models/service');
const User = require('../models/user');
const upload = require('../config/uploadimage');
const path = require('path');
const fs = require('fs');
const { serviceSchema } = require('../validition/servicevalidation');

// ✅ Serve image files
router.use(express.static("uploads"));

// ✅ Get all services
router.get("/all", async (req, res, next) => {
  try {
    const allservices = await Service.find({});
    if (!allservices.length) {
      return res.status(200).send({ status: res.statusCode, message: "No services found" });
    }
    res.status(200).send({ status: res.statusCode, data: allservices });
  } catch (err) {
    next(err);
  }
});

// ✅ Add new service
router.post('/add', upload.fields([
  { name: "image", maxCount: 1 },
  { name: "serviceimages", maxCount: 10 },
]), async (req, res, next) => {
  if (!req.user || req.user.role !== "Vendor") {
    return res.status(403).send({ message: "Unauthorized" });
  }

  try {
    const dataToValidate = {
      ...req.body,
      profileImage: req.files?.image?.[0]?.originalname,
      serviceImage: req.files?.serviceimages?.map(f => f.originalname)
    };

    const { error } = serviceSchema.validate(dataToValidate);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const saveImage = (fileBuffer, filename) => {
      const fullPath = path.join(__dirname, '..', 'uploads', filename);
      fs.writeFileSync(fullPath, fileBuffer);
      return "uploads/" + filename;
    };

    const profileImageFile = req.files?.image?.[0];
    const serviceImageFiles = req.files?.serviceimages || [];

    const profileImagePath = profileImageFile ? saveImage(profileImageFile.buffer, Date.now() + '-' + profileImageFile.originalname) : "";
    const serviceImagePaths = serviceImageFiles.map(file => saveImage(file.buffer, Date.now() + '-' + file.originalname));

    const {
      title, category, exprience, serviceDetails,
      address, phone, facebookLink, instgrameLink, likes
    } = req.body;

    const service = await Service.create({
      title,
      category,
      exprience,
      serviceDetails,
      Address: address,
      phone,
      facebookLink,
      instgrameLink,
      likes,
      profileImage: profileImagePath,
      serviceImage: serviceImagePaths,
      vendorId: req.user.id
    });

    res.status(201).send({ message: "Service created", data: service });
  } catch (err) {
    next(err);
  }
});

// ✅ Get services with status 'Pending' and their packages
router.get("/servicespackages", async (req, res, next) => {
  try {
    const services = await Service.find({ status: "Pending" }).populate('packages');
    res.status(200).send({ data: services });
  } catch (err) {
    next(err);
  }
});


// ✅ Sort services by price
router.get("/sort", async (req, res, next) => {
  const sortOrder = req.query.sortBy === 'asc' ? 1 : -1;
  try {
    const services = await Service.aggregate([
      {
        $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: 'serviceId',
          as: 'packages'
        }
      },
      {
        $addFields: {
          minPackagePrice: { $min: '$packages.price' }
        }
      },
      {
        $sort: { minPackagePrice: sortOrder }
      }
    ]);
    res.status(200).send({ data: services });
  } catch (err) {
    next(err);
  }
});

// ✅ Sort services by likes
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
    res.status(200).send({ data: services });
  } catch (err) {
    next(err);
  }
});

// ✅ Sort by newest
router.get("/sortnewest", async (req, res, next) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    res.status(200).send({ data: services });
  } catch (err) {
    next(err);
  }
});

// ✅ Get service by ID with packages
router.get("/packages/:id", async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('packages');
    if (!service) {
      return res.status(404).send({ message: "Service not found" });
    }
    res.status(200).send({ data: service });
  } catch (err) {
    next(err);
  }
});

// ✅ Get services by category (⚠️ must be before `/:id`)
router.get("/", async (req, res, next) => {
  try {
    const category = req.query.category;
    const services = await Service.find({ category, status: "Accepted" }).populate('packages');
    res.status(200).send({ data: services });
  } catch (err) {
    next(err);
  }
});

// ✅ Get services by vendorId
router.get("/:id", async (req, res, next) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) {
      return res.status(404).send({ message: "Vendor not found" });
    }
    const vendorServices = await Service.find({ vendorId: req.params.id });
    res.status(200).send({ data: vendorServices });
  } catch (err) {
    next(err);
  }
});

// ✅ Delete service by ID
router.delete("/:id", async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "Vendor") {
      return res.status(403).send({ message: "Unauthorized" });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).send({ message: "Service not found" });
    }

    // Delete profile image
    if (service.profileImage) {
      const profilePath = path.join(__dirname, '..', service.profileImage);
      if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
    }

    // Delete service images
    for (const img of service.serviceImage) {
      const imgPath = path.join(__dirname, '..', img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Delete from DB
    await Service.findByIdAndDelete(req.params.id);

    res.status(200).send({ message: "Service deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ✅ Update service status by ID
router.patch("/status/:id", async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({ message: "Status is required" });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!service) {
      return res.status(404).send({ message: "Service not found" });
    }

    res.status(200).send({ message: "Status updated", data: service });
  } catch (err) {
    next(err);
  }
});

// ✅ Update service by ID
router.patch("/:id", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "serviceimages", maxCount: 10 },
]), async (req, res, next) => {
  if (!req.user || req.user.role !== "Vendor") {
    return res.status(403).send({ message: "Unauthorized" });
  }

  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).send({ message: "Service not found" });
    }

    const saveImage = (fileBuffer, filename) => {
      const fullPath = path.join(__dirname, '..', 'uploads', filename);
      fs.writeFileSync(fullPath, fileBuffer);
      return "uploads/" + filename;
    };

    // ⬇️ Get profile image (new)
    let profileImagePath = service.profileImage;
    if (req.files?.image?.[0]) {
      // Remove old image
      if (service.profileImage) {
        const oldPath = path.join(__dirname, '..', service.profileImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const image = req.files.image[0];
      profileImagePath = saveImage(image.buffer, Date.now() + '-' + image.originalname);
    }

    // ⬇️ Handle service images (new + old)
    const existingImages = JSON.parse(req.body.existingImages || '[]');
    const newServiceImages = req.files?.serviceimages?.map(file =>
      saveImage(file.buffer, Date.now() + '-' + file.originalname)
    ) || [];

    // Delete removed old images
    const removedImages = service.serviceImage.filter(img => !existingImages.includes(img));
    for (const img of removedImages) {
      const imgPath = path.join(__dirname, '..', img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    const finalServiceImages = [...existingImages, ...newServiceImages];

    const {
      title, category, exprience, serviceDetails,
      address, phone, facebookLink, instgrameLink
    } = req.body;

    service.title = title;
    service.category = category;
    service.exprience = exprience;
    service.serviceDetails = serviceDetails;
    service.Address = address;
    service.phone = phone;
    service.facebookLink = facebookLink;
    service.instgrameLink = instgrameLink;
    service.profileImage = profileImagePath;
    service.serviceImage = finalServiceImages;

    await service.save();

    res.status(200).send({ message: "Service updated successfully", data: service });

  } catch (err) {
    next(err);
  }
});

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
