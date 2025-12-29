import { Howl } from "howler";

/**
 * Ocean Ambient Sound
 * - Loop: true
 * - Volume: 0.3 (subtle background)
 * - Autoplay: false (will be played after user interaction)
 */
export const oceanSound = new Howl({
  src: ["/audio/mixkit-small-waves-harbor-rocks-1208.mp3"],
  loop: true,
  volume: 0.3,
  preload: true,
});

/**
 * Background Music - Fishing Vibe
 * - Loop: true
 * - Volume: 0.15 (very low, non-intrusive)
 * - Autoplay: false (will be played after user interaction)
 */
export const bgmSound = new Howl({
  src: ["/audio/WaestoOceanVibes.mp3"],
  loop: true,
  volume: 0.15,
  preload: true,
});

/**
 * Cast Fishing Sound
 * - Loop: false
 * - Volume: 0.5
 * - Plays once when fishing cast is initiated
 */
export const castSound = new Howl({
  src: ["/audio/cast.mp3"],
  loop: false,
  volume: 0.5,
  preload: true,
});

/**
 * Reel/Pull Sound
 * - Loop: true (while holding button)
 * - Volume: 0.4
 * - Plays during hold button press
 */
export const reelSound = new Howl({
  src: ["/audio/reel.mp3"],
  loop: true,
  volume: 0.4,
  preload: true,
});

/**
 * Success/Rare Fish Sound
 * - Loop: false
 * - Volume: 0.6
 * - Plays when successfully catching a fish
 */
export const successSound = new Howl({
  src: ["/audio/mixkit-game-success-alert-2039.mp3"],
  loop: false,
  volume: 0.6,
  preload: true,
});

/**
 * Coin/Reward Sound
 * - Loop: false
 * - Volume: 0.5
 * - Plays when receiving gold/points reward
 */
export const coinSound = new Howl({
  src: ["/audio/mixkit-winning-a-coin-video-game-2069.mp3"],
  loop: false,
  volume: 0.5,
  preload: true,
});

/**
 * UI Button Click Sound
 * - Loop: false
 * - Volume: 0.3 (subtle)
 * - Plays on UI button interactions
 */
export const clickSound = new Howl({
  src: ["/audio/mixkit-game-click-1114.mp3"],
  loop: false,
  volume: 0.3,
  preload: true,
});
