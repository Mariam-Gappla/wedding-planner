const express = require("express");
const Package = require("../models/package");
const Service = require("../models/service");
const router = express.Router();
const upload = require("../config/uploadimage");
const User = require("../models/user");
const { packagevalidation } = require("../validition/packagevalidation");

router.get('/lowest-by-category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    // Step 1: Aggregate packages to find average price per service
    const result = await Package.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $match: {
          'service.category': category
        }
      },
      {
        $group: {
          _id: '$serviceId',
          avgPrice: { $avg: '$price' },
          serviceInfo: { $first: '$service' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      },
      {
        $limit: 1
      }
    ]);

    if (result.length === 0) {
  return res.json([]);
}


    const lowestService = result[0].serviceInfo;

    // Step 2: Get all packages for that service
const packages = await Package.find({ serviceId: lowestService._id });

if (packages.length === 0) {
  return res.status(404).json({ message: 'No packages found for this service.' });
}

// Calculate the minimum price among all packages
const minPrice = Math.min(...packages.map(pkg => pkg.price));

res.status(200).json({
  service: lowestService,
  packages,
  minPrice // 👈 added here
});

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
    

// Add Package
router.post("/add/:id", async (req, res, next) => {
    // التحقق من البيانات باستخدام Joi أولاً
    // استرجاع المعاملات
    const serviceid = req.params.id;
    const role = req.user.role;
    const VendorId = req.user.id;
    const { error } = packagevalidation.validate(req.body);
    if (error) {
        console.log(error.details[0].message);
        return res.status(400).send({
            message: error.details
        })
    }



    // العثور على الخدمة باستخدام Mongoose
    const service = await Service.find({ vendorId: VendorId, _id: serviceid });
    if (!service) {
    return res.status(200).send({
        status: 200,
        message: "No service found for this vendor",
        data: []
    });
}


    // إذا كان الدور هو "Vendor"
    if (role === "Vendor") {
        try {
            
            for (const item of req.body) {
                await Package.create({
                    title: item.title,
                    price: item.price,
                    serviceId: serviceid,
                    vendorId: VendorId
                });
            }
            res.status(200).send({
                status: res.status,
                message: "Package added successfully",
            });
        } catch (err) {
            next(err);  // التعامل مع أي خطأ يحدث أثناء إضافة الحزمة إلى قاعدة البيانات
        }
    } else {
        res.status(400).send({
            status: res.status,
            message: "Not allowed for you"
        });
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
