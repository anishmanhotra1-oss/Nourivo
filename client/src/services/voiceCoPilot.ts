// Web Speech API Voice Stride Co-Pilot Service

class VoiceCoPilotService {
  private isMuted: boolean = false;
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public speak(message: string) {
    if (this.isMuted || !this.synth) return;

    // Cancel any previous queued speech for instant real-time telemetry
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use a clean English voice if available
    const voices = this.synth.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    this.synth.speak(utterance);
  }

  public announceSessionStart(activityType: string) {
    this.speak(`Voice Stride Co-Pilot active. Starting ${activityType} session. GPS telemetry locked.`);
  }

  public announceSessionPause() {
    this.speak('Workout session paused.');
  }

  public announceSessionResume() {
    this.speak('Workout session resumed.');
  }

  public announceSessionSummary(distanceKm: number, durationFormatted: string, paceMinKm: string) {
    this.speak(
      `Workout completed! Total distance: ${distanceKm} kilometers. Time elapsed: ${durationFormatted}. Average pace: ${paceMinKm} minutes per kilometer. Great effort!`
    );
  }

  public announcePeriodicTelemetry(distanceKm: number, paceMinKm: string, ghostLeadMeters?: number) {
    let message = `Distance: ${distanceKm} kilometers. Pace: ${paceMinKm} minutes per kilometer.`;
    if (ghostLeadMeters !== undefined) {
      if (ghostLeadMeters >= 0) {
        message += ` You lead PR ghost by ${ghostLeadMeters} meters!`;
      } else {
        message += ` PR ghost is ahead by ${Math.abs(ghostLeadMeters)} meters.`;
      }
    }
    this.speak(message);
  }
}

export const voiceCoPilot = new VoiceCoPilotService();
