import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import logo from '@/assets/logo.png'

const SignupPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const location = useLocation()
  const returnUrl = new URLSearchParams(location.search).get('returnUrl') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
      })

      const { user, accessToken } = response.data
      setAuth(user, accessToken)
      
      const searchParams = new URLSearchParams(location.search)
      const returnUrl = searchParams.get('returnUrl') || '/dashboard'
      navigate(returnUrl)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#fbfbfe] font-sans overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[120px] -z-10 animate-pulse"></div>

      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <Link to="/">
              <img src={logo} alt="IntellMeet" className="h-16 w-auto object-contain" />
            </Link>
          </div>

          <div className="glass-card rounded-[3rem] p-10 sm:p-12 shadow-2xl shadow-indigo-100 border-white/50">
            
            {/* LARGE LOGO (Desktop) */}
            <div className="hidden lg:flex justify-center mb-10">
              <Link to="/">
                <img src={logo} alt="IntellMeet" className="h-20 w-auto object-contain hover:scale-110 transition-standard" />
              </Link>
            </div>

            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Create Account</h2>
              <p className="text-slate-500 font-medium">Join the future of intelligent meetings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-bold ml-1 text-sm">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-12 py-6 bg-white/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-standard font-medium"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-sm">Email address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-12 py-6 bg-white/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-standard font-medium"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" title="Password" className="text-slate-700 font-bold ml-1 text-sm">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 py-6 bg-white/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-standard font-medium"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" title="Confirm Password" className="text-slate-700 font-bold ml-1 text-sm">Confirm</Label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 py-6 bg-white/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-standard font-medium"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 py-4">
                <input type="checkbox" id="terms" className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" required />
                <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed font-medium">
                  I agree to the <span className="text-indigo-600 font-bold underline">Terms of Service</span> and <span className="text-indigo-600 font-bold underline">Privacy Policy</span>.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-standard group relative overflow-hidden mt-2"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? 'Creating account...' : (
                    <>
                      Get Started for Free
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </form>

            <p className="mt-8 text-center text-slate-500 font-medium">
              Already have an account?{' '}
              <Link
                to={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
                className="text-indigo-600 font-black hover:text-indigo-700 transition-standard border-b-2 border-indigo-100 hover:border-indigo-600"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Features/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 items-center justify-center p-16">
        {/* Animated Background Elements */}
        <div className="absolute top-[20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500 blur-[130px] opacity-40"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600 blur-[110px] opacity-30"></div>
        
        <div className="relative z-10 w-full max-w-xl">
          <div className="mb-12 flex items-center">
            <Link to="/">
              <img src={logo} alt="IntellMeet" className="h-12 w-auto object-contain opacity-90" />
            </Link>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-12 leading-tight tracking-tight">
            Elevate your team's <br /> productivity with <br /> <span className="text-indigo-300">Intelligent Meetings</span>
          </h2>

          <div className="space-y-6">
            {[
              { title: 'Automated Summaries', desc: 'Get concise meeting minutes generated instantly by our AI.', icon: Sparkles },
              { title: 'Sentiment Analysis', desc: 'Understand team dynamics with deep emotional insights.', icon: CheckCircle2 },
              { title: 'Task Extraction', desc: 'Never miss an action item with automated task tracking.', icon: ShieldCheck },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-standard">
                <div className="mt-1 p-2 rounded-xl bg-indigo-400/20 text-indigo-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage