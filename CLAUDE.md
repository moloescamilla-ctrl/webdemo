# COVINSA Avalúos — Contexto técnico

Aplicación web para peritos valuadores inmobiliarios en México. Genera, gestiona y exporta expedientes de avalúo bajo normas SHF/INDAABIN.

**Regla absoluta:** El nombre "ABBA" nunca debe aparecer en texto visible por el usuario. La marca es **COVINSA** (Construcción, Valuación e Ingeniería). Todos los textos de la UI deben estar en **español**.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19.2.7 + Vite 8 + Tailwind CSS v4 |
| Router | react-router-dom 7.6.1 |
| Auth / DB | Supabase (PostgreSQL + PostgREST + Auth JWT) |
| Storage | Supabase Storage (fotos de expediente) |
| PDF | @react-pdf/renderer 4.3.0 |
| UI | Radix UI (8 paquetes) + lucide-react + shadcn-style components |
| Deploy | Vercel (auto-deploy desde `main`) |
| API externa | INEGI DENUE (establecimientos cercanos) |

## Colores de marca

- Primario: `#1B2D4E` (navy COVINSA)
- Secundario: `#2A4A7F`

## Rutas principales

```
/login                              LoginPage (pública)
/dashboard                          Panel de inicio
/expedientes                        Lista de expedientes
/expedientes/nuevo                  Nuevo avalúo completo
/expedientes/nuevo?modo=rapido      Calculadora Rápida (tipo calculo_rapido)
/expedientes/:id                    Detalle + PDF (solo avalúos)
/expedientes/:id/editar             Editor multi-pestaña (9 tabs)
/expedientes/:id/captura-comparables Gestión de comparables
/capturar                           Captura desde portales
/revisar/:token                     Revisión de pares (requiere auth)
```

Todas las rutas excepto `/login` están protegidas por `ProtectedRoute`.

## Tipos de expediente

El campo `expedientes.tipo_expediente` controla el comportamiento:

- `'avaluo'` — flujo completo, 9 pestañas, genera PDF, aparece en sección "Mis Avalúos"
- `'calculo_rapido'` — solo pestañas Datos + Físico, sin PDF, sin botón Editar en detalle, listado en sección "Cálculos Rápidos"

Se activa desde Dashboard con `?modo=rapido` en `NuevoExpedientePage`.

## Pestañas de EditarExpedientePage

`datos` | `entorno` | `terreno` | `construccion` | `fisico` | `rentas` | `residual` | `comparativo` | `fotos`

Para `calculo_rapido`: solo `datos` y `fisico` son visibles (filtrado en la misma página con `useEffect` que corrige el tab activo).

## Base de datos — tablas principales

```
expedientes              — perito_id, folio, tipo_expediente, valor_concluido, metodo_adoptado
entorno_inmueble         — expediente_id, zona, servicios, DENUE
caracteristicas_terreno  — expediente_id, dimensiones, colindancias (JSON)
inspecciones_fisicas     — expediente_id, datos de inspección
descripcion_construccion — expediente_id, descripción por componente
metodos_fisicos          — expediente_id, Ross-Heidecke
metodos_comparativos     — expediente_id, homologación de mercado
metodos_rentas           — expediente_id, capitalización rentas
metodos_residual         — expediente_id, método residual
costos_construccion_m2   — tabulador COVINSA por categoría
fotos_expediente         — expediente_id, url, categoria
comparables_capturados   — buffer de captura desde portales
compartidos              — token UUID para revisión de pares
revisiones_expediente    — estado: pendiente/aprobado/rechazado
comentarios_revision     — por sección
profiles                 — perito: nombre, cédula, firma_url
folio_contador           — secuencia por año (SECURITY DEFINER)
denue_establecimientos   — caché de INEGI
```

## Seguridad (RLS)

Cada expediente tiene `perito_id = auth.uid()`. Política FOR ALL en `expedientes`. Tablas relacionadas usan subquery: `expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid())`.

Funciones `SECURITY DEFINER` para: generación de folios y lectura de expedientes compartidos por token.

Migraciones SQL en `/sql/` numeradas del 04 al 22. Son idempotentes. La migración 22 (`22_rls_audit_y_tipo_expediente.sql`) agrega `tipo_expediente` y audita RLS — **ya ejecutada en producción**.

## Variables de entorno

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Configuradas en Vercel (no están en el repo).

## Convenciones de código

- Componentes en `src/pages/` y `src/components/`
- `@/` resuelve a `src/` (alias Vite)
- Tailwind v4 (no v3) — usar sintaxis de plugin Vite, no `tailwind.config.js`
- Sin TypeScript — todo JSX
- Radix UI para primitivos de accesibilidad (Dialog, Select, Tabs, etc.)
