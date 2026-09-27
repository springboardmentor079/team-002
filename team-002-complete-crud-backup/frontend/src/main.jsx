import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/themes.css'
import App from './App.jsx'
import ThemeSwitcher from './components/common/ThemeSwitcher'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ThemeSwitcher />
  </StrictMode>,
)

