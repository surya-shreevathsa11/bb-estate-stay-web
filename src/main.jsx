import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/variables.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/components.css'
import './styles/sections.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
