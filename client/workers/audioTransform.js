// Audio parameters for Stormtrooper voice effects
const AUDIO_PARAMS = {
  // Audio Format
  sampleRate: 24000,
  
  // Filter Curve EQ
  highpassFreq: 750.0,
  lowpassFreq: 3750.0,
  midBoostDb: 6.0,
  filterOrder: 6,
  
  // Output Gain
  outputGainDb: 40.0
};

// Worker to handle audio transforms
self.onrtctransform = (event) => {
  const transformer = event.transformer;
  
  if (!transformer.options.isEnabled) {
    // Pass through without modification if disabled
    transformer.readable
      .pipeTo(transformer.writable)
      .catch(console.error);
    return;
  }

  // Create transform stream for audio effects
  const transform = new TransformStream({
    transform(encodedFrame, controller) {
      try {
        // For now, just pass through frames
        // We'll add processing in subsequent steps
        controller.enqueue(encodedFrame);
      } catch (error) {
        console.error('Transform error:', error);
        // On error, pass through original frame
        controller.enqueue(encodedFrame);
      }
    }
  });

  // Set up the pipeline
  transformer.readable
    .pipeThrough(transform)
    .pipeTo(transformer.writable)
    .catch(console.error);
}; 