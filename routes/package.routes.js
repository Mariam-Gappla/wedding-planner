const express=require("express");
const Package = require("../models/package");
router=express.Router();
const upload=require("../config/uploadimage");
//add package
router.post("/add",upload.single("image"),async(req,res,next)=>{
    const {title,price,description,features,serviceId}=req.body;
    try
    {
        const package=await Package.create({
            title: title,
            price: price,
            description: description,
            img:req.file.originalname,
            features: features,
            serviceId:serviceId,
        });
        res.status(200).send({
            status:res.status,
            message:"package added sucessfully",
            data:package
        });
    }
    catch(err)
    {
        next(err);
    }
})















module.exports=router;