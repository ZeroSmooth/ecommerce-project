import { useRef } from "react";

function ParallaxSection({ children, className = "" }) {
  const sectionRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = sectionRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / rect.height) * 5;
    const rotateY = (x / rect.width) * 5;

    el.style.transform = `
      perspective(1500px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;
  };

  const handleMouseEnter = () => {
    const el = sectionRef.current;
    if (!el) return;

    el.style.transition = "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)";
  };

  const handleMouseLeave = () => {
    const el = sectionRef.current;
    if (!el) return;

    el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform =
      "perspective(1500px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={sectionRef}
      className={`parallax-section ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </div>
  );
}

export default ParallaxSection;
