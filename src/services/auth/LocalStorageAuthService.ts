import { IAuthService } from '@interfaces/services/IAuthService'
import { User } from '@interfaces/models/User'
import { LocalStorageUserRepository } from '@repositories/user/LocalStorageUserRepository'
import { AuthenticationError, ValidationError } from '@utils/errors'
import { validateUserInput } from '@utils/validation'

export class LocalStorageAuthService implements IAuthService {
  private currentUser: User | null = null
  private authListeners: Array<(user: User | null) => void> = []

  constructor(private userRepository: LocalStorageUserRepository) {
    this.initializeAuth()
  }

  private initializeAuth(): void {
    // Check if user is already logged in
    this.currentUser = this.userRepository.getCurrentAuthUser()
    this.notifyAuthListeners()
  }

  private notifyAuthListeners(): void {
    this.authListeners.forEach(callback => callback(this.currentUser))
  }

  async signUp(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<User> {
    try {
      // Validate input
      const validation = validateUserInput({ email, password, displayName })
      if (!validation.isValid) {
        throw new ValidationError(validation.errors.join(', '))
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email)
      if (existingUser) {
        throw new ValidationError('An account with this email already exists')
      }

      const user = await this.userRepository.createWithAuth({
        email,
        password,
        displayName,
      })

      this.currentUser = user
      this.notifyAuthListeners()
      return user
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new AuthenticationError(`Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      // Validate input
      const validation = validateUserInput({ email, password })
      if (!validation.isValid) {
        throw new ValidationError(validation.errors.join(', '))
      }

      const user = await this.userRepository.authenticateUser(email, password)
      if (!user) {
        throw new AuthenticationError('Invalid email or password')
      }

      if (!user.metadata?.isActive) {
        throw new AuthenticationError('Account is deactivated. Please contact support.')
      }

      this.currentUser = user
      this.notifyAuthListeners()
      return user
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error
      }
      throw new AuthenticationError(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async signOut(): Promise<void> {
    try {
      this.userRepository.signOut()
      this.currentUser = null
      this.notifyAuthListeners()
    } catch (error) {
      throw new AuthenticationError(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email)
      if (!user) {
        // Don't reveal if email exists for security
        return
      }

      // In a real app, you would send an email
      // For demo purposes, we'll just generate a new password and store it
      const newPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = btoa(newPassword)
      localStorage.setItem(`password_${user.id}`, hashedPassword)

      // In a real app, you would email this to the user
      console.log(`Password reset for ${email}. New password: ${newPassword}`)
      alert(`Demo: New password for ${email} is: ${newPassword}`)
    } catch (error) {
      throw new AuthenticationError(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new AuthenticationError('No authenticated user')
    }

    try {
      const validation = validateUserInput({ password: newPassword })
      if (!validation.isValid) {
        throw new ValidationError(validation.errors.join(', '))
      }

      const hashedPassword = btoa(newPassword)
      localStorage.setItem(`password_${this.currentUser.id}`, hashedPassword)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new AuthenticationError(`Password update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async verifyEmail(): Promise<void> {
    if (!this.currentUser) {
      throw new AuthenticationError('No authenticated user')
    }

    try {
      // Simulate email verification
      const updatedUser = await this.userRepository.update(this.currentUser.id, {
        emailVerified: true,
      })

      this.currentUser = updatedUser
      this.notifyAuthListeners()

      alert(`Demo: Email verified for ${this.currentUser.email}`)
    } catch (error) {
      throw new AuthenticationError(`Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback)

    // Immediately call with current state
    callback(this.currentUser)

    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(callback)
      if (index > -1) {
        this.authListeners.splice(index, 1)
      }
    }
  }

  async refreshToken(): Promise<string | null> {
    if (!this.currentUser) {
      return null
    }

    // Simulate token refresh
    const token = btoa(JSON.stringify({
      userId: this.currentUser.id,
      email: this.currentUser.email,
      timestamp: Date.now(),
    }))

    return token
  }
}