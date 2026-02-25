/**
 * @PATH [src/components/audio/BioShell.jsx]
 * @REV [20260225-0140]
 * @MODULE [PRT]
 * @STATUS [DEV]
 * @FILETYPE [WDG]
 * @DESC [Renders a reactive, organic UI shell using twgl.js and GLSL.]
 * @COMPLIANCE [No external icon packs; Functional React; async/await - WEBGL-COMPONENT]
 * -------------------------------------
 * @TODO_START
 * [?] DEVNOTES [Uses a basic 'pulsing' noise. To integrate with AE, pass AnalyserNode data as a uniform.]
 * [+] Monitor WebGL context memory leaks on unmount
 * @TODO_END
 * =====================================*/

import React, { useEffect, useRef } from 'react';

import * as twgl from 'twgl.js';

// @COMPONENT
const BioShell = ({ getPulse }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  const vs = `
    attribute vec4 position; 
    void main() { 
      gl_Position = position; 
    }
  `;

  const fs = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_audio;

    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }

    float voronoi(vec2 x) {
      vec2 n = floor(x);
      vec2 f = fract(x);
      float m = 8.0;
      for(int j=-1; j<=1; j++)
      for(int i=-1; i<=1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash(n + g);
        vec2 r = g + o - f;
        float d = dot(r, r);
        if(d < m) m = d;
      }
      return sqrt(m);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 movement = uv * 3.0;
      movement.y += u_time * 0.2 + (u_audio * 0.5);
      
      float f = voronoi(movement);
      float veins = 1.0 - smoothstep(0.0, 0.1 + (u_audio * 0.2), f);
      
      vec3 basePurple = vec3(0.08, 0.02, 0.12);
      vec3 highlightCyan = vec3(0.0, 1.0, 0.9);
      
      vec3 color = mix(basePurple, vec3(0.2, 0.05, 0.3), f);
      color += highlightCyan * veins * (0.8 + u_audio * 2.0);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // @EFFECTS [WebGL Render Loop]
  useEffect(() => {
    const gl = canvasRef.current.getContext("webgl");
    if (!gl) return;

    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    const arrays = { 
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] 
    };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    const render = (time) => {
      const pulseValue = getPulse ? getPulse() : 0;

      twgl.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      const uniforms = {
        u_time: time * 0.001,
        u_resolution: [gl.canvas.width, gl.canvas.height],
        u_audio: pulseValue,
      };

      gl.useProgram(programInfo.program);
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, bufferInfo);

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    // Rule 2 & 3: Return and Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [getPulse, vs, fs]);

  const canvasStyles = {
    width: '100%',
    height: '100%',
    filter: 'blur(2px) contrast(1.2)',
    display: 'block'
  };

  return <canvas ref={canvasRef} style={canvasStyles} />;
};

export default BioShell;