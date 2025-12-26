const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.post("/guest", auth.guestLogin);
router.post("/register", auth.register);
router.post("/verify-otp", auth.verifyOtp);
router.post("/login", auth.login);

module.exports = router;
