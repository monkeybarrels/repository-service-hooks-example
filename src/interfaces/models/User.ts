export interface User {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  metadata?: UserMetadata
}

export interface UserMetadata {
  lastLoginAt?: Date
  signInProvider?: string
  isActive: boolean
  role?: UserRole
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  notifications?: NotificationPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface CreateUserDTO {
  email: string
  password: string
  displayName?: string
}

export interface UpdateUserDTO {
  displayName?: string
  photoURL?: string
  metadata?: Partial<UserMetadata>
}