const express= require('express');
const router=express.Router();
const joi=require('joi');
const {register,login, getAllUsers, getUserById}=require('../controllers/userController');
router.use(express.json());
router.post('/register',register)
router.post('/login',login)
router.get('/',getAllUsers)
router.patch('/:id',getUserById)
module.exports=router;