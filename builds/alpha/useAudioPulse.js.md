/**
 * @PATH [src/useAudioPulse.js]
 * @REV [20260225-0150]
 * @MODULE [OS]
 * @STATUS [DEV]
 * @FILETYPE [HOK]
 * @DESC [Manages Web Audio API lifecycle and extracts real-time amplitude data.]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [?] Evaluate if fftSize needs to be increased for higher resolution frequency mapping
 * @TODO_END
 * =====================================*/

import { useRef, useState } from 'react';

export const useAudioPulse = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtx = useRef(null);
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const source = useRef(null);

  const initAudio = async (audioElement) => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioCtx.current.createAnalyser();
      
      analyser.current.fftSize = 256; 
      const bufferLength = analyser.current.frequencyBinCount;
      dataArray.current = new Uint8Array(bufferLength);

      source.current = audioCtx.current.createMediaElementSource(audioElement);
      source.current.connect(analyser.current);
      analyser.current.connect(audioCtx.current.destination);
    }

    if (audioCtx.current.state === 'suspended') {
      await audioCtx.current.resume();
    }
  };

  const getPulse = () => {
    if (!analyser.current) return 0;
    analyser.current.getByteFrequencyData(dataArray.current);
    
    let sum = 0;
    for (let i = 0; i < dataArray.current.length; i++) {
      sum += dataArray.current[i];
    }
    return sum / (dataArray.current.length * 255);
  };

  return { initAudio, getPulse, setIsPlaying, isPlaying };
};