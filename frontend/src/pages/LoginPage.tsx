import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import logo from '@/assets/logo.png'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isNotVerified, setIsNotVerified] = useState(false)
  const [mockVerifyUrl, setMockVerifyUrl] = useState('')
  const location = useLocation()
  const returnUrl = new URLSearchParams(location.search).get('returnUrl') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      const { user, accessToken } = response.data
      setAuth(user, accessToken)
      
      const searchParams = new URLSearchParams(location.search)
      const returnUrl = searchParams.get('returnUrl') || '/dashboard'
      navigate(returnUrl)
    } catch (err: any) {
      if (err.response?.data?.isNotVerified) {
        setIsNotVerified(true)
        if (err.response.data.verifyUrl) {
          setMockVerifyUrl(err.response.data.verifyUrl)
        }
        setError('')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#fbfbfe] font-sans overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[120px] -z-10"></div>

      {/* Left Side - Visual Content (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16">
        <div className="flex items-center">
          <Link to="/">
            <img src={logo} alt="IntellMeet" className="h-16 w-auto object-contain hover:scale-105 transition-standard" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white text-indigo-600 text-xs font-black uppercase tracking-widest mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI-Driven Intelligence
          </div>
          <h1 className="text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Unlock the power of <br />
            <span className="text-gradient-ai">your meetings.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            Sign in to access your AI summaries, tasks, and meeting analytics.
          </p>
        </div>

        <div className="flex items-center gap-8 text-slate-400">
          <div className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            SOC2 Compliant
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            End-to-End Encrypted
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        <div className="w-full max-w-md">
          
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex flex-col items-center mb-12">
            <Link to="/">
              <img src={logo} alt="IntellMeet" className="h-16 w-auto object-contain" />
            </Link>
          </div>

          <div className="glass-card rounded-[3rem] p-10 sm:p-12 shadow-2xl shadow-indigo-100 border-white/50 relative">
            
            {/* LARGE LOGO (Desktop) */}
            <div className="hidden lg:flex justify-center mb-10">
              <Link to="/">
                <img src={logo} alt="IntellMeet" className="h-20 w-auto object-contain hover:scale-110 transition-standard" />
              </Link>
            </div>

            <div className="text-center lg:text-left mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 font-medium">Continue your meeting journey with AI</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {isNotVerified && (
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-5 py-4 rounded-2xl text-sm font-bold flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Mail className="w-5 h-5 text-indigo-600" /></div>
                    <p>Account not verified. We've sent a new verification link to your email. Please check your inbox.</p>
                  </div>
                  {mockVerifyUrl && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                      <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider mb-1.5">Dev Mode</p>
                      <a href={mockVerifyUrl} target="_blank" rel="noopener noreferrer">
                        <Button type="button" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold h-9 text-xs">
                          Click to Verify
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-sm">Email address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-12 py-7 bg-white/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-standard font-medium placeholder:text-slate-300"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" title="Password" className="text-slate-700 font-bold text-sm">Password</Label>
                  <Link to="/forgot-password" title="Forgot Password" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-standard">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-12 py-7 bg-white/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-standard font-medium placeholder:text-slate-300"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-standard group relative overflow-hidden"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? 'Authenticating...' : (
                    <>
                      Sign in to Dashboard
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </form>

            <p className="mt-10 text-center text-slate-500 font-medium">
              New to IntellMeet?{' '}
              <Link
                to={returnUrl ? `/signup?returnUrl=${encodeURIComponent(returnUrl)}` : '/signup'}
                className="text-indigo-600 font-black hover:text-indigo-700 transition-standard border-b-2 border-indigo-100 hover:border-indigo-600"
              >
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage