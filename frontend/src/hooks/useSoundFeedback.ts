let globalAudioCtx: AudioContext | null = null;
let globalSoundEnabled = true;
let globalVolume = 0.5;

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('soundEnabled');
  if (stored !== null) globalSoundEnabled = stored !== 'false';
  const storedVol = localStorage.getItem('volume');
  if (storedVol !== null) globalVolume = parseFloat(storedVol);
}

export function setSoundConfig(enabled: boolean, volume: number) {
  globalSoundEnabled = enabled;
  globalVolume = volume;
}

function getAudioContext(): AudioContext {
  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    globalAudioCtx = new AudioContext();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

function playTone(frequency: number, duration: number) {
  if (!globalSoundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(globalVolume * 0.8, ctx.currentTime);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}

export function testSound() {
  playTone(440, 0.3);
}

export function checkPosture(postureScore: number) {
  if (postureScore < 70) {
    playTone(440, 0.4);
  }
}

export function checkBlinkRate(blinkRate: number) {
  if (blinkRate > 0 && blinkRate < 10) {
    playTone(523, 0.3);
  }
}

export function checkOverallScore(grade: string) {
  if (grade === 'D' || grade === 'F') {
    playTone(659, 0.35);
  }
}
