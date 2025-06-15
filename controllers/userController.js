const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { makeAdminSchema } = require('../validition/uservalidition');
const makeAdmin = async (req, res, next) => {
  try {
    // Validate request body with makeAdminSchema
    const { error } = makeAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        message: error.details[0].message,
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        message: 'User not found.',
      });
    }

    // Check if user is already an admin
    if (user.role === 'admin') {
      return res.status(400).send({
        message: 'User is already an admin.',
      });
    }

    // Promote user to admin
    user.role = 'admin';
    await user.save();

    res.status(200).send({
      message: 'User promoted to admin successfully.',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error in makeAdmin:', err); // helpful for debugging
    next(err);
  }
};

const {
  registerSchema,
  forgetPasswordSchema,
} = require("../validition/uservalidition");
// register
const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: res.statusCode,
        message: error.details[0].message,
      });
    }
    const { username, email, password, role } = req.body;
    const existuser = await User.findOne({ email: email });
    if (existuser) {
      return res.status(400).send({
        status: res.statusCode,
        message: "this email already exist",
      });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    let user = await User.create({
      username,
      email,
      password: hashedpassword,
      role,
      paymentMethods: [{ name: "Cash", number: "" }],
    });
    res.status(200).send({
      message: "user register sucessfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
//login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).send({
        status: res.statusCode,
        message: "you have not account",
      });
    }
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(401).send({
        status: res.statusCode,
        message: "invalid credentials",
      });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, "mysecret");
    res.status(200).send({
      status: res.statusCode,
      message: "user logged in successfully",
      data: { ...user._doc, token: token },
    });
  } catch (err) {
    next(err);
  }
};
//get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length == 0) {
      return res.status(200).send({
        status: res.statusCode,
        message: "no users found",
      });
    }
    res.status(200).send({
      status: res.statusCode,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};
//get user by id
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { error } = forgetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(401).send({
        status: res.status,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const hashedpassword = await bcrypt.hash(password, 10);
    const userfind = await User.findOneAndUpdate(
      { _id: id },
      { password: hashedpassword },
      { new: true }
    );
    return res.status(200).send({
      status: res.status,
      message: "password reset successfuly",
      data: userfind,
    });
  } catch (err) {
    next(err);
  }
};
//get user by role
const getUserByRole = async (req, res, next) => {
  try {
    const role = req.query.role;
    console.log(role);
    const users = await User.find({ role: role });
    if (!users || users.length == 0) {
      return res.status(200).send({
        status: res.statusCode,
        message: "no users found",
      });
    }
    res.status(200).send({
      status: res.statusCode,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};
//delete user
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send({
        status: res.statusCode,
        message: "User not found",
      });
    }

    res.status(200).send({
      status: res.statusCode,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (err) {
    next(err);
  }
};
// user and orders
const getUserOrders = async (req, res, next) => {
  try {
    const user = await User.find().populate("orders");
    if (!user) {
      return res.status(404).send({
        status: res.statusCode,
        message: "User not found",
      });
    }
    res.status(200).send({
      status: res.statusCode,
      data: user,
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
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Transform the data to a simpler format if you want, e.g. ["2023-01", 10], etc
    const result = growth.map((item) => {
      const monthStr = item._id.month.toString().padStart(2, "0");
      return {
        month: `${item._id.year}-${monthStr}`,
        count: item.count,
      };
    });

    res.status(200).send({
      status: res.statusCode,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
// getRoleByUserId
const getRoleByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).send({
        status: res.statusCode,
        message: "User not found",
      });
    }

    res.status(200).send({
      status: res.statusCode,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};
const getUserByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Fetch user, select the fields you want (or remove .select() to get everything)
    const user = await User.findById(userId).select(
      "username email role paymentMethods"
    );

    if (!user) {
      return res.status(404).send({
        status: res.statusCode,
        message: "User not found",
      });
    }

    // Send full user data
    res.status(200).send({
      status: res.statusCode,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};


const updatePaymentMethods = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, number } = req.body; // Accept single payment method object

    if (!name || !number) {
      return res.status(400).json({
        message: "Missing name or number for payment method.",
      });
    }

    // Push new payment method to existing array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { paymentMethods: { name, number } } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Payment method added successfully.",
      data: updatedUser.paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};
const deletePaymentMethod = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, number } = req.body; // Receive name and number of the method to delete

    if (!name || !number) {
      return res.status(400).json({
        message: "Missing name or number for payment method.",
      });
    }

    // Pull the matching payment method
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { paymentMethods: { name, number } } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Payment method deleted successfully.",
      data: updatedUser.paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

// user.controller.js



const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password'); // exclude password field
    res.status(200).json({
      status: 200,
      data: admins,
      message: 'List of admins fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  getUserByRole,
  deleteUser,
  getUserGrowth,
  getUserOrders,
  getRoleByUserId,
  getUserByUserId,
  updatePaymentMethods,
  deletePaymentMethod,
  makeAdmin,
  getAdmins
};
