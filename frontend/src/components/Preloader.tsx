import { motion, AnimatePresence } from 'framer-motion'
import logo from '@/assets/logo.png'

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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-100/30 rounded-full blur-[100px] -z-10"></div>
          
          <div className="relative flex flex-col items-center">
            {/* Logo Container with floating effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" }
              }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
                className="relative"
              >
                <img src={logo} alt="IntellMeet" className="h-24 sm:h-28 w-auto object-contain relative z-10" />
                
                {/* Center Video Icon Pulse (Simulated Glow) */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.5, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-500 rounded-full blur-3xl -z-10"
                />
              </motion.div>
            </motion.div>

            {/* AI Communication Dotted Line Animation */}
            <div className="mt-12 relative w-64 h-2">
              {/* Track */}
              <div className="absolute inset-0 bg-slate-100 rounded-full"></div>
              
              {/* Animated Dotted Line */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <motion.div 
                  className="flex gap-3 items-center h-full px-2"
                  animate={{
                    x: ["-30%", "30%", "-30%"]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.8)] shrink-0"
                    />
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Loading Status */}
            <div className="mt-10 flex flex-col items-center">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4"
              >
                Connecting Intelligence
              </motion.div>
              
              {/* Progress Bar (Subtle) */}
              <div className="w-32 h-0.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Branding (Optional) */}
          <div className="absolute bottom-12 flex items-center gap-2 opacity-20">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
            <span className="text-[10px] font-black tracking-widest text-slate-900 uppercase">Secure AI Link</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Preloader
