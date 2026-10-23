import React, { useEffect, useRef } from 'react';

interface DottedSurfaceProps {
  className?: string;
}

/**
 * Reconstructed 3D sine-wave particle surface from useleadsite.com module 33417:
 * 40x60 grid of particles with wave formula:
 * y = 50 * Math.sin((ix + f) * 0.3) + 50 * Math.sin((iz + f) * 0.5)
 */
export const DottedSurface: React.FC<DottedSurfaceProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let f = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.parentElement.clientWidth || window.innerWidth;
      const h = canvas.parentElement.clientHeight || 520;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      animId = requestAnimationFrame(render);
      const w = canvas.clientWidth || 1000;
      const h = canvas.clientHeight || 520;
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const baseColor = isDark ? '209, 214, 230' : '10, 23, 51';

      const fov = 520;
      const camY = 355;
      const camZ = 1220;

      for (let ix = 0; ix < 36; ix++) {
        for (let iz = 0; iz < 45; iz++) {
          const x = ix * 150 - 2700;
          const z = iz * 150 - 3800;
          const y = 50 * Math.sin((ix + f) * 0.3) + 50 * Math.sin((iz + f) * 0.5);

          const relZ = camZ - z;
          if (relZ <= 80) continue;

          const scale = fov / relZ;
          const screenX = w / 2 + x * scale;
          const screenY = h * 0.52 + (camY - y) * scale;

          if (screenX < -10 || screenX > w + 10 || screenY < -10 || screenY > h + 10) continue;

          const fog = Math.max(0, Math.min(1, 1 - (relZ - 600) / 4200));
          const alpha = fog * (isDark ? 0.55 : 0.42);
          const radius = Math.max(1, Math.min(3.4, 4.2 * scale));

          ctx.fillStyle = `rgba(${baseColor}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      f += 0.06;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
