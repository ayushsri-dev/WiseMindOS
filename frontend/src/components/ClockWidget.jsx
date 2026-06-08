import { useState, useEffect, useMemo } from 'react';
import { format, getHours } from 'date-fns';
import { Clock } from 'lucide-react';
import { motion } from "framer-motion";

const normalizeTimeZone = (timeZone) =>
  timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : timeZone;

const getTimezoneInfo = (date) => {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  const offsetParts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const offset = offsetParts.find((p) => p.type === 'timeZoneName')?.value ?? '';

  return { timeZone: normalizeTimeZone(timeZone), offset };
};

const ClockWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const tick = () => setCurrentTime(new Date());

    const timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, []);

  const { timeZone, offset } = useMemo(
    () => getTimezoneInfo(currentTime),
    [currentTime]
  );

  const dateTimeLabel = `${format(currentTime, 'EEEE, MMMM dd, yyyy')} • ${timeZone}${offset ? ` (${offset})` : ''}`;

  const getGreeting = () => {
    const hour = getHours(currentTime);
    if (hour < 12) return "Good Morning, time for deep work";
    if (hour < 18) return "Good Afternoon, stay focused";
    return "Good Evening, wrap up your day";
  };

  const seconds = currentTime.getSeconds();
  const progress = (seconds / 60) * 100;
  // Dash array for a circle is ~ 2 * pi * r. For r=60, circumference is ~377
  const circumference = 377;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-br from-[#0f1015]/80 to-indigo-950/30 rounded-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl overflow-hidden group">
      
      {/* Background Holographic Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

      <div className="flex flex-col items-center md:items-start z-10 mb-6 md:mb-0">
        <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-1">
          {getGreeting()}
        </h3>
        <p className="text-gray-400 text-sm flex items-start gap-2 text-center md:text-left max-w-full">
          <Clock size={14} className="text-indigo-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed break-words">{dateTimeLabel}</span>
        </p>
      </div>

      <div className="relative flex items-center justify-center z-10">
        {/* Holographic Ring */}
        <svg className="absolute w-36 h-36 -rotate-90" viewBox="0 0 140 140">
          <circle 
            cx="70" cy="70" r="60" 
            fill="none" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="3"
          />
          <circle 
            cx="70" cy="70" r="60" 
            fill="none" 
            stroke="url(#gradient)" 
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>

        {/* Digital Time display */}
        <div className="flex flex-col items-center justify-center w-28 h-28 bg-black/40 rounded-full shadow-[inset_0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md border border-white/5 relative">
          <div className="flex items-baseline text-white drop-shadow-[0_0_15px_rgba(167,139,250,0.8)]">
            <span className="text-4xl font-black tracking-tighter">{format(currentTime, 'HH')}</span>
            <motion.span 
              className="text-2xl text-indigo-400 mx-0.5 mb-2"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >:</motion.span>
            <span className="text-4xl font-black tracking-tighter">{format(currentTime, 'mm')}</span>
          </div>
          <span className="text-[9px] text-indigo-300/70 font-semibold tracking-[0.2em] uppercase mt-1">
            {format(currentTime, 'ss')} SEC
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClockWidget;