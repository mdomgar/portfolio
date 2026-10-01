import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'
import { detectTier, readDeviceInfo } from './scene/quality'
import { useSceneStore } from './store/sceneStore'

useSceneStore.getState().setTier(detectTier(readDeviceInfo()))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
