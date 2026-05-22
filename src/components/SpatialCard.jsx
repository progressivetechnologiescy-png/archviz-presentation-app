import React, { useState, useRef } from 'react';

/**
 * SpatialCard is a wrapper that applies visionOS-style spatial computing interactions.
 * It features dynamic mouse-move 3D parallax tilt, real-time cursor border glow tracking,
 * and elegant premium scale springs.
 */
const SpatialCard = React.forwardRef(({ children, style = {}, className = '', maxTilt = 8, onClick, ...props }, ref) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    
    // Calculate cursor position relative to card boundaries (0 to 1)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Apply cursor position as CSS Custom Properties for GPU-accelerated glow gradient
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

    // Calculate normalized coordinates (-0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;

    // Calculate rotational angle (reverse X and Y directions due to screen-vs-3D axis mapping)
    const rotateX = -normalizedY * maxTilt;
    const rotateY = normalizedX * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.025)`,
      transition: 'transform 0.1s ease, box-shadow 0.1s ease' // Ultra-fast tracking on mouse move
    });

    if (props.onMouseMove) {
      props.onMouseMove(e);
    }
  };

  const handleMouseLeave = (e) => {
    const card = cardRef.current;
    if (!card) return;

    // Reset glow position to center
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');

    // Smoothly spring-reset tilt to home position
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' // Springy return bounce
    });

    if (props.onMouseLeave) {
      props.onMouseLeave(e);
    }
  };


  const setRefs = (node) => {
    cardRef.current = node;
    if (ref) {
      if (typeof ref === 'function') ref(node);
      else ref.current = node;
    }
  };

  return (
    <div
      ref={setRefs}
      className={`spatial-glow-panel ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        ...tiltStyle,
        cursor: onClick ? 'pointer' : 'default'
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export default SpatialCard;

