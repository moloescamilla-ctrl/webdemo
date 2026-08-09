import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const TIMEOUT_MS  = 15 * 60 * 1000  // 15 minutos sin actividad → logout
const WARN_BEFORE = 2  * 60 * 1000  // avisar 2 minutos antes

export function useInactivityLogout({ onWarn, onLogout }) {
  const logoutTimer = useRef(null)
  const warnTimer   = useRef(null)

  const doLogout = useCallback(async () => {
    onLogout?.()
    try {
      await supabase.auth.signOut()
    } catch {
      // Si falla el signOut remoto, la sesión local ya fue limpiada
    }
    window.location.replace('/login')
  }, [onLogout])

  const reset = useCallback(() => {
    clearTimeout(logoutTimer.current)
    clearTimeout(warnTimer.current)
    onWarn?.(false)

    warnTimer.current  = setTimeout(() => onWarn?.(true), TIMEOUT_MS - WARN_BEFORE)
    logoutTimer.current = setTimeout(doLogout, TIMEOUT_MS)
  }, [doLogout, onWarn])

  useEffect(() => {
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    EVENTS.forEach(ev => window.addEventListener(ev, reset, { passive: true }))
    reset()
    return () => {
      EVENTS.forEach(ev => window.removeEventListener(ev, reset))
      clearTimeout(logoutTimer.current)
      clearTimeout(warnTimer.current)
    }
  }, [reset])

  return { reset }
}
