import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import logo from '@/assets/logo.png'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mockResetUrl, setMockResetUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.data.resetUrl) {
        setMockResetUrl(response.data.resetUrl)
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
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
            Secure Account Recovery
          </div>
          <h1 className="text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Regain access to <br />
            <span className="text-gradient-ai">your meetings.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            Enter your email to receive a secure password reset link.
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

      {/* Right Side - Forgot Password Form */}
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
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Reset Password</h2>
              <p className="text-slate-500 font-medium">We'll send you a link to reset it.</p>
            </div>

            {success ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-6 rounded-3xl text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-xl text-indigo-900">Check your email</h3>
                  <p className="text-sm font-medium">
                    If an account exists for <span className="font-bold">{email}</span>, you will receive a password reset link shortly.
                  </p>
                  
                  {mockResetUrl && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-left">
                      <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Dev Mode: Direct Reset</p>
                      <a href={mockResetUrl} target="_blank" rel="noopener noreferrer">
                        <Button type="button" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold">
                          Click to Reset Password
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
                
                <Link to="/login" className="block text-center mt-8">
                  <Button variant="outline" className="w-full py-7 rounded-2xl font-black text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-standard">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
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

                <Button
                  type="submit"
                  className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-standard group relative overflow-hidden"
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? 'Sending Link...' : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </form>
            )}

            <p className="mt-10 text-center text-slate-500 font-medium">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-indigo-600 font-black hover:text-indigo-700 transition-standard border-b-2 border-indigo-100 hover:border-indigo-600"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
