import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Desvanecer el splash después de que React monte
const splash = document.getElementById('splash')
if (splash) {
  setTimeout(() => {
    splash.classList.add('fade-out')
    setTimeout(() => splash.remove(), 460)
  }, 700)
}
