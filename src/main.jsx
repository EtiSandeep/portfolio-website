import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SceneProvider } from './context/SceneContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <SceneProvider>
        <App />
      </SceneProvider>
    </ThemeProvider>
  </StrictMode>,
)
