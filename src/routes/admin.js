const express = require("express");
const router = express.Router();
const methodNotAllowed = require("../utils/methodNotAllowed");
const { auth, isAdmin } = require("../middlewares/auth");
const { getAllUsers } = require("../controllers/admin");

router.route("/").get(getAllUsers).all(methodNotAllowed);

module.exports = router;
