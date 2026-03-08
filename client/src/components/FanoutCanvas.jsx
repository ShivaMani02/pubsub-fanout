// FanoutCanvas.jsx - Neon visualization of message distribution
// Uses Canvas API to draw high-performance, beautiful message fanout animations

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
    const subscribers = [];
    const subCount = 12; // Visual fixed subscribers around center

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize subscribers positions
    for (let i = 0; i < subCount; i++) {
      const angle = (i / subCount) * Math.PI * 2;
      const radius = 120;
      subscribers.push({
        x: canvas.offsetWidth / 2 + Math.cos(angle) * radius,
        y: canvas.offsetHeight / 2 + Math.sin(angle) * radius,
        pulse: 0
      });
    }

    const createParticle = (targetSub) => {
      return {
        x: canvas.offsetWidth / 2,
        y: canvas.offsetHeight / 2,
        targetX: targetSub.x,
        targetY: targetSub.y,
        progress: 0,
        speed: 0.02 + Math.random() * 0.02,
        color: Math.random() > 0.5 ? '#6366f1' : '#ec4899'
      };
    };

    const handleNewMessage = () => {
      // Create particles for each subscriber
      subscribers.forEach(sub => {
        messageParticles.push(createParticle(sub));
        // Pulse the target subscriber
        sub.pulse = 1;
      });
    };

    const socket = getSocket();
    socket.on('message:new', handleNewMessage);

    const animate = () => {
      // Dark trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw Center Node (Broker)
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Update and Draw Subscribers
      subscribers.forEach(sub => {
        sub.pulse *= 0.95; // Decay pulse
        const subRadius = 5 + sub.pulse * 8;

        ctx.fillStyle = sub.pulse > 0.1 ? `rgba(236, 72, 153, ${sub.pulse})` : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(sub.x, sub.y, subRadius, 0, Math.PI * 2);
        ctx.fill();

        if (sub.pulse > 0.1) {
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sub.x, sub.y, subRadius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Update and Draw Particles
      messageParticles = messageParticles.filter(p => p.progress < 1);
      messageParticles.forEach(p => {
        p.progress += p.speed;

        // Bezier-like curve path or straight for now
        const curX = p.x + (p.targetX - p.x) * p.progress;
        const curY = p.y + (p.targetY - p.y) * p.progress;

        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(curX, curY, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // Reset shadow for other draws
      });

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
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#000'
        }}
      />
      {/* Overlay info */}
      <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
        NODE_JS_BROKER_v1.0 // ACTIVE_FANOUT_STREAMS
      </div>
    </div>
  );
};

export default FanoutCanvas;
