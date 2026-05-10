export const APP_CONFIG = {
  APP_NAME: 'Velora Journal',
  DEFAULT_THEME: 'dark',
  THEME_STORAGE_KEY: 'velora-theme',
}

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://blog-backend-mueu.onrender.com',
  AUTH_TOKEN_KEY: 'velora_token',
  AUTH_USER_KEY: 'velora_user',
}

export const PLACEHOLDERS = {
  AVATAR:
    'https://images.unsplash.com/photo-1516534775068-bb6c2ff74b3f?q=80&w=2670&auto=format&fit=crop',
}
