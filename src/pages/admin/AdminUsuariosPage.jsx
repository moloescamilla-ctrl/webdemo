import { useState } from 'react'
import { useAdminUsuarios } from '@/hooks/useAdmin'
import { useProfile } from '@/hooks/useProfile'
import { Loader2, RefreshCw, ShieldCheck, ShieldAlert, UserX, UserCheck, ChevronDown } from 'lucide-react'
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

function FilaUsuario({ usuario, onActualizar, isSuperAdmin, esYo }) {
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState(null)

  const puedeEditar = !esYo && (isSuperAdmin || usuario.role !== 'superadmin')

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
        {guardando && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1B2D4E] mx-auto" />}
        {esYo && <span className="text-xs text-gray-300 italic">tú</span>}
      </td>
    </tr>
  )
}

export function AdminUsuariosPage() {
  const { usuarios, loading, error, cargar, actualizarUsuario } = useAdminUsuarios()
  const { profile, isSuperAdmin } = useProfile()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-[#1B2D4E]">Gestión de Usuarios</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
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
