const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { registerSchema, forgetPasswordSchema } = require('../validition/uservalidition');
// register
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
//login
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
//get all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
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
//get user by id
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
//get user by role
const getUserByRole = async (req, res, next) => {
    try {
        const role = req.query.role;
        console.log(role);
        const users = await User.find({ role: role });
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
//delete user
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send({
        status: res.statusCode,
        message: "User not found"
      });
    }

    res.status(200).send({
      status: res.statusCode,
      message: "User deleted successfully",
      data: deletedUser
    });
  } catch (err) {
    next(err);
  }
};

const getUserGrowth = async (req, res, next) => {
  try {
    // Aggregation pipeline to group users by month and count them
    const growth = await User.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // Transform the data to a simpler format if you want, e.g. ["2023-01", 10], etc
    const result = growth.map(item => {
      const monthStr = item._id.month.toString().padStart(2, '0');
      return {
        month: `${item._id.year}-${monthStr}`,
        count: item.count
      }
    });

    res.status(200).send({
      status: res.statusCode,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getAllUsers, getUserById,getUserByRole,deleteUser,getUserGrowth };