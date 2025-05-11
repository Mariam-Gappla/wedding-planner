const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { registerSchema, forgetPasswordSchema } = require('../validition/uservalidition');
const register = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).send({
                status: res.statusCode,
                message: error.details[0].message
            })
        }
        const { username, email, password, role } = req.body;
        const existuser = await User.findOne({ email: email });
        if (existuser) {
            return res.status(400).send({
                status: res.statusCode,
                message: "this email already exist"
            })
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        let user = await User.create({
            username,
            email,
            password: hashedpassword,
            role
        });
         res.status(200).send({
            message:"user register sucessfully",
            data:user
         })

    }
    catch (err) {
        next(err)
    }


}

const login = async (req, res, next) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({email:email});
        if (!user) {
            return res.status(401).send({
                status: res.statusCode,
                message: "you have account"
            })
        }
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            return res.status(401).send({
                status: res.statusCode,
                message: "invalid credentials"
            });
        }
        const token=jwt.sign({id:user._id,role:user.role},"mysecret");
        res.status(200).send({
            status: res.statusCode,
            message: "user logged in successfully",
            data: {...user._doc,token:token}
        })
    }
    catch (err) {
        next(err);
    }
}
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({});
        if (!users || users.length == 0) {
            return res.status(200).send({
                status: res.statusCode,
                message: "no users found"
            })
        }
        res.status(200).send({
            status: res.statusCode,
            data: users
        })
    }
    catch (err) {
        next(err);
    }
}
const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { error } = forgetPasswordSchema.validate(req.body);
        if (error) {
            return res.status(401).send({
                status: res.status,
                message: error.details[0].message
            })
        }
        const { email, password } = req.body;
        const hashedpassword = await bcrypt.hash(password, 10);
        const userfind = await User.findOneAndUpdate(
            { _id: id },
            { password: hashedpassword },
            { new: true });
        return res.status(200).send({
            status: res.status,
            message: "password reset successfuly",
            data: userfind
        })
    }
    catch (err) {
        next(err)
    }
}
module.exports = { register, login, getAllUsers, getUserById }