const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/guest", auth.guestLogin);
router.post("/register", auth.register);
router.post("/verify-otp", auth.verifyOtp);
router.post("/resend-otp", auth.resendOtp);
router.post("/login", auth.login);
router.post("/convert-guest", authMiddleware, auth.convertGuestToUser);

module.exports = router;
