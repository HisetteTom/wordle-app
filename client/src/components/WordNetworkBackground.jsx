import React, { useRef, useEffect } from "react";

const WordNetworkBackground = ({ gamePage = false }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    let connections = [];
    
    // Redimensionner le canvas pour qu'il occupe tout l'écran
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialiser le canvas
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Créer un dégradé en arrière-plan - version plus prononcée
    const createGradient = () => {
      // Utiliser un dégradé diagonal pour un effet plus marqué
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      // Couleurs plus vives et opaques pour le dégradé
      if (gamePage) {
        // Dégradé pour la page de jeu - tons plus bleus/indigo
        gradient.addColorStop(0, "rgba(198, 214, 255, 0.97)"); // Bleu très clair
        gradient.addColorStop(0.3, "rgba(179, 197, 255, 0.97)"); // Bleu clair
        gradient.addColorStop(0.7, "rgba(137, 154, 231, 0.97)"); // Indigo moyen
        gradient.addColorStop(1, "rgba(109, 130, 220, 0.97)"); // Indigo plus soutenu
      } else {
        // Dégradé pour la page d'accueil - tons violet/indigo
        gradient.addColorStop(0, "rgba(220, 227, 255, 0.97)"); // Indigo très clair
        gradient.addColorStop(0.3, "rgba(192, 203, 255, 0.97)"); // Indigo clair
        gradient.addColorStop(0.7, "rgba(164, 174, 231, 0.97)"); // Indigo moyen
        gradient.addColorStop(1, "rgba(126, 140, 215, 0.97)"); // Indigo plus soutenu
      }
      
      return gradient;
    };
    
    // Créer des particules aléatoires
    const createParticles = () => {
      particles = [];
      // Mots différents selon la page
      const wordleWords = gamePage 
        ? ["LETTRES", "DEVINE", "INDICE", "SCORE", "VICTOIRE"]  // Pour la page de jeu
        : ["WORDLE", "LETTRES", "DEVINE", "JOUER", "MOTS"];     // Pour la page d'accueil
      
      // Créer des particules principales pour les mots
      wordleWords.forEach(word => {
        const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        const y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
        
        particles.push({
          x,
          y,
          word,
          size: 4,
          speed: 0.2,
          angle: Math.random() * Math.PI * 2,
          color: gamePage 
            ? `rgba(79, 100, 230, 0.85)` // Bleu plus profond pour la page de jeu
            : `rgba(99, 102, 241, 0.85)`, // Indigo pour la page d'accueil
          visible: Math.random() > 0.5,
          opacity: 0.4 // Démarrer avec une opacité plus élevée
        });
      });
      
      const particleCount = 50; 
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 2,
          speed: Math.random() * 0.15 + 0.05,
          angle: Math.random() * Math.PI * 2,
          color: gamePage
            ? `rgba(130, 140, 220, 0.75)` // Couleur légèrement plus claire pour la page de jeu
            : `rgba(125, 135, 240, 0.75)`, // Plus brillant pour la page d'accueil
          visible: true,
          isPoint: true,
          opacity: Math.random() * 0.7 + 0.4 // Plus visible
        });
      }
    };
    
    // Créer des connexions entre particules
    const createConnections = () => {
      connections = [];
      // Densité des connexions ajustée selon la page
      const connectionThreshold = gamePage ? 0.75 : 0.7; // Moins de connexions sur la page de jeu
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (Math.random() > connectionThreshold) {
            connections.push({
              from: i,
              to: j,
              opacity: Math.random() * 0.4 + 0.15 // Connexions plus visibles
            });
          }
        }
      }
    };
    
    // Initialiser les particules et connexions
    createParticles();
    createConnections();
    
    // Animer les particules
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Appliquer le dégradé en arrière-plan comme fond complet
      ctx.fillStyle = createGradient();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner les connexions
      connections.forEach(connection => {
        const p1 = particles[connection.from];
        const p2 = particles[connection.to];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Distance de connexion ajustée pour la page
        const maxDistance = Math.min(canvas.width, canvas.height) * (gamePage ? 0.35 : 0.4);
        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = gamePage 
            ? `rgba(120, 140, 230, ${connection.opacity})` // Bleu pour les connexions du jeu
            : `rgba(130, 145, 250, ${connection.opacity})`; // Indigo pour l'accueil
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
      
      // Mettre à jour et dessiner les particules
      particles.forEach(particle => {
        // Vitesse ajustée pour la page
        const speedMultiplier = gamePage ? 0.5 : 0.6; // Mouvement plus lent pour une meilleure lisibilité
        particle.x += Math.cos(particle.angle) * particle.speed * speedMultiplier;
        particle.y += Math.sin(particle.angle) * particle.speed * speedMultiplier;
        
        // Rebondir sur les bords
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.angle = Math.PI - particle.angle;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.angle = -particle.angle;
        }
        
        // Faire apparaître/disparaître aléatoirement les mots
        if (!particle.isPoint && Math.random() < 0.001) {
          particle.visible = !particle.visible;
        }
        
        // Dessiner le point avec un halo
        if (particle.isPoint) {
          // Ajouter un halo pour les points
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size + 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(150, 165, 255, 0.25)`;
          ctx.fill();
          
          // Dessiner le point central
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
        } else if (particle.visible) {
          // Faire apparaître progressivement le mot
          if (particle.opacity < 0.9) particle.opacity += 0.01;
          
          // Dessiner un halo derrière le mot
          ctx.beginPath();
          ctx.fillStyle = `rgba(120, 140, 250, 0.15)`;
          ctx.fillRect(
            particle.x - 65, 
            particle.y - 18, 
            130, // Un peu plus large pour mieux encadrer le texte
            30    // Un peu plus haut pour une meilleure apparence
          );
          
          // Dessiner le mot
          ctx.font = "bold 18px 'Courier New', monospace";
          ctx.fillStyle = `rgba(60, 75, 200, ${particle.opacity})`;
          ctx.textAlign = "center";
          ctx.fillText(particle.word, particle.x, particle.y);
        } else {
          // Faire disparaître progressivement
          if (particle.opacity > 0) particle.opacity -= 0.01;
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Nettoyage lors du démontage
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gamePage]); 
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ opacity: 1 }} 
    />
  );
};

export default WordNetworkBackground;