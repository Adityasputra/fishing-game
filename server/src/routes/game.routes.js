const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const gameController = require("../controllers/game.controller");

router.post("/fish", auth, gameController.fish);

module.exports = router;
