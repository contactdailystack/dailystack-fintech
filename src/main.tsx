import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/design-tokens.css'
import './styles/theme.css' // มั่นใจว่าชี้มาที่นี่ที่เดียว ห้ามมี import './index.css' หรือ App.css หลงเหลืออยู่ครับ
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)