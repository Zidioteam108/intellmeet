import { motion, AnimatePresence } from 'framer-motion'

interface PreloaderProps {
  isLoading: boolean
}

const Preloader = ({ isLoading }: PreloaderProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-100/30 rounded-full blur-[100px] -z-10"></div>
          
          <div className="relative flex flex-col items-center">
            
            {/* ── IntellMeet Logo ── */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 30 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" }
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative"
              >
                {/* Logo text instead of image for animation control */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                    <span className="text-white font-black text-2xl sm:text-3xl">I</span>
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Intell<span className="text-indigo-600">Meet</span>
                  </span>
                </div>
                
                {/* Glow behind logo */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500 rounded-full blur-3xl -z-10"
                />
              </motion.div>
            </motion.div>

            {/* ── Two Persons Connected by Animated Dotted Line ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } }}
              className="mt-12 flex items-center gap-0 relative"
            >
              {/* Person A (Left) */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-500/30 border-2 border-white">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Host</span>
              </motion.div>

              {/* Animated Dotted Line Between Two Persons */}
              <div className="relative w-32 sm:w-44 h-8 mx-2 overflow-hidden">
                {/* Static dotted track (faded) */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-between px-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  ))}
                </div>

                {/* Animated dots: Left to Right */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
                  animate={{ x: ['-10%', '110%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_14px_rgba(79,70,229,0.9)]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.7)] opacity-70" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(79,70,229,0.5)] opacity-40" />
                </motion.div>

                {/* Animated dots: Right to Left */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
                  animate={{ x: ['110%', '-10%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(147,51,234,0.5)] opacity-40" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.7)] opacity-70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_14px_rgba(147,51,234,0.9)]" />
                </motion.div>

                {/* Center pulse effect */}
                <motion.div
                  animate={{ scale: [0.5, 1.5, 0.5], opacity: [0, 0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full blur-md"
                />
              </div>

              {/* Person B (Right) */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-xl shadow-purple-500/30 border-2 border-white">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Guest</span>
              </motion.div>
            </motion.div>

            {/* ── Loading Status ── */}
            <div className="mt-10 flex flex-col items-center">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4"
              >
                Establishing Secure Link
              </motion.div>
              
              {/* Progress Bar */}
              <div className="w-36 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Bottom Branding */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2, transition: { delay: 0.5 } }}
            className="absolute bottom-12 flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
            <span className="text-[10px] font-black tracking-widest text-slate-900 uppercase">AI-Powered Meetings</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Preloader
