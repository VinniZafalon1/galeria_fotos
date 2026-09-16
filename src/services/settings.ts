import { Preferences } from '@capacitor/preferences';

const THEME_KEY = 'theme';

export type Theme = 'light' | 'dark';

export function applyTheme(theme: Theme) {
  document.body.classList.toggle('ion-palette-dark', theme === 'dark');
}

export async function getSavedTheme(): Promise<Theme> {
  const { value } = await Preferences.get({ key: THEME_KEY });
  return value === 'dark' ? 'dark' : 'light';
}

export async function saveTheme(theme: Theme) {
  await Preferences.set({ key: THEME_KEY, value: theme });
  applyTheme(theme);
}
