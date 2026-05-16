import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import logo from '@/assets/logo.png'

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.post(`/auth/verify-email/${token}`)
        setStatus('success')
        setMessage(res.data.message || 'Email verified successfully. You can now log in.')
      } catch (err: any) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Invalid or expired verification token.')
      }
    }

    if (token) {
      verifyEmail()
    } else {
      setStatus('error')
      setMessage('No verification token provided.')
    }
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfe] font-sans overflow-hidden p-6 relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[120px] -z-10"></div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <Link to="/">
            <img src={logo} alt="IntellMeet" className="h-16 w-auto object-contain hover:scale-105 transition-standard" />
          </Link>
        </div>

        <div className="glass-card rounded-[3rem] p-10 sm:p-12 shadow-2xl shadow-indigo-100 border-white/50 relative text-center">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verifying Email</h2>
              <p className="text-slate-500 font-medium">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Email Verified!</h2>
              <p className="text-slate-500 font-medium px-4">{message}</p>
              
              <Link to="/login" className="w-full mt-4 block">
                <Button className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-standard">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verification Failed</h2>
              <p className="text-slate-500 font-medium px-4">{message}</p>
              
              <Link to="/login" className="w-full mt-4 block">
                <Button variant="outline" className="w-full py-7 rounded-2xl font-black text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-standard">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
