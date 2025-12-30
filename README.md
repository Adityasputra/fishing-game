# 🎣 Calm Waters - Fishing Game

A real-time multiplayer fishing game built with React and Node.js, featuring an engaging balance-based fishing mechanic, upgradeable equipment, and live leaderboards.

## ✨ Features

### 🎮 Gameplay
- **Interactive Fishing Mechanic**: Balance line tension by holding/releasing the mouse button
- **Stay in the Safe Zone**: Maintain tension between 40-70% for 3 seconds to catch fish
- **Skill-Based Rewards**: Better timing = better fish quality (Perfect/Good/Normal)
- **Progressive Difficulty**: Higher tension requires precise control
- **Advanced Timing Mechanics**: 
  - Maximum hold time limit (10 seconds) - release periodically to avoid losing the fish
  - Maximum release time limit (5 seconds) - maintain engagement to keep the fish hooked
  - Visual warnings when approaching time limits
- **Immersive Audio System**: 
  - Ambient ocean waves and background music
  - Sound effects for casting, reeling, success, and coin collection
  - Automatic audio management with browser autoplay compliance

### 🐟 Fish System
- **Three Rarity Tiers**: Normal, Rare, Epic
- **Dynamic Catch Rates**: Influenced by rod level and timing quality
- **Reward System**: Earn gold and points based on fish rarity
- **Rod Upgrades**: Improve catch rates with 5 progressive rod levels

### 👤 User System
- **Email Authentication**: Secure registration with OTP verification
- **Guest Mode**: Play instantly without registration
- **Guest Conversion**: Save progress by converting guest accounts to full accounts
- **Rate-Limited OTP**: 60-second cooldown, max 5 resends per hour

### 🏆 Leaderboard
- **Real-Time Updates**: Live leaderboard powered by Socket.io
- **Top 10 Anglers**: See the best players instantly
- **Points-Based Ranking**: Compete for the highest score

### 🎨 UI/UX
- **Coastal Theme**: Beautiful teal/cyan gradient design
- **Haptic Feedback**: Mobile vibration support for enhanced experience
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Progress bars, zone indicators, and animations
- **Rich Sound Design**: Ocean ambience, background music, and contextual sound effects
- **Instructions Modal**: In-game tutorial accessible anytime to help new players

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **React Router 7.11.0** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js & Express** - Server framework
- **Prisma 7.2.0** - ORM with PostgreSQL
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### Database
- **PostgreSQL** - Relational database
- **Prisma Migrations** - Schema management

## 📋 Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- npm or yarn package manager
- Email service credentials (for OTP verification)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fishing-game
```

### 2. Server Setup

```bash
cd server
npm install
```

Create `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fishing_game"

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# Server
PORT=5000
```

**Email Setup for Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the 16-character app password in `EMAIL_PASS`

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Client Setup

```bash
cd ../client
npm install
```

Create `.env` file in the `client` directory:

```env
# API endpoint (adjust if your server runs on different port)
VITE_API_URL=http://localhost:5000
```

### 5. Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

The game will be available at `http://localhost:5173`

## 🎮 Game Mechanics

### Fishing Process

1. **Click "Start Fishing"** - Begins the fishing minigame
2. **Hold/Release Mouse** - Control line tension
   - Holding increases tension (+2% per 100ms)
   - Releasing decreases tension (-1.5% per 100ms)
3. **Stay in Safe Zone** (40-70%) for 3 seconds to succeed
4. **Avoid Danger Zone** (90%+) or the fish escapes!
5. **Watch Time Limits**:
   - Can't hold continuously for more than 10 seconds (fish escapes)
   - Can't release for more than 5 seconds (fish escapes)
   - Visual warnings appear when approaching limits

### Quality Bonuses

| Quality | Time in Zone | Rare/Epic Multiplier |
|---------|-------------|---------------------|
| Perfect | 4+ seconds  | 1.5x (50% better odds) |
| Good    | 3.5+ seconds| 1.25x (25% better odds) |
| Normal  | 3 seconds   | 1.0x (base odds) |

### Rod Levels & Catch Rates

| Level | Normal | Rare | Epic | Upgrade Cost |
|-------|--------|------|------|-------------|
| 1     | 80%    | 2%   | 1%   | -           |
| 2     | 75%    | 4%   | 2%   | 10 gold     |
| 3     | 70%    | 6%   | 3%   | 25 gold     |
| 4     | 65%    | 8%   | 4%   | 50 gold     |
| 5     | 60%    | 10%  | 5%   | 100 gold    |

### Rewards

