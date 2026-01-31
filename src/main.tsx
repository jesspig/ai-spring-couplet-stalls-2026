import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './style.css'

// GitHub Pages 404 重定向处理（仅在 GitHub Pages 环境中执行）
const l = window.location;
const isGitHubPages = l.hostname.includes('.github.io');

if (isGitHubPages && l.search) {
  const q = l.search.slice(1).split('&').map(v => v.split('='));
  const p = {};
  q.forEach(([k, v]) => { p[k] = decodeURIComponent(v.replace(/\+/g, ' ')); });
  if (p.p) {
    const newPath = p.p.replace(/~and~/g, '&');
    const newUrl = newPath + (p.q ? '?' + p.q.replace(/~and~/g, '&') : '') + l.hash;
    history.replaceState(null, null, newUrl);
  }
}

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <RouterProvider router={router} />
)