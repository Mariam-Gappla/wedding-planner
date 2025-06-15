const express = require("express");
const router = express.Router();
const joi = require("joi");
const {
  register,
  login,
  getAllUsers,
  getUserById,
  getUserByRole,
  deleteUser,
  getUserOrders,
  getUserGrowth,
  getRoleByUserId,
  getUserByUserId,
  updatePaymentMethods,
  deletePaymentMethod,
  makeAdmin,
  getAdmins
} = require("../controllers/userController");

router.use(express.json());
router.patch('/make-admin', makeAdmin);

router.post("/register", register);
router.post("/login", login);
router.get("/", getAllUsers);
router.get("/userorders", getUserOrders);
router.get("/role", getUserByRole);
router.get("/role/:userId", getRoleByUserId);
router.get('/admins', getAdmins);

router.get("/growth", getUserGrowth);
router.get("/:id", getUserByUserId);
router.patch("/:id", getUserById);
router.delete("/:id", deleteUser);
router.patch("/:id/payment-methods", updatePaymentMethods);
router.patch("/:id/delete-payment-method", deletePaymentMethod);

module.exports = router;
