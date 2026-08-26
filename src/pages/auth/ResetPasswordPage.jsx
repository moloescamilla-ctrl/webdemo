import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2, KeyRound, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logoCovinsa from '@/assets/logo-covinsa.png'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [listo,     setListo]     = useState(false)
  const [sesionLista, setSesionLista] = useState(false)

  useEffect(() => {
    // Supabase parsea automáticamente el token del hash y dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSesionLista(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== password2) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 8)    { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setListo(true)
    setTimeout(() => navigate('/dashboard', { replace: true }), 2500)
  }

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
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {listo ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
              <p className="text-sm font-semibold text-gray-800">Contraseña actualizada</p>
              <p className="text-xs text-gray-400">Redirigiendo al panel…</p>
            </div>
          ) : !sesionLista ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Verificando enlace…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="h-4 w-4 text-[#1B2D4E]" />
                <h2 className="text-sm font-semibold text-[#1B2D4E]">Nueva contraseña</h2>
              </div>
              <div className="space-y-1">
                <Label htmlFor="np1">Nueva contraseña</Label>
                <Input
                  id="np1"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="np2">Confirmar contraseña</Label>
                <Input
                  id="np2"
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
              <Button type="submit" className="w-full bg-[#1B2D4E] hover:bg-[#2A4A7F]" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Guardar nueva contraseña
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
