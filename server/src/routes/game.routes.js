const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const game = require("../controllers/game.controller");

router.post("/fish", auth, game.fish);
router.post("/upgrade", auth, game.upgradeRod);

module.exports = router;
