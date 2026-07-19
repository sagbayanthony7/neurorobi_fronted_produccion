import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.onerror = (message, source, lineno, colno, error) => {
  const el = document.getElementById('root')!
  el.innerHTML = `<div style="padding:24px;font-family:monospace;color:#fff;background:#1e1e1e;min-height:100vh;white-space:pre-wrap;overflow:auto">
<h2 style="color:#f87171">Window Error</h2>
<p>${String(message)}</p>
<p style="color:#94a3b8">${source}:${lineno}:${colno}</p>
<pre style="color:#fbbf24">${error?.stack || ''}</pre>
</div>`
}

window.addEventListener('unhandledrejection', (e) => {
  const el = document.getElementById('root')!
  el.innerHTML = `<div style="padding:24px;font-family:monospace;color:#fff;background:#1e1e1e;min-height:100vh;white-space:pre-wrap;overflow:auto">
<h2 style="color:#f87171">Unhandled Promise Rejection</h2>
<pre style="color:#fbbf24">${String(e.reason?.stack || e.reason)}</pre>
</div>`
})

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return <div style={{padding:24,fontFamily:'monospace',color:'#fff',background:'#1e1e1e',minHeight:'100vh',whiteSpace:'pre-wrap',overflow:'auto'}}>
        <h2 style={{color:'#f87171'}}>React Error Boundary</h2>
        <pre style={{color:'#fbbf24'}}>{this.state.error.stack}</pre>
      </div>
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
