import { createRoot } from 'react-dom/client'
import DesignInput from './DesignInput'
import './style.css'
import './DesignInput.css'

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <DesignInput />
)
