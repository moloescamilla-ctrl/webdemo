import { useState } from 'react'
import { useAdminUsuarios } from '@/hooks/useAdmin'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { Loader2, RefreshCw, ShieldCheck, ShieldAlert, UserX, UserCheck, ChevronDown, UserPlus, X, Send, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ROLES = ['perito', 'admin', 'superadmin']
const PLANES = ['basico', 'profesional', 'empresa']

const ROLE_BADGE = {
  superadmin: 'bg-[#1B2D4E] text-white',
  admin:      'bg-blue-100 text-blue-700',
  perito:     'bg-gray-100 text-gray-600',
}

const PLAN_BADGE = {
  basico:       'bg-gray-100 text-gray-600',
  profesional:  'bg-indigo-100 text-indigo-700',
  empresa:      'bg-amber-100 text-amber-700',
}

function SelectInline({ value, options, onChange, disabled }) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="text-xs border border-gray-200 rounded px-2 py-1 pr-6 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#1B2D4E] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
    </div>
  )
}

function ModalConfirmarEliminar({ usuario, onCerrar, onEliminado }) {
  const [eliminando, setEliminando] = useState(false)
  const [error,      setError]      = useState(null)

  async function handleEliminar() {
    setEliminando(true)
    setError(null)
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('delete-user', {
        body: { user_id: usuario.id },
      })
      if (fnErr) throw new Error(fnErr.message)
      if (data?.error) throw new Error(data.error)
      onEliminado()
    } catch (e) {
      setError(e.message)
      setEliminando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <h2 className="text-sm font-semibold text-gray-800">Eliminar usuario</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gray-600">
            ¿Eliminar permanentemente la cuenta de <span className="font-semibold">{usuario.nombre || usuario.email}</span>?
          </p>
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            Esta acción es irreversible. Se borrarán el acceso y los datos de autenticación. Los expedientes del usuario permanecerán en la base de datos.
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCerrar} disabled={eliminando}>
            Cancelar
          </Button>
          <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleEliminar} disabled={eliminando}>
            {eliminando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Eliminar cuenta'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilaUsuario({ usuario, onActualizar, onEliminar, isSuperAdmin, esYo }) {
  const [guardando,        setGuardando]        = useState(false)
  const [error,            setError]            = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  const puedeEditar   = !esYo && (isSuperAdmin || usuario.role !== 'superadmin')
  const puedeEliminar = !esYo && (isSuperAdmin || usuario.role === 'perito')

  async function cambiar(campo, valor) {
    setGuardando(true)
    setError(null)
    try {
      await onActualizar(usuario.id, { [campo]: valor })
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  async function toggleActivo() {
    await cambiar('activo', !usuario.activo)
  }

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${!usuario.activo ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
            {usuario.nombre || '(sin nombre)'}
          </span>
          <span className="text-xs text-gray-400 truncate max-w-[180px]">{usuario.email}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        {puedeEditar ? (
          <SelectInline
            value={usuario.role}
            options={isSuperAdmin ? ROLES : ROLES.filter(r => r !== 'superadmin')}
            onChange={v => cambiar('role', v)}
            disabled={guardando}
          />
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[usuario.role] ?? ROLE_BADGE.perito}`}>
            {usuario.role}
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        {puedeEditar ? (
          <SelectInline
            value={usuario.plan}
            options={PLANES}
            onChange={v => cambiar('plan', v)}
            disabled={guardando}
          />
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_BADGE[usuario.plan] ?? PLAN_BADGE.basico}`}>
            {usuario.plan}
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-xs text-gray-600 text-right">
        {puedeEditar ? (
          <input
            type="number"
            min="1"
            max="9999"
            defaultValue={usuario.limite_expedientes_mes}
            onBlur={e => {
              const val = parseInt(e.target.value)
              if (val > 0 && val !== usuario.limite_expedientes_mes) cambiar('limite_expedientes_mes', val)
            }}
            disabled={guardando}
            className="w-16 text-xs border border-gray-200 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-[#1B2D4E] disabled:opacity-50"
          />
        ) : (
          <span>{usuario.limite_expedientes_mes}</span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {usuario.activo ? (
            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <UserCheck className="h-3 w-3" />Activo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              <UserX className="h-3 w-3" />Inactivo
            </span>
          )}
          {puedeEditar && (
            <button
              onClick={toggleActivo}
              disabled={guardando}
              title={usuario.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
              className="text-gray-400 hover:text-[#1B2D4E] transition-colors disabled:opacity-40"
            >
              {usuario.activo
                ? <ShieldAlert className="h-4 w-4" />
                : <ShieldCheck className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </td>

      <td className="px-4 py-3 text-xs text-gray-400">
        {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
      </td>

      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          {guardando && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1B2D4E]" />}
          {esYo && <span className="text-xs text-gray-300 italic">tú</span>}
          {puedeEliminar && !guardando && (
            <button
              onClick={() => setConfirmarEliminar(true)}
              title="Eliminar usuario"
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {confirmarEliminar && (
          <ModalConfirmarEliminar
            usuario={usuario}
            onCerrar={() => setConfirmarEliminar(false)}
            onEliminado={() => { setConfirmarEliminar(false); onEliminar?.() }}
          />
        )}
      </td>
    </tr>
  )
}

function ModalInvitar({ onCerrar, onInvitado }) {
  const [email,     setEmail]     = useState('')
  const [nombre,    setNombre]    = useState('')
  const [enviando,  setEnviando]  = useState(false)
  const [error,     setError]     = useState(null)
  const [exito,     setExito]     = useState(false)

  async function handleEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('invite-user', {
        body: { email: email.trim(), nombre: nombre.trim() },
      })
      if (fnErr) throw new Error(fnErr.message)
      if (data?.error) throw new Error(data.error)
      setExito(true)
      onInvitado?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#1B2D4E]">Invitar nuevo perito</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {exito ? (
          <div className="px-5 py-6 text-center space-y-2">
            <Send className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-gray-800">Invitación enviada</p>
            <p className="text-xs text-gray-400">
              Se envió un correo a <span className="font-medium">{email}</span> con el enlace para activar su cuenta.
            </p>
            <Button size="sm" className="mt-3 bg-[#1B2D4E] hover:bg-[#2A4A7F]" onClick={onCerrar}>
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleEnviar} className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Nombre del perito</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Juan García López"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B2D4E]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Correo electrónico <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="perito@ejemplo.com"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B2D4E]"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}
            <p className="text-xs text-gray-400">
              El perito recibirá un correo con un enlace para establecer su contraseña.
            </p>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onCerrar} disabled={enviando}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="flex-1 bg-[#1B2D4E] hover:bg-[#2A4A7F]" disabled={enviando || !email.trim()}>
                {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Enviar invitación'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export function AdminUsuariosPage() {
  const { usuarios, loading, error, cargar, actualizarUsuario } = useAdminUsuarios()
  const { profile, isSuperAdmin } = useProfile()
  const [mostrarInvitar, setMostrarInvitar] = useState(false)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-[#1B2D4E]">Gestión de Usuarios</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-[#1B2D4E] hover:bg-[#2A4A7F] flex items-center gap-1.5"
            onClick={() => setMostrarInvitar(true)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invitar perito
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={cargar}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {mostrarInvitar && (
        <ModalInvitar
          onCerrar={() => setMostrarInvitar(false)}
          onInvitado={() => { cargar(); setMostrarInvitar(false) }}
        />
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Límite/mes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Registro</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <FilaUsuario
                    key={u.id}
                    usuario={u}
                    onActualizar={actualizarUsuario}
                    onEliminar={cargar}
                    isSuperAdmin={isSuperAdmin}
                    esYo={profile?.id === u.id}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {!usuarios.length && (
            <div className="text-center py-12 text-sm text-gray-400">
              No hay usuarios registrados.
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Cambios en rol, plan y estado se aplican de inmediato. Los usuarios con cuenta inactiva
        no pueden acceder a sus expedientes.
      </p>
    </div>
  )
}
