// Audio processor for Stormtrooper voice effects
export class AudioProcessor {
  constructor() {
    this.isEnabled = process.env.ENABLE_STORMTROOPER_AUDIO === 'true';
    this.worker = null;
    this.audioContext = null;
    
    // Effect parameters from Python implementation
    this.params = {
      clickDuration: 0.04,
      clickFreq: 2400.0,
      clickVolume: 0.05,
      staticDurationMin: 0.08,
      staticDurationMax: 0.2,
      staticVolume: 0.05
    };
  }

  // Get audio constraints for WebRTC
  getAudioConstraints() {
    if (!this.isEnabled) {
      return { audio: true };
    }
    
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 24000,
        channelCount: 1
      }
    };
  }

  // Initialize audio context if needed
  initAudioContext() {
    if (!this.audioContext && typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  }

  // Generate mic click effect
  async generateClick() {
    const { clickDuration, clickFreq, clickVolume } = this.params;
    const sampleRate = this.audioContext.sampleRate;
    const samples = clickDuration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate click waveform with exponential decay
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * clickFreq * t) * 
                Math.exp(-t / (clickDuration * 0.3)) * 
                clickVolume;
    }

    return buffer;
  }

  // Generate radio static effect
  async generateStatic() {
    const { staticDurationMin, staticDurationMax, staticVolume } = this.params;
    const duration = staticDurationMin + 
                    Math.random() * (staticDurationMax - staticDurationMin);
    const samples = Math.floor(duration * this.audioContext.sampleRate);
    const buffer = this.audioContext.createBuffer(1, samples, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate filtered noise
    for (let i = 0; i < samples; i++) {
      data[i] = (Math.random() * 2 - 1) * staticVolume;
    }

    return buffer;
  }

  // Play an audio buffer
  async playBuffer(buffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
    return new Promise(resolve => {
      source.onended = resolve;
    });
  }

  // Play start effects (click + static)
  async playStartEffects() {
    if (!this.isEnabled) return;
    this.initAudioContext();
    
    try {
      const click = await this.generateClick();
      const staticNoise = await this.generateStatic();
      
      await this.playBuffer(click);
      await this.playBuffer(staticNoise);
    } catch (error) {
      console.error('Failed to play start effects:', error);
    }
  }

  // Play end effects (static + click)
  async playEndEffects() {
    if (!this.isEnabled) return;
    this.initAudioContext();
    
    try {
      const staticNoise = await this.generateStatic();
      const click = await this.generateClick();
      
      await this.playBuffer(staticNoise);
      await this.playBuffer(click);
    } catch (error) {
      console.error('Failed to play end effects:', error);
    }
  }

  // Set up transform for sender
  async setupTransform(sender) {
    if (!this.isEnabled) return;
    
    try {
      // Check if transforms are supported
      if (!window.RTCRtpSender || !("transform" in RTCRtpSender.prototype)) {
        console.warn('RTCRtpScriptTransform not supported');
        return;
      }

      // Create worker if needed
      if (!this.worker) {
        this.worker = new Worker(new URL('./workers/audioTransform.js', import.meta.url));
      }

      // Set up transform
      const transform = new RTCRtpScriptTransform(this.worker, { isEnabled: this.isEnabled });
      sender.transform = transform;
    } catch (error) {
      console.error('Failed to setup transform:', error);
    }
  }

  // Clean up resources
  dispose() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
} 