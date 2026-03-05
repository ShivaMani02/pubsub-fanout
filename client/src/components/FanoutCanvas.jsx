// FanoutCanvas.jsx - Canvas visualization of message fanout
// Draws real-time visualization of message distribution

import React, { useRef, useEffect } from 'react';
import { getSocket } from '../services/socket';

const FanoutCanvas = ({ simState }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let messageParticles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create message particle
    const createParticle = () => {
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 2;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02
      };
    };

    // Listen for new messages and create particles
    const socket = getSocket();
    const handleNewMessage = () => {
      // Create 3-5 particles for each message
      for (let i = 0; i < 3 + Math.random() * 2; i++) {
        messageParticles.push(createParticle());
      }
    };

    socket.on('message:new', handleNewMessage);

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      messageParticles = messageParticles.filter(p => p.life > 0);
      messageParticles.forEach(p => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        // Draw particle
        ctx.fillStyle = `rgba(102, 126, 234, ${p.life * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw center circle
      ctx.strokeStyle = `rgba(102, 126, 234, 0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      socket.off('message:new', handleNewMessage);
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'white',
        borderRadius: '6px'
      }}
    />
  );
};

export default FanoutCanvas;
