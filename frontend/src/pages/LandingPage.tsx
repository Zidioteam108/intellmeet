import { Link } from 'react-router-dom'
import { Sparkles, BrainCircuit, Zap, CheckCircle2, ArrowRight, Video, MessageSquare, Shield } from 'lucide-react'
import logo from '@/assets/logo.png'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden font-sans">
      
      {/* ── NAVIGATION ─────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="hover:scale-105 transition-standard">
            <img src={logo} alt="IntellMeet" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 px-3 sm:px-4 py-2 transition-standard">
            Sign In
          </Link>
          <Link to="/signup" className="hidden xs:flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 transition-standard">
            Get Started Free
          </Link>
          
          {/* Mobile Menu Toggle (Simplified for now) */}
          <button className="lg:hidden p-2 text-slate-600">
             <div className="w-6 h-0.5 bg-slate-900 mb-1.5 rounded-full"></div>
             <div className="w-6 h-0.5 bg-slate-900 mb-1.5 rounded-full"></div>
             <div className="w-6 h-0.5 bg-slate-900 rounded-full"></div>
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-purple-200/30 rounded-full blur-[100px] -z-10"></div>

        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest animate-float">
            <Sparkles className="w-4 h-4" />
            Empowering 10,000+ teams worldwide
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Meetings that <span className="text-gradient-ai">think for themselves.</span>
          </h1>

          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Stop losing hours to manual notes. IntellMeet uses advanced AI to transcribe, summarize, and extract action items from your meetings in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/signup" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-standard flex items-center justify-center gap-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-lg shadow-sm hover:bg-slate-50 transition-standard">
              Watch Demo
            </button>
          </div>

          {/* Social Proof Placeholder */}
          <div className="pt-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-40 grayscale">
              <div className="text-2xl font-black text-slate-900">MICROSOFT</div>
              <div className="text-2xl font-black text-slate-900">GOOGLE</div>
              <div className="text-2xl font-black text-slate-900">AIRBNB</div>
              <div className="text-2xl font-black text-slate-900">SLACK</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything you need to <span className="text-indigo-600">execute.</span></h2>
            <p className="text-slate-500 font-medium text-lg">AI-powered tools designed to make your workflow seamless.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Real-time Transcription', 
                desc: 'Highly accurate multi-speaker transcription in over 50 languages.',
                icon: MessageSquare,
                color: 'indigo'
              },
              { 
                title: 'AI Smart Summaries', 
                desc: 'Get concise, context-aware summaries of every meeting automatically.',
                icon: BrainCircuit,
                color: 'purple'
              },
              { 
                title: 'Sentiment Analysis', 
                desc: 'Understand the emotional tone and team engagement of your sessions.',
                icon: Zap,
                color: 'cyan'
              },
              { 
                title: 'Task Automation', 
                desc: 'Action items are automatically detected and synced to your task manager.',
                icon: CheckCircle2,
                color: 'green'
              },
              { 
                title: 'HD Video Recording', 
                desc: 'Cloud-based recording with instant playback and sharing capabilities.',
                icon: Video,
                color: 'blue'
              },
              { 
                title: 'Enterprise Security', 
                desc: 'End-to-end encryption and GDPR compliance for all your data.',
                icon: Shield,
                color: 'slate'
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-50 flex items-center justify-center text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="relative overflow-hidden bg-indigo-600 rounded-[3rem] p-12 sm:p-20 text-center shadow-2xl shadow-indigo-200">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <h2 className="relative z-10 text-4xl sm:text-5xl font-black text-white mb-8">
              Ready to transform <br /> your meetings?
            </h2>
            <p className="relative z-10 text-indigo-100 text-lg mb-10 max-w-xl mx-auto font-medium">
              Join thousands of professionals who are saving 10+ hours every week with IntellMeet AI.
            </p>
            <Link to="/signup" className="relative z-10 inline-flex items-center justify-center px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-standard">
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center grayscale opacity-50">
            <img src={logo} alt="IntellMeet" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 IntellMeet AI Inc.</p>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage
