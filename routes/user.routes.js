const express= require('express');
const router=express.Router();
const joi=require('joi');
const {register,login, getAllUsers, getUserById,getUserByRole,deleteUser, getUserGrowth}=require('../controllers/userController');
router.use(express.json());
router.post('/register',register);
router.post('/login',login);
router.get('/',getAllUsers);
router.patch('/:id',getUserById);
router.delete("/:id",deleteUser);
router.get('/role',getUserByRole);
router.get('/growth', getUserGrowth);

module.exports=router;