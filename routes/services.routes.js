const express = require('express');
const router=express.Router()
const Service = require('../models/service');
const upload = require('../config/uploadimage');
router.use(express.static("images"));
//add service
router.post('/add', upload.single('image'), async (req, res, next) => {
    try {
        const { title, description, category } = req.body;
        console.log(req.file.originalname)
        const service = await Service.create({
            title: title,
            description: description,
            img: req.file.originalname,
            category: category

        });
        res.status(200).send({
            status: res.status,
            data: service
        })

    }
    catch (err) {
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'images', req.file.filename);
            fs.unlink(filePath, (unlinkErr) => {});
        }
        next(err)
    }
});
//update service
router.patch("/:id",upload.single('image'),async(req,res,next)=>{
    try {
        const { title, description, category } = req.body;
        const serviceId = req.params.id;
        const findservice=await Service.findById(serviceId)
        console.log(req.file)
        if(!findservice)
        {
            res.send("not found")
        }
        const service = await Service.findByIdAndUpdate(serviceId,{
            title:title||findservice.title,
            description:description||findservice.description,
            img:req.file?.originalname||findservice.img,
            category:category|findservice.category

        },{ new: true })
        res.status(200).json({
          message:"service updated sucessfully",
          data: service
        });
    
      } catch (err) {
        if (req.file) {
          const newImagePath = path.join(__dirname, '..', 'images', req.file.filename);
          fs.unlink(newImagePath, () => {});
        }
        next(err);
      }
});
//delete service

module.exports = router;