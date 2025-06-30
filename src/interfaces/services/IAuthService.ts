import { User } from '../models/User'

export interface IAuthService {
  signUp(email: string, password: string, displayName?: string): Promise<User>
  signIn(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
  verifyEmail(): Promise<void>
  getCurrentUser(): User | null
  onAuthStateChanged(callback: (user: User | null) => void): () => void
  refreshToken(): Promise<string | null>
}