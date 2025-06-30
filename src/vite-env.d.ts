/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPOSITORY_TYPE: 'localStorage' | 'firebase'
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
  readonly VITE_ENABLE_DEMO_DATA: string
  readonly VITE_ENABLE_REPOSITORY_SWITCHER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}