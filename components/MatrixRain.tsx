import React, { useEffect, useRef } from 'react';

export const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Characters used in the matrix rain (Katakana + Numbers + Latin)
    const str = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const matrix = str.split("");

    const fontSize = 14;
    let columns = width / fontSize;

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      // Black with very low opacity to create the fade trail effect
      ctx.fillStyle = "rgba(2, 2, 2, 0.05)";
      ctx.fillRect(0, 0, width, height);

      // Text Color (Nexus Green)
      ctx.fillStyle = "#00FF94"; 
      ctx.font = `${fontSize}px 'JetBrains Mono'`;

      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        
        // Randomly make some characters brighter/white for the "glint" effect
        if (Math.random() > 0.98) {
            ctx.fillStyle = "#FFF"; 
        } else {
            ctx.fillStyle = "#00FF94"; 
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly after it has crossed the screen
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = width / fontSize;
      // Preserve drops array length or reset? Reset is safer for resize
      drops.length = 0;
      for (let x = 0; x < columns; x++) {
        drops[x] = 1;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none z-0"
    />
  );
};