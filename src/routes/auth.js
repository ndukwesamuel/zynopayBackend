const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  sendOTP,
  verifyOTP,
  getAllUsers,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const methodNotAllowed = require("../utils/methodNotAllowed");
const { auth } = require("../middlewares/auth");

router.route("/register").post(registerUser).all(methodNotAllowed);
router.route("/login").post(loginUser).all(methodNotAllowed);
router
  .route("/user")
  .get(auth, getUser)
  .patch(auth, updateUser)
  .all(methodNotAllowed);
router.route("/users").get(getAllUsers).all(methodNotAllowed);

router.route("/send-otp").post(sendOTP).all(methodNotAllowed);
router.route("/verify-otp").post(verifyOTP).all(methodNotAllowed);
router.route("/forgot-password").post(forgotPassword).all(methodNotAllowed);
router.route("/reset-password").post(resetPassword).all(methodNotAllowed);

module.exports = router;
