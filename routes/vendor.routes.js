const express= require('express');
const Vendor = require('../models/vendor');
const router=express.Router();
router.use(express.json());
router.post('/add',async(req,res,next)=>{
    try{
        const vendor=await Vendor.create(req.body);
        res.status(200).send({
           status:res.status,
           message:"Vendor created successfully",
           data:vendor,
        })
    }
    catch(err)
    {
        next(err)
    }
});
router.get('/',async(req,res,next)=>{
    try
    {
        const vendors=await Vendor.find({})
        res.status(200).send({
            status:res.status,
            data:vendors,
         })
    }
    catch(err)
    {
        next(err)
    }
});
router.get('/:id',async(req,res,next)=>{
    try
    {
        const id=req.params.id;
        const vendors=await Vendor.find({"_id":id})
        res.status(200).send({
            status:res.status,
            data:vendors,
         })
    }
    catch(err)
    {
        next(err)
    }
});

module.exports=router;