| Fish Rarity | Gold | Points |
|------------|------|--------|
| Normal     | 2    | 2      |
| Rare       | 5    | 5      |
| Epic       | 10   | 10     |

## 📁 Project Structure

```
fishing-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client configuration
│   │   ├── assets/        # Static assets
│   │   ├── auth/          # Authentication context & guards
│   │   ├── components/    # Reusable components
│   │   │   ├── HoldButton.jsx       # Fishing mechanic
│   │   │   ├── Leaderboard.jsx      # Live leaderboard
│   │   │   ├── UpgradeButton.jsx    # Rod upgrades
│   │   │   └── ConvertToUser.jsx    # Guest conversion
│   │   ├── pages/         # Route pages
│   │   │   ├── Game.jsx             # Main game page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   └── Guest.jsx
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                # Node.js backend
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/             # Migration history
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   │   ├── db.js               # Prisma client
│   │   │   ├── jwt.js              # JWT utilities
│   │   │   └── mailer.js           # Email setup
│   │   ├── controllers/   # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── game.controller.js
│   │   │   └── leaderboard.controller.js
│   │   ├── middlewares/   # Express middlewares
│   │   │   └── auth.middleware.js  # JWT verification
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # Socket.io handlers
│   │   │   ├── index.js            # Socket setup
│   │   │   ├── auth.socket.js
│   │   │   └── leaderboard.socket.js
│   │   ├── utils/         # Utility functions
│   │   │   ├── otp.js              # OTP generation
│   │   │   └── rng.js              # Fish RNG
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   └── package.json
│
└── README.md
```

## 🔐 Authentication Flow

### Registration
1. User enters username, email, and password
2. Server generates 6-digit OTP and sends via email
3. User verifies OTP within 5 minutes
4. Account activated, auto-login with JWT

### Guest Mode
1. Click "Play as Guest" for instant access
2. Play with temporary account
3. Progress saved (gold, points, rod level)
4. Convert to full account anytime to preserve progress

### OTP Security
- **Rate Limiting**: 60-second cooldown between resends
- **Max Attempts**: 5 resends per hour
- **Expiration**: OTP valid for 5 minutes
- **Auto-reset**: Counters reset after successful verification

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `POST /auth/guest` - Create guest account
- `POST /auth/verify-otp` - Verify email with OTP
- `POST /auth/resend-otp` - Request new OTP (rate-limited)
- `POST /auth/convert-guest` - Convert guest to full account

### Game
- `GET /game/profile` - Get user profile
- `POST /game/fish` - Attempt to catch fish
- `POST /game/upgrade` - Upgrade fishing rod

### Leaderboard
- `GET /leaderboard` - Get top 10 players

### WebSocket Events
- `leaderboard:update` - Real-time leaderboard updates

## 🎨 Customization

### Adjusting Game Difficulty

**Safe Zone Range** (`HoldButton.jsx`):
```javascript
const safeZoneStart = 40;  // Lower = easier
const safeZoneEnd = 70;    // Higher = easier
const dangerZone = 90;     // Higher = more forgiving
const timeNeeded = 3000;   // Time in ms to stay in zone
```

**Fish Catch Rates** (`server/src/utils/rng.js`):
```javascript
const rodChances = {
  1: { normal: 80, rare: 2, epic: 1 },
  // Adjust percentages per rod level
};
```

**Upgrade Costs** (`server/src/services/game.service.js`):
```javascript
const upgradeCost = {
  1: 10,   // Cost to upgrade from level 1 to 2
  2: 25,   // Cost to upgrade from level 2 to 3
  3: 50,   // Cost to upgrade from level 3 to 4
  4: 100   // Cost to upgrade from level 4 to 5
};
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string in .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Email Not Sending
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled on Google account
- Ensure less secure apps are not blocking
- Check spam folder for OTP emails

### Port Already in Use
```bash
# Change port in server/.env
PORT=5001

# Update client/.env to match
VITE_API_URL=http://localhost:5001
```

### Prisma Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate client after schema changes
npx prisma generate
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🎯 Future Enhancements

- [ ] Multiple fishing locations with different fish
- [ ] Daily challenges and achievements
- [ ] Friend system and private competitions
- [ ] Inventory system for caught fish
- [ ] Tournaments and seasonal events
- [ ] Mobile app versions (iOS/Android)
- [ ] Social sharing features
- [ ] More sound effects and music tracks
- [ ] Fish collection album/gallery
- [ ] Customizable fishing equipment skins

## 👨‍💻 Author

Created with ❤️ by Adityasputra

---

**Happy Fishing! 🎣**
