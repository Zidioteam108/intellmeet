import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Mail, User as UserIcon, Shield, Sparkles, CheckCircle2, ChevronRight, AlertCircle, LogOut } from 'lucide-react'

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()

  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Name cannot be empty')
      return
    }

    setIsSaving(true)
    // Simulated API call - Logic will be on Day 9
    setTimeout(() => {
      console.log('Avatar file ready for upload:', avatarFile)
      updateUser({ name: name.trim(), bio: bio.trim() })
      setSuccessMsg('Profile settings updated successfully.')
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="w-full lg:max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">
            <Shield className="w-3.5 h-3.5" />
            Account Security Verified
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Manage your personal presence and account settings.</p>
        </div>

        <Button 
          onClick={() => {
            const { clearAuth } = useAuthStore.getState()
            clearAuth()
            window.location.href = '/'
          }}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-8 py-7 rounded-2xl font-black text-sm flex items-center gap-3 transition-standard active:scale-95 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          LOGOUT SESSION
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column - Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative inline-block mb-6">
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-indigo-100 group-hover:rotate-3 transition-transform duration-500">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-5xl font-black">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl cursor-pointer transition-standard hover:scale-110 active:scale-95">
                <Camera className="w-6 h-6" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1">{user?.name}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{user?.role || 'Pro Member'}</p>
            
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-600 tracking-tight">AI Accuracy Index: 98.4%</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <h4 className="text-lg font-bold mb-4 relative z-10">Subscription</h4>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-indigo-300 font-bold">Pro Plan</span>
              <span className="text-2xl font-black">$29/mo</span>
            </div>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-sm font-bold transition-standard">
              Manage Billing
            </button>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
            <form onSubmit={handleSave} className="space-y-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-2">
                <h3 className="text-xl font-extrabold text-slate-900">Personal Information</h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Settings</div>
              </div>

              {successMsg && (
                <div className="bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 animate-in zoom-in-95 duration-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 animate-in zoom-in-95 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-bold">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-slate-900 font-bold ml-1">Display Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      className="pl-12 py-7 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500 transition-standard font-medium"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-900 font-bold ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-12 py-7 bg-slate-100/50 border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed font-medium"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="bio" className="text-slate-900 font-bold ml-1">Professional Bio</Label>
                <textarea
                  id="bio"
                  className="w-full p-5 bg-slate-50/50 border border-slate-200 rounded-[2rem] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-standard font-medium min-h-[140px] resize-none placeholder:text-slate-400"
                  placeholder="Tell your team about yourself..."
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                  maxLength={200}
                />
                <div className="flex justify-end pr-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${bio.length > 180 ? 'text-red-400' : 'text-slate-400'}`}>
                    {bio.length} / 200 Characters
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium max-w-xs">
                  Updates to your profile will be visible to your team members in meetings.
                </p>
                <Button 
                  type="submit" 
                  disabled={isSaving} 
                  className="px-10 py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-100 transition-standard active:scale-95 group"
                >
                  {isSaving ? 'Updating...' : (
                    <>
                      Save Changes
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProfilePage
