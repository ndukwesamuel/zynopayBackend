const User = require("../models/user");
const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const sendEmail = require("../utils/sendEmail");
const OTP = require("../models/otp");
const generateOTP = require("../utils/generateOTP");
const generateEmail = require("../utils/generateEmail");
const userService = require("../services/userService");
const uploadService = require("../services/uploadService");

const registerUser = async (req, res, next) => {
  //grab email, password from req.body
  const { email, password, firstName, lastName, phoneNumber } = req.body;
  if (!email || !password || !firstName || !lastName || !phoneNumber) {
    return next(customError(400, "Please provide all fields"));
  }

  try {
    // create new user on the DB
    const user = await User.create({ ...req.body });
    const userProfile = await UserProfile.create({ userId: user._id });

    // generate new token
    // const token = userProfile.createJWT();

    //generating OTP
    const otp = generateOTP();

    // Sending OTP
    const subject = "OTP Request";
    const intro =
      "You received this email because you registered on Duduconnect";

    const { emailBody, emailText } = generateEmail(intro, user.firstName, otp);

    const info = await sendEmail({
      to: email,
      subject,
      text: emailText,
      html: emailBody,
    });

    const result = await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${info.envelope.to}`,
    });
  } catch (error) {
    return next(error);
  }
};

//Login User
const loginUser = async (req, res, next) => {
  // grab email and password from req.body
  const { email, password } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }
  if (!password) {
    return next(customError(400, "Please provide a password"));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const isPasswordCorrect = await user.comparePassword(password.toLowerCase());

  console.log(user);

  if (!isPasswordCorrect) {
    return next(customError(401, "Unauthorized"));
  }

  const userProfile = await UserProfile.findOne({ userId: user._id });

  // Checks if user email has been verified
  if (!userProfile.isVerified) {
    return res.status(401).json({ message: "Email not verified!" });
  }

  //generate new token
  const token = userProfile.createJWT();

  res
    .status(200)
    .json({ id: userProfile._id, token, image: userProfile.image });
};

//GET USER
const getUser = async (req, res) => {
  const { userId } = req.user;

  try {
    // Retrieve user profile with populated user information excluding certain fields
    const userProfile = await UserProfile.findOne({ _id: userId }).populate({
      path: "userId",
      model: "User",
      select: "-password -phoneNumber -role",
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json({
      userProfile,
      // Include other fields from userProfile as needed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  const users = await UserProfile.find(
    {},
    { __v: 0, createdAt: 0, updatedAt: 0, isVerified: 0, userId: 0 }
  );
  res.status(200).json({ users });
};

//UPDATE USER
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { password, ...userDetails } = req.body;

    // await userService.validatePassword(userId, password);

    const updatedProfileInfo = {};

    const profileFields = [
      "location",
      "height",
      "about",
      "profession",
      "interest",
      "birthday",
      "gender",
      "jobTitle",
    ];

    profileFields.forEach((field) => {
      if (field === "interest" && Array.isArray(updatedProfileInfo[field])) {
        updatedProfileInfo["$addToSet"] = {
          [field]: { ["$each"]: userDetails[field] },
        };
      } else {
        updatedProfileInfo[field] = userDetails[field];
      }
    });

    // if (req.files && req.files.image) {
    //   updatedProfileInfo.image = await uploadService.uploadUserImage(
    //     req.files.image.tempFilePath
    //   );
    // }

    // if (req.files && req.files.photos) {
    //   updatedProfileInfo.photos = await uploadService.uploadUserPhotos(
    //     Object.values(req.files.photos)
    //   );
    // }

    // const updatedUserInfo = {
    //   firstName: userDetails.firstName,
    //   lastName: userDetails.lastName,
    //   email: userDetails.email,
    //   phoneNumber: userDetails.phoneNumber,
    // };

    // let data2 = await userService.updateUserProfile(userId, updatedProfileInfo);
    // await userService.updateUserModel(userId, updatedUserInfo);
    let oldguy = userDetails.interest;

    const profileFieldsArray = userDetails.interest
      .split(",")
      .map((field) => field.trim());

    return res.status(200).json({
      message: "Details Updated Successfully!",
      profileFields: userDetails.interest,
      profileFieldsArray,
    });
  } catch (error) {
    next(error);
  }
};

const sendOTP = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otp = generateOTP();

  const subject = "Here is your OTP";
  const text = `Please use this otp to verify your account. OTP: ${otp}`;
  const intro =
    "You received this email because you requested for an OTP on Duduconnect";

  const { emailBody, emailText } = generateEmail(intro, user.firstName, otp);

  try {
    const info = await sendEmail({
      to: email,
      subject,
      text,
      text: emailText,
      html: emailBody,
    });
    const result = await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${info.envelope.to}`,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    return res.status(400).json({ message: "Invalid or Expired OTP" });
  }

  const userProfile = await UserProfile.findOneAndUpdate(
    { userId: user._id },
    { isVerified: true }
  );

  try {
    res.status(200).json({ message: "Profile Verified" });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otp = generateOTP();

  const subject = "Here is your OTP";
  const text = `Please use this otp to reset your password. OTP: ${otp}`;

  try {
    const info = await sendEmail({ to: email, subject, text });
    const result = await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${info.envelope.to}`,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(400, "No User with this Email"));
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    return next(customError(400, "Invalid or Expired OTP"));
  }

  try {
    user.password = password;
    await user.save();
    await OTP.findOneAndDelete({ email, otp });
    res.status(200).json({ message: "Password Updated!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  sendOTP,
  verifyOTP,
  getAllUsers,
  forgotPassword,
  resetPassword,
};
