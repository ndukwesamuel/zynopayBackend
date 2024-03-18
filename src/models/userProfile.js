const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/demmgc49v/image/upload/v1695969739/default-avatar_scnpps.jpg",
    },
  },
  {
    timestamps: true,
  }
);

UserProfileSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

module.exports = mongoose.model("UserProfile", UserProfileSchema);
