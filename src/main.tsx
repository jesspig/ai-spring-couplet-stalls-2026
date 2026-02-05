import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './styles/main.scss'

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <RouterProvider router={router} />
)