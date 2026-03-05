// useCanvas.js - Custom React hook for canvas manipulation
// Provides utilities for canvas-based visualizations

import { useRef, useEffect } from 'react';

/**
 * Custom hook for canvas operations
 */
const useCanvas = (draw) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Call draw function
    if (draw) {
      draw(context, canvas);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw]);

  return canvasRef;
};

export default useCanvas;
