import { useEffect, useRef, useCallback } from "react";
import {
  oceanSound,
  bgmSound,
  castSound,
  reelSound,
  successSound,
  coinSound,
  clickSound,
} from "./sounds";

/**
 * Custom React Hook for Audio Management
 * 
 * Handles all game audio with proper cleanup and browser autoplay policy compliance.
 * Audio only plays after user interaction to prevent browser blocking.
 * 
 * @returns {Object} Audio control functions
 */
export function useAudio() {
  const hasInteracted = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Mark user interaction on first click/touch
    const markInteraction = () => {
      hasInteracted.current = true;
      document.removeEventListener("click", markInteraction);
      document.removeEventListener("touchstart", markInteraction);
    };

    document.addEventListener("click", markInteraction);
    document.addEventListener("touchstart", markInteraction);

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      document.removeEventListener("click", markInteraction);
      document.removeEventListener("touchstart", markInteraction);
      
      // Stop all sounds to prevent memory leaks
      oceanSound.stop();
      bgmSound.stop();
      reelSound.stop();
    };
  }, []);

  /**
   * Play Ocean Ambient Sound
   * Loops continuously in background
   */
  const playOcean = useCallback(() => {
    if (!hasInteracted.current) return;
    
    try {
      if (!oceanSound.playing()) {
        oceanSound.play();
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to play ocean sound:", error);
      }
    }
  }, []);

  /**
   * Stop Ocean Ambient Sound
   */
  const stopOcean = useCallback(() => {
    try {
      oceanSound.stop();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to stop ocean sound:", error);
      }
    }
  }, []);

  /**
   * Play Background Music
   * Loops continuously with low volume
   */
  const playBGM = useCallback(() => {
    if (!hasInteracted.current) return;
    
    try {
      if (!bgmSound.playing()) {
        bgmSound.play();
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to play BGM:", error);
      }
    }
  }, []);

  /**
   * Stop Background Music
   */
  const stopBGM = useCallback(() => {
    try {
      bgmSound.stop();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to stop BGM:", error);
      }
    }
  }, []);

  /**
   * Play Cast Fishing Sound
   * One-shot sound effect
   */
  const playCast = useCallback(() => {
    if (!hasInteracted.current) return;
    
    try {
      castSound.stop(); // Stop any previous instance
      castSound.play();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to play cast sound:", error);
      }
    }
  }, []);

  /**
   * Play Reel/Pull Sound
   * Loops while holding button
   */
  const playReel = useCallback(() => {
    if (!hasInteracted.current) return;
    
    try {
      if (!reelSound.playing()) {
        reelSound.play();
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to play reel sound:", error);
      }
    }
  }, []);

  /**
   * Stop Reel/Pull Sound
   */
  const stopReel = useCallback(() => {
    try {
      reelSound.stop();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to stop reel sound:", error);
      }
    }
  }, []);

  /**
   * Play Success/Rare Fish Sound
   * One-shot sound effect for successful catch
   */
  const playSuccess = useCallback(() => {
    if (!hasInteracted.current) return;
    
    try {
      successSound.stop(); // Stop any previous instance
      successSound.play();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to play success sound:", error);
      }
    }
  }, []);

  /**
   * Play Coin/Reward Sound
   * One-shot sound effect for receiving rewards
   */
  const playCoin = useCallback(() => {
    if (!hasInteracted.current) return;
    
    try {
      coinSound.stop(); // Stop any previous instance
      coinSound.play();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to play coin sound:", error);
      }
    }
  }, []);

  /**
   * Play UI Click Sound
   * One-shot sound effect for button interactions
   */
  const playClick = useCallback(() => {
    if (!hasInteracted.current) return;
    
    try {
      clickSound.stop(); // Stop any previous instance
      clickSound.play();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Failed to play click sound:", error);
      }
    }
  }, []);

  return {
    playOcean,
    stopOcean,
    playBGM,
    stopBGM,
    playCast,
    playReel,
    stopReel,
    playSuccess,
    playCoin,
    playClick,
  };
}
