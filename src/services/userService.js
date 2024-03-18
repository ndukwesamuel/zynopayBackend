const UserProfile = require("../models/userProfile");
const User = require("../models/user");
const customError = require("../utils/customError");

const updateUserProfile = async (userId, userDetails) => {
  try {
    // Updating userProfile model
    const userProfile = await UserProfile.findOneAndUpdate(
      { _id: userId },
      userDetails
    );
    return { message: "Details Updated Successfully!", userProfile };
  } catch (error) {
    throw error;
  }
};

const updateUserModel = async (userId, userInfo) => {
  try {
    // Updating user model
    await User.findOneAndUpdate({ _id: userId }, userInfo);
    return { message: "User Info Updated Successfully!" };
  } catch (error) {
    throw error;
  }
};

const validatePassword = async (userId, password) => {
  if (!password) {
    throw customError(401, "Please provide password");
  }
  const userProfile = await UserProfile.findOne({ _id: userId });
  if (!userProfile) {
    throw customError(404, "This User Doesn't Exist");
  }

  const user = await User.findOne({ _id: userProfile.userId });
  const isPasswordCorrect = await user.comparePassword(password.toLowerCase());

  if (!isPasswordCorrect) {
    throw customError(401, "Unauthorized");
  }
};

module.exports = {
  updateUserProfile,
  updateUserModel,
  validatePassword,
};
