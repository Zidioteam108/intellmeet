import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import logo from '@/assets/logo.png'

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please try again.')
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
            Secure Update
          </div>
          <h1 className="text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Create your new <br />
            <span className="text-gradient-ai">password.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            Choose a strong password to protect your IntellMeet account.
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

      {/* Right Side - Reset Password Form */}
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
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Update Password</h2>
              <p className="text-slate-500 font-medium">Please enter your new password below.</p>
            </div>

            {success ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-3xl text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-xl text-emerald-900">Password Updated</h3>
                  <p className="text-sm font-medium">
                    Your password has been successfully reset. Redirecting to login...
                  </p>
                </div>
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
                  <Label htmlFor="password" title="New Password" className="text-slate-700 font-bold ml-1 text-sm">New Password</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" title="Confirm Password" className="text-slate-700 font-bold ml-1 text-sm">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 py-7 bg-white/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-standard font-medium placeholder:text-slate-300"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
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
                    {isLoading ? 'Updating...' : (
                      <>
                        Update Password
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
