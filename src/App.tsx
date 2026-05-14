import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, Crown, Heart, CheckCircle2, Wand2, Music, VolumeX, Shirt, Utensils, Camera, PartyPopper, Copy } from 'lucide-react';

export default function App() {
  // Estados para el Generador Mágico (Gemini API)
  const [showWishGenerator, setShowWishGenerator] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);
  const [message, setMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Estado para la pantalla de introducción (Video/GIF)
  const [showIntro, setShowIntro] = useState(true);

  // Nuevos estados para mejoras (Cuenta regresiva y Música)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Estado para el cursor mágico (Polvo de hadas)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  // Efecto del ratón para el brillo interactivo
  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    // Para dispositivos táctiles
    window.addEventListener('touchmove', (e: any) => {
      if(e.touches.length > 0) {
        setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, []);

  // Efecto para la cuenta regresiva
  useEffect(() => {
    // Fecha del evento: 30 de Mayo de 2026 a las 18:00
    const targetDate = new Date('2026-05-30T18:00:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Manejo de música de fondo
  const toggleAudio = () => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((e: any) => console.log("Auto-play bloqueado por el navegador", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 4. Integración de Gemini API
  const generateMagicWish = async () => {
    if (!magicPrompt.trim()) return;
    setIsGeneratingWish(true);
    const apiKey = ""; 
    const prompt = `Actúa como un personaje mágico del mundo del pantano (estilo La Princesa y el Sapo). Escribe un deseo de feliz cumpleaños de 15 años hermoso, emotivo y corto (máximo 3 líneas) para Alexandra. El mensaje es de parte de un invitado especial, cuya relación con la cumpleañera es: "${magicPrompt}". Usa un tono cálido, un poco de magia de cuento de hadas y añade 1 o 2 emojis relevantes. No escribas saludos de carta convencionales, solo el mensaje directo.`;

    const fetchWithRetry = async (retries = 5, delay = 1000): Promise<any> => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          if (!response.ok) throw new Error('Error en la API');
          return await response.json();
        } catch (e) {
          if (i === retries - 1) throw e;
          await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
        }
      }
    };

    try {
      const data = await fetchWithRetry();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setMessage(text.trim());
        setShowWishGenerator(false);
      }
    } catch (error) {
      setMessage("Hubo un pequeño fallo en la magia. ¡Por favor, intenta escribir tu mensaje manualmente!");
    } finally {
      setIsGeneratingWish(false);
    }
  };

  // Función para copiar el deseo mágico
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 overflow-x-hidden relative selection:bg-emerald-500 selection:text-white custom-cursor">
      
      {/* Estilos Globales para Cursor Mágico y Animaciones Extra */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap');
        .font-magical { font-family: 'Berkshire Swash', serif; }
        .custom-cursor {
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><text y='20' font-size='20'>✨</text></svg>") 12 12, auto;
        }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } 100% { transform: translateY(0px) rotate(0deg); } }
        @keyframes fogMove { 0% { background-position: 0% 0%; } 100% { background-position: 200% 0%; } }
        @keyframes floatUp { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-20vh) scale(1.5); opacity: 0; } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }
        
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-up { animation: floatUp linear infinite; }
        .animate-pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        
        .fog-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          animation: fogMove 60s linear infinite;
        }
      `}} />

      {/* Luz de Hada (Sigue al cursor) */}
      <div 
        className="pointer-events-none fixed z-40 w-48 h-48 rounded-full bg-amber-300/15 blur-3xl transition-all duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x - 96}px, ${mousePos.y - 96}px)` }}
      />

      <audio id="bg-music" loop>
        <source src="https://www.dropbox.com/scl/fi/gqf2ha7ariw7j6759sj76/Ma-Belle-Evangeline-Letra-Latino_320k.mp3?rlkey=qlxuz8ot1b7j7kpki4idvr41g&st=lq8vakvl&raw=1" type="audio/mpeg" />
      </audio>

      {/* PANTALLA DE INTRODUCCIÓN */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-4 transition-opacity duration-1000 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 opacity-90"></div>
            <div className="absolute inset-0 fog-overlay mix-blend-screen"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_60%)]"></div>
            
            {/* Reflejo de agua en la parte inferior */}
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-emerald-800/40 to-transparent blur-2xl"></div>
          </div>
          
          {/* Enjambre de luciérnagas ascendentes exclusivo de la portada */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={`intro-sparkle-${i}`}
                className="absolute bottom-0 w-2 h-2 bg-amber-300 rounded-full blur-[2px] animate-float-up"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 6 + 4}s`,
                  animationDelay: `${Math.random() * 5}s`,
                  boxShadow: '0 0 15px 2px rgba(251,191,36,0.8)'
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4 animate-pulse">
              <Sparkles className="text-amber-400 w-5 h-5" />
              <span className="text-amber-400 tracking-widest uppercase text-sm font-semibold">Un Momento Mágico</span>
              <Sparkles className="text-amber-400 w-5 h-5" />
            </div>

            <h2 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-amber-200 to-amber-500 mb-8 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              Mis 15 Años
            </h2>
            
            <div className="relative mb-10">
              {/* Aura mágica palpitante detrás del retrato */}
              <div className="absolute -inset-10 bg-amber-500/20 rounded-[4rem] blur-3xl animate-pulse-glow pointer-events-none z-0"></div>
              
              {/* Contenedor ajustado a formato vertical (retrato) con VIDEO en lugar de imagen */}
              <div className="w-64 h-[340px] md:w-[320px] md:h-[420px] rounded-[3rem] overflow-hidden border-4 border-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.5)] relative group bg-emerald-950/30 z-10 flex justify-center items-center">
                <div className="absolute inset-0 border-[6px] border-amber-400/30 rounded-[3rem] z-20 pointer-events-none transition-transform duration-700 group-hover:scale-[1.02]"></div>
                {/* Gradiente oscuro en la base del video para mezclarlo con el diseño */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>
                
                <video 
                  src="https://www.dropbox.com/scl/fi/2eb0rt9y8ep1z9thlusxa/download.mp4?rlkey=rj9uw0dvhj3fof4ben7c95o5x&st=lh6x88pc&raw=1" 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>

            <p className="text-amber-200/80 font-serif italic mb-6 animate-pulse">La magia está por comenzar...</p>

            <button 
              onClick={() => { setShowIntro(false); toggleAudio(); }}
              className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-900 font-bold text-lg py-4 px-12 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.5)] transform transition duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 blur-md transform -translate-x-full hover:animate-[shimmer_1.5s_infinite]"></div>
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Abrir Invitación</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTÓN DE MÚSICA */}
      {!showIntro && (
        <button 
          onClick={toggleAudio}
          className="fixed top-4 right-4 z-50 bg-slate-900/80 p-3 rounded-full border border-amber-500/30 text-amber-300 hover:text-amber-100 backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all hover:scale-110 animate-fade-in"
        >
          {isPlaying ? <Music className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      )}

      {/* FONDO MÁGICO DEL PANTANO (Mejorado) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 opacity-95"></div>
        <div className="absolute inset-0 fog-overlay mix-blend-screen opacity-40"></div>
        
        {/* Luciérnagas decorativas mejoradas */}
        {[...Array(25)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-amber-300 blur-[1px] animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDuration: `${Math.random() * 3 + 1.5}s`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: '0 0 10px rgba(251,191,36,0.8)'
            }}
          ></div>
        ))}
        
        {/* Resplandores abstractos simulando agua/magia */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-700 rounded-full blur-[100px] opacity-40 animate-float"></div>
        <div className="absolute top-20 -right-20 w-80 h-80 bg-lime-800 rounded-full blur-[100px] opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        
        {/* CABECERA */}
        <div className="text-center mb-16 animate-fade-in-up">
          <Crown className="w-12 h-12 text-amber-400 mx-auto mb-6 animate-float" />
          
          <h1 className="font-magical text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-lime-200 via-emerald-200 to-teal-300 mb-6 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">
            Alexandra
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-[2px] w-16 bg-gradient-to-r from-transparent to-amber-500/70"></span>
            <span className="text-2xl tracking-widest text-amber-300 font-serif italic">XV Años</span>
            <span className="h-[2px] w-16 bg-gradient-to-l from-transparent to-amber-500/70"></span>
          </div>
          
          <p className="text-xl md:text-2xl text-emerald-100/90 font-light max-w-lg mx-auto">
            Hay un poco de magia en el aire... y quiero compartirla contigo en mi día especial.
          </p>
        </div>

        {/* CUENTA REGRESIVA */}
        <div className="w-full mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center gap-4 md:gap-8">
            {[
              { label: 'Días', value: timeLeft.days },
              { label: 'Horas', value: timeLeft.hours },
              { label: 'Minutos', value: timeLeft.minutes },
              { label: 'Segundos', value: timeLeft.seconds }
            ].map((time, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-emerald-900/60 to-slate-900/80 backdrop-blur-md border border-emerald-500/50 rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-transform duration-300 group-hover:-translate-y-2 group-hover:border-amber-400/50">
                  <span className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500">{time.value}</span>
                </div>
                <span className="text-xs md:text-sm text-emerald-200 font-medium tracking-widest uppercase">{time.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DETALLES DEL EVENTO (Tarjetas Mágicas) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: Calendar, title: "Cuándo", desc: "30 de Mayo", sub: "A partir de las 18:00 hrs" },
            { 
              icon: MapPin, 
              title: "Dónde", 
              desc: "Salón de Eventos VENEZIA", 
              sub: (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <span className="text-sm leading-relaxed text-slate-400">Misa previa en Iglesia San Lázaro</span>
                  <a 
                    href="https://maps.app.goo.gl/KCTE2uDhE97L3wmr5" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-300 hover:text-slate-900 bg-amber-900/40 hover:bg-amber-400 transition-all duration-300 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-amber-500/40 shadow-lg"
                  >
                    <MapPin className="w-3 h-3" /> Dale clic aquí para la ubicación
                  </a>
                </div>
              ) 
            },
            { icon: Shirt, title: "Dress Code", desc: "Formal de Gala", sub: <><span className="block mb-1">Sin tenis ni zapatillas.</span><span className="block text-amber-400 font-medium tracking-wide">Verde y dorado reservados para la quinceañera.</span></> }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-800/40 backdrop-blur-md border border-emerald-500/30 hover:border-amber-400/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] group hover:-translate-y-1">
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 rounded-full mb-4 shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform duration-500 border border-emerald-600/50">
                <item.icon className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-sm tracking-widest text-emerald-300 mb-2 uppercase">{item.title}</h3>
              <div className="text-2xl font-serif text-white mb-2">{item.desc}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* NUEVO: ITINERARIO / CRONOGRAMA */}
        <div className="w-full bg-slate-900/50 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 md:p-12 mb-16 shadow-2xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
          
          <h2 className="text-3xl font-serif text-center text-amber-300 mb-10">La Velada Mágica</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/50 before:to-transparent">
            
            {[
              { time: "18:00 hrs", title: "Ceremonia Religiosa", desc: "Iglesia San Lázaro.", icon: Heart },
              { time: "19:00 hrs", title: "Recepción de Invitados", desc: "Apertura del Salón de Eventos VENEZIA y bienvenida.", icon: Camera },
              { time: "21:00 hrs", title: "Entrada Real, Brindis y Vals", desc: "Llegada de la quinceañera para el clásico vals y el brindis.", icon: Crown },
              { time: "21:30 hrs", title: "Número Sorpresa", desc: "Presentación especial de compañeros y familia.", icon: Sparkles },
              { time: "22:00 hrs", title: "Cena Real", desc: "Cena especial servida para los mayores.", icon: Utensils },
              { time: "22:00 hrs", title: "¡A Bailar!", desc: "Apertura de la pista de baile.", icon: Music },
              { time: "23:00 hrs", title: "La Hora Loca", desc: "¡Color, sorpresas y mucha diversión en el pantano!", icon: PartyPopper }
            ].map((event, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-400 bg-slate-900 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-900">
                  <event.icon className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-emerald-900/20 border border-emerald-500/20 transition-all hover:border-amber-400/40 hover:bg-emerald-900/30">
                  <div className="flex flex-col md:group-odd:items-end">
                    <span className="text-amber-400 font-bold mb-1">{event.time}</span>
                    <h4 className="text-lg text-emerald-100 font-serif">{event.title}</h4>
                    <p className="text-sm text-slate-400 md:group-odd:text-right">{event.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULARIO DE RSVP (Conexión a Google Forms) */}
        <div className="w-full bg-gradient-to-br from-emerald-950/80 to-slate-900/90 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-3">Confirma tu Asistencia</h2>
            <p className="text-emerald-200/80">Por favor, llena nuestro pergamino oficial en Google Forms para confirmar tu lugar en este cuento de hadas.</p>
          </div>
          
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-5 shadow-inner mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
              <label className="text-sm font-medium text-emerald-200 uppercase tracking-wider">¿No sabes qué desearle a la quinceañera?</label>
              <button 
                type="button" onClick={() => setShowWishGenerator(!showWishGenerator)}
                className="text-xs flex items-center justify-center gap-2 font-bold text-slate-900 bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:scale-105 transition-transform"
              >
                <Wand2 className="w-4 h-4" />
                {showWishGenerator ? 'Ocultar Magia' : 'Usar Magia ✨'}
              </button>
            </div>

            {showWishGenerator && (
              <div className="mb-5 p-4 bg-slate-900/90 rounded-xl border border-amber-500/40 animate-fade-in shadow-lg">
                <p className="text-sm text-amber-200 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Deja que las luciérnagas escriban por ti.</p>
                <input 
                  type="text" value={magicPrompt} onChange={(e: any) => setMagicPrompt(e.target.value)}
                  placeholder="¿Qué parentesco tienes? (Ej: Su mejor amiga)"
                  className="w-full bg-slate-800 border border-emerald-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
                />
                <button
                  type="button" onClick={generateMagicWish} disabled={isGeneratingWish || !magicPrompt.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all mb-4"
                >
                  {isGeneratingWish ? 'Consultando a las estrellas...' : 'Generar deseo mágico'}
                </button>
                
                {message && (
                  <div className="relative">
                    <textarea 
                      value={message} onChange={(e: any) => setMessage(e.target.value)} rows={3}
                      className="w-full bg-slate-950/80 border border-amber-500/40 rounded-xl px-5 py-4 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
                    ></textarea>
                    <button 
                      onClick={copyToClipboard}
                      className="absolute top-3 right-3 p-2 bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 rounded-lg transition-colors border border-amber-500/30 flex items-center gap-2 text-xs"
                    >
                      {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? '¡Copiado!' : 'Copiar Deseo'}
                    </button>
                    <p className="text-xs text-emerald-300 mt-2 text-center">¡Copia tu deseo mágico y pégalo en el formulario de confirmación!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSf_cALO3HRfGSde_v30-FHKM2JmvBo6Gn_KJekRRc9z7LK6Hw/viewform" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:via-teal-400 hover:to-emerald-500 text-white font-serif text-2xl py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transform transition duration-300 hover:-translate-y-1 active:translate-y-0 flex justify-center items-center gap-3 relative overflow-hidden group text-center"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 blur-md transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              Confirma tu presencia aquí
              <Crown className="w-6 h-6 relative z-10" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}