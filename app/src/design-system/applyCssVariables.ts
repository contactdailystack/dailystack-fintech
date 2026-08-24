import { cssVariables } from './color-tokens';

/**
 * Apply design-system CSS variables to :root so runtime theming works.
 * This keeps tokens authoritative in TypeScript and available for CSS.
 */
function applyDesignSystemCssVariables() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  const root = document.documentElement;
  Object.entries(cssVariables).forEach(([key, value]) => {
    try {
      root.style.setProperty(key, value as string);
    } catch {
      // ignore invalid values
    }
  });
}

export { cssVariables };
export default applyDesignSystemCssVariables;
