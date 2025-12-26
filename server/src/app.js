const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const gameRoutes = require("./routes/game.routes");
// const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();

app.use(cors());
app.use(express.json());

// app.use("/auth", authRoutes);
// app.use("/game", gameRoutes);
// app.use("/leaderboard", leaderboardRoutes);

module.exports = app;
