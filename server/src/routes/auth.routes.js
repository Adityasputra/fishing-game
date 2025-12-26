const router = require("express").Router();
const authController = require("../controllers/auth.controller");

router.post("/guest", authController.guestLogin);

module.exports = router;
