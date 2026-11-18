'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Building2, Home, Moon, Sun } from 'lucide-react';

type Theme = 'normal' | 'gotham';
const storageKey = 'ah-crm-theme';
const ThemeContext = createContext<{ theme: Theme; changeTheme: (theme: Theme) => void }>({ theme: 'gotham', changeTheme: () => {} });
export const useCrmTheme = () => useContext(ThemeContext);

export function CrmThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('gotham');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const saved = localStorage.getItem(storageKey); if (saved === 'normal' || saved === 'gotham') setTheme(saved); } catch { /* Preference storage is optional. */ }
    setReady(true);
    const sync = (event: StorageEvent) => { if (event.key === storageKey && (event.newValue === 'normal' || event.newValue === 'gotham')) setTheme(event.newValue); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const changeTheme = (value: Theme) => {
    setTheme(value);
    try { localStorage.setItem(storageKey, value); } catch { /* Switching still works without persistence. */ }
  };
  return <ThemeContext.Provider value={{ theme, changeTheme }}><div data-crm-theme={theme} style={ready ? undefined : { visibility: 'hidden' }}>{children}</div></ThemeContext.Provider>;
}

export function ThemeSwitch() {
  const { theme, changeTheme } = useCrmTheme();
  return <label className="theme-switch" title="Mudar o visual. A escolha fica guardada neste navegador.">{theme === 'normal' ? <Sun size={16} aria-hidden="true"/> : <Moon size={16} aria-hidden="true"/>}<select aria-label="Visual do CRM" value={theme} onChange={e => changeTheme(e.target.value as Theme)}><option value="normal">Normal</option><option value="gotham">Gotham</option></select></label>;
}

export function BrandMark() {
  const { theme } = useCrmTheme();
  return theme === 'gotham' ? <img src="/logo.png" alt="AH"/> : <span className="normal-brand-mark" aria-hidden="true"><Building2 size={24}/></span>;
}

export function EmptyIllustration({ normal = 'keys' }: { normal?: 'keys' | 'home' }) {
  const { theme } = useCrmTheme();
  if (theme === 'normal' && normal === 'home') return <Home size={25} aria-hidden="true"/>;
  return <img className={`empty-3d${theme === 'gotham' ? ' empty-kryptonite' : ''}`} src={`/images/crm/${theme === 'gotham' ? 'kryptonite' : 'key-copper'}.webp`} width={112} height={112} alt="" loading="lazy" decoding="async"/>;
}
