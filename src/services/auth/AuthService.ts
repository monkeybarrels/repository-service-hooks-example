import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@config/firebase'
import { IAuthService } from '@interfaces/services/IAuthService'
import { User } from '@interfaces/models/User'
import { IUserRepository } from '@interfaces/repositories/IUserRepository'

export class AuthService implements IAuthService {
  private currentUser: User | null = null

  constructor(private userRepository: IUserRepository) {
    this.initializeAuthListener()
  }

  private initializeAuthListener(): void {
    firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.userRepository.findById(firebaseUser.uid)
        this.currentUser = user
      } else {
        this.currentUser = null
      }
    })
  }

  async signUp(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<User> {
    try {
      const user = await this.userRepository.createWithAuth({
        email,
        password,
        displayName,
      })

      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser)
      }

      this.currentUser = user
      return user
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Sign up failed: ${error.message}`)
      }
      throw new Error('Sign up failed')
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )
      
      const user = await this.userRepository.findById(userCredential.user.uid)
      if (!user) {
        throw new Error('User data not found')
      }

      await this.userRepository.updateProfile(user.id, {
        metadata: {
          lastLoginAt: new Date(),
        },
      })

      this.currentUser = user
      return user
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Sign in failed: ${error.message}`)
      }
      throw new Error('Sign in failed')
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
      this.currentUser = null
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Sign out failed: ${error.message}`)
      }
      throw new Error('Sign out failed')
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password reset failed: ${error.message}`)
      }
      throw new Error('Password reset failed')
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password update failed: ${error.message}`)
      }
      throw new Error('Password update failed')
    }
  }

  async verifyEmail(): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      await sendEmailVerification(auth.currentUser)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Email verification failed: ${error.message}`)
      }
      throw new Error('Email verification failed')
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.userRepository.findById(firebaseUser.uid)
        callback(user)
      } else {
        callback(null)
      }
    })

    return unsubscribe
  }

  async refreshToken(): Promise<string | null> {
    if (!auth.currentUser) {
      return null
    }

    try {
      const token = await auth.currentUser.getIdToken(true)
      return token
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return null
    }
  }
}