import React, { useEffect, useRef } from 'react';

export default function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn("WebGL not supported, falling back to CSS gradient background.");
      return;
    }

    // Vertex shader source
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader source: Beautiful high-performance interactive simplex noise
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Simplex 2D noise implementation
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx) ;
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) )
        + i.x + vec3(0.0, i1.x, 1.0) );
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 a0 = x - floor(x + 0.5);
        vec3 he = h - a0;
        vec3 g = sin(a0*6.28);
        vec3 l = cos(a0*6.28);
        vec3 r = m * ( he * vec3(x0.x, x12.xz) + vec3(x0.y, x12.yw)*g );
        return 130.0 * dot(r, vec3(1.0));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = -1.0 + 2.0 * uv;
        p.x *= u_resolution.x / u_resolution.y;

        // Normalized mouse position with limits
        vec2 m = u_mouse / u_resolution.xy;
        m = -1.0 + 2.0 * m;
        m.x *= u_resolution.x / u_resolution.y;

        // Organic warping waves
        float w1 = snoise(p * 0.8 + u_time * 0.06);
        float w2 = snoise(p * 1.5 - u_time * 0.1 + m * 0.15);

        vec2 warpedP = p + vec2(w1, w2) * 0.4;

        // Base noise pattern
        float pattern = snoise(warpedP * 1.2 + u_time * 0.03);

        // Sophisticated luxurious color palette
        vec3 spaceBg = vec3(0.008, 0.012, 0.024);     // Deep midnight space
        vec3 sapphire = vec3(0.04, 0.12, 0.36);       // Royal premium blue
        vec3 amethyst = vec3(0.24, 0.06, 0.32);       // Mystic violet
        vec3 cyanNeon = vec3(0.02, 0.32, 0.28);       // Cyber teal/emerald

        // Layer and mix colors dynamically
        vec3 col = mix(spaceBg, sapphire, clamp(pattern * 0.5 + 0.5, 0.0, 1.0));
        col = mix(col, amethyst, clamp(w1 * 0.5 + 0.3, 0.0, 1.0));
        col = mix(col, cyanNeon, clamp(w2 * 0.35 + 0.15, 0.0, 1.0));

        // Interactive mouse glow field
        float distToMouse = length(p - m * 0.3);
        float mouseGlow = 1.0 - smoothstep(0.0, 1.5, distToMouse);
        col += vec3(0.06, 0.14, 0.22) * mouseGlow;

        // High fidelity vignette to frame layout beautifully
        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        vignette = clamp(pow(16.0 * vignette, 0.35), 0.0, 1.0);
        col *= vignette;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Helper: compile shader
    function compileShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    // Link program
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Setup coordinates (full-screen quad)
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    // Track state
    let width = 0;
    let height = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gl.viewport(0, 0, width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse tracker
    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = window.innerHeight - e.clientY; // Invert Y for WebGL
    };

    // Touch tracker
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = window.innerHeight - e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animFrame;
    const startTime = Date.now();

    const render = () => {
      // Smoothly interpolate mouse coordinates (inertia)
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      const elapsed = (Date.now() - startTime) / 1000.0;

      gl.clear(gl.COLOR_BUFFER_BIT);

      // Pass uniforms
      gl.uniform2f(resLoc, width, height);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform2f(mouseLoc, mouseX, mouseY);

      // Draw quad
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrame = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
