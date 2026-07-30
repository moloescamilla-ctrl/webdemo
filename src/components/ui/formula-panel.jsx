import { useState } from 'react'
import { ChevronDown, ChevronUp, Sigma } from 'lucide-react'

export function FormulaPanel({ grupos }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-left transition-colors"
      >
        <Sigma className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="text-sm font-medium text-amber-800">Fórmulas del método</span>
        {open
          ? <ChevronUp className="h-4 w-4 ml-auto text-amber-500" />
          : <ChevronDown className="h-4 w-4 ml-auto text-amber-500" />
        }
      </button>

      {open && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((g, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">{g.titulo}</p>
              <pre className="text-xs font-mono text-amber-900 whitespace-pre-wrap leading-snug bg-white border border-amber-200 rounded px-3 py-2">
                {g.formula}
              </pre>
              {g.nota && (
                <p className="text-[11px] text-amber-700 italic leading-snug">{g.nota}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
