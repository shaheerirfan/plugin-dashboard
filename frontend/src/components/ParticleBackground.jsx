import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particlesArray = [];
    const numberOfParticles = 220;
    const mouse = { x: null, y: null, radius: 180 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mouseleave', handleMouseLeave);

    //Light Mode Colors
    const lightColors = [
      'rgba(37, 99, 235, 0.16)',   // Royal Blue
      'rgba(147, 51, 234, 0.14)',  // Violet
      'rgba(13, 148, 136, 0.12)'   // Teal
    ];

    //Dark Mode Colors
    const darkColors = [
      'rgba(96, 165, 250, 0.18)',   // Neon Blue
      'rgba(192, 132, 252, 0.16)',  // Neon Purple
      'rgba(45, 212, 191, 0.14)'    // Neon Teal
    ];

    const colors = theme === 'dark' ? darkColors : lightColors;

    class Particle {
      constructor() {
        this.reset();
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseSpeed = Math.random() * 1.5 + 1; //randomized speeds
        this.speed = this.baseSpeed;
        this.history = []; 
        this.maxHistory = Math.floor(Math.random() * 15 + 10); //trail lengths
      }

      update() {
        //intricate flow curves
        let angle = (Math.sin(this.x * 0.003) + Math.cos(this.y * 0.003)) * Math.PI * 2;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            //orbit gravity pull
            angle += Math.atan2(dy, dx) + (Math.PI / 2) * force * 1.4;
            this.speed = Math.min(4.5, this.speed + 0.1); //speed-up
          } else {
            this.speed = Math.max(this.baseSpeed, this.speed - 0.05); //cool-down
          }
        } else {
          this.speed = Math.max(this.baseSpeed, this.speed - 0.05);
        }

        const vx = Math.cos(angle) * this.speed;
        const vy = Math.sin(angle) * this.speed;

        this.x += vx;
        this.y += vy;

        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) {
          this.history.shift();
        }

        if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
          this.reset();
        }
      }

      draw() {
        if (this.history.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
          ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2; //uniform thickness
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = theme === 'dark' ? 'rgba(15, 23, 42, 0.25)' : 'rgba(243, 244, 246, 0.25)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); 

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 bg-[#f3f4f6] dark:bg-[#0f172a] transition-colors duration-500" 
    />
  );
}