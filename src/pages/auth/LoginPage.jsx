import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logoCovinsa from '@/assets/logo-covinsa.png'

const ERRORES = {
  'Invalid login credentials':   'Correo o contraseña incorrectos.',
  'Email logins are disabled':   'El acceso por correo está deshabilitado.',
  'Email not confirmed':         'Correo no confirmado. Revisa tu bandeja de entrada.',
  'Too many requests':           'Demasiados intentos. Espera unos minutos.',
  'User already registered':     'Este correo ya tiene una cuenta. Inicia sesión.',
}

function traducirError(msg) {
  return ERRORES[msg] ?? msg
}

function TabLogin() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(traducirError(error.message)); setLoading(false) }
    else navigate('/dashboard', { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="perito@ejemplo.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full bg-[#1B2D4E] hover:bg-[#2A4A7F]" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Iniciar sesión
      </Button>
    </form>
  )
}

function TabRegistro() {
  const [nombre,    setNombre]    = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [enviado,   setEnviado]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== password2) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 8)    { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre_perito: nombre.trim() },
      },
    })
    if (error) { setError(traducirError(error.message)); setLoading(false) }
    else setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="text-center space-y-3 py-4">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
        <p className="text-sm font-semibold text-gray-800">Revisa tu correo</p>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Enviamos un enlace de confirmación a <span className="font-medium">{email}</span>.
          Haz clic en él para activar tu cuenta y comenzar tu periodo de prueba.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="reg-nombre">Nombre completo</Label>
        <Input
          id="reg-nombre"
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej. Juan García López"
          required
          autoComplete="name"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="reg-email">Correo electrónico</Label>
        <Input
          id="reg-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="perito@ejemplo.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="reg-password">Contraseña</Label>
        <Input
          id="reg-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="reg-password2">Confirmar contraseña</Label>
        <Input
          id="reg-password2"
          type="password"
          value={password2}
          onChange={e => setPassword2(e.target.value)}
          placeholder="Repite tu contraseña"
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-400">
        Al registrarte obtienes <span className="font-medium text-gray-600">3 expedientes de prueba</span> sin costo.
      </p>

      <Button type="submit" className="w-full bg-[#1B2D4E] hover:bg-[#2A4A7F]" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Crear cuenta gratuita
      </Button>
    </form>
  )
}

export function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('login')

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src={logoCovinsa}
            alt="COVINSA"
            className="h-32 w-auto mx-auto mb-3"
            style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(45%) saturate(700%) hue-rotate(185deg)' }}
          />
          <p className="text-sm text-gray-500 mt-1">Sistema profesional de valuación inmobiliaria</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'login',   label: 'Iniciar sesión' },
              { id: 'registro', label: 'Crear cuenta' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 text-sm py-3 font-medium transition-colors ${
                  tab === t.id
                    ? 'text-[#1B2D4E] border-b-2 border-[#1B2D4E] -mb-px bg-white'
                    : 'text-gray-400 hover:text-gray-600 bg-gray-50/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'login'    && <TabLogin />}
            {tab === 'registro' && <TabRegistro />}
          </div>
        </div>
      </div>
    </div>
  )
}
