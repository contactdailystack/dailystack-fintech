import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/design-tokens.css'
import './styles/animations.css'
import App from './App.tsx'

async function bootstrap() {
  // MSW temporarily disabled for debugging
  // if (import.meta.env.DEV) {
  //   try {
  //     const { worker } = await import('./mocks/browser');
  //     await worker.start({ onUnhandledRequest: 'bypass' });
  //   } catch (err) {
  //     console.warn('MSW worker failed to start, continuing without mocks', err);
  //   }
  // }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap();