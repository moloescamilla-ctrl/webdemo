import { useState } from 'react'
import { cn } from '@/lib/utils'

function addCommas(val) {
  if (val === '' || val == null) return ''
  const parts = String(val).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

function stripCommas(str) {
  const raw = String(str).replace(/,/g, '').replace(/[^0-9.]/g, '')
  const dotIdx = raw.indexOf('.')
  if (dotIdx === -1) return raw
  return raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '')
}

export function NumericInput({ value, onChange, name, className, placeholder = '0', ...props }) {
  const [focused, setFocused] = useState(false)

  const handleChange = (e) => {
    const clean = stripCommas(e.target.value)
    onChange?.({ target: { name, value: clean } })
  }

  return (
    <input
      {...props}
      name={name}
      type="text"
      inputMode="decimal"
      value={focused ? (value ?? '') : addCommas(value ?? '')}
      onChange={handleChange}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
      placeholder={placeholder}
      className={cn(
        'flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  )
}
