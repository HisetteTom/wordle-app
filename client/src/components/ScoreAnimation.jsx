import React, { useEffect, useState, useRef } from "react";

const ScoreAnimation = ({ score, onAnimationComplete }) => {
  const [animationState, setAnimationState] = useState("entering");
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  // Générer des particules pour l'effet visuel
  useEffect(() => {
    // Plus le score est élevé, plus il y a de particules (dans une limite raisonnable)
    const particleCount = Math.min(25, Math.max(12, score / 2));
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Créer des particules avec des propriétés aléatoires pour plus de dynamisme
      newParticles.push({
        id: i,
        x: Math.random() * 100,  // Position horizontale aléatoire
        y: Math.random() * 100,  // Position verticale aléatoire
        size: Math.random() * 8 + 4,  // Taille aléatoire entre 4 et 12px
        duration: Math.random() * 1.5 + 1,  // Durée d'animation entre 1 et 2.5s
        delay: Math.random() * 0.5,  // Délai de départ entre 0 et 0.5s
        color: getRandomColor(),  // Couleur aléatoire
      });
    }
    
    setParticles(newParticles);
    
  }, [score]);

  // Gérer les étapes de l'animation
  useEffect(() => {
    // Phase 1: Entrée
    const enteringTimer = setTimeout(() => {
      setAnimationState("visible");
      
      // Phase 2: Visibilité maintenue
      const leavingTimer = setTimeout(() => {
        setAnimationState("leaving");
        
        // Phase 3: Sortie et nettoyage
        const completeTimer = setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 600);
        
        return () => clearTimeout(completeTimer);
      }, 2200);
      
      return () => clearTimeout(leavingTimer);
    }, 100);
    
    return () => clearTimeout(enteringTimer);
  }, [onAnimationComplete]);

  // Fonction utilitaire pour générer des couleurs aléatoires
  function getRandomColor() {
    const colors = [
      "#FFD700", // Or
      "#FFA500", // Orange
      "#FF4500", // Rouge-orangé
      "#FF6347", // Tomate
      "#FFFF00", // Jaune
      "#FAFAD2", // Jaune pâle
      "#FFFACD", // Citron
      "#F0E68C"  // Kaki
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Classes selon l'état de l'animation
  const animationClasses = {
    entering: "opacity-0 scale-90",
    visible: "opacity-100 scale-100",
    leaving: "opacity-0 scale-110"
  };

  // Calculer une taille de texte adaptée au score
  const getFontSize = () => {
    if (score >= 100) return "text-5xl";
    if (score >= 50) return "text-4xl";
    return "text-3xl";
  };

  return (
    // Suppression des classes de positionnement fixed
    <div 
      ref={containerRef}
      className={`transition-all duration-500 ${animationClasses[animationState]}`}
      style={{ width: "auto", minWidth: "160px" }}
    >
      {/* Conteneur principal avec effet de lueur */}
      <div className="absolute bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(255,165,0,0.7)]">
        {/* Texte du score avec une animation de pulsation */}
        <div className="flex items-center whitespace-nowrap">
          <span className="text-yellow-100 mr-1">+</span>
          <span className={`${getFontSize()} font-extrabold animate-pulse text-white`}>{score}</span>
          <span className="ml-2 text-sm text-yellow-100">points</span>
        </div>
        
        {/* Contour brillant */}
        <div className="absolute inset-0 rounded-lg border border-yellow-300 opacity-50"></div>
        
        {/* Particules d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: particle.color,
                animation: `particleFade ${particle.duration}s ease-out ${particle.delay}s forwards`,
                boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreAnimation;