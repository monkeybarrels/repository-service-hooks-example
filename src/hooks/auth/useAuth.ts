import { useState, useEffect, useCallback } from 'react'
import { getAuthService } from '@config/container'
import { User } from '@interfaces/models/User'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  verifyEmail: () => Promise<void>
  refreshToken: () => Promise<string | null>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const authService = getAuthService()

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [authService])

  const handleError = (error: unknown): void => {
    const message = error instanceof Error ? error.message : 'An error occurred'
    setError(message)
    throw error
  }

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      try {
        setError(null)
        setLoading(true)
        const newUser = await authService.signUp(email, password, displayName)
        setUser(newUser)
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    },
    [authService],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null)
        setLoading(true)
        const loggedInUser = await authService.signIn(email, password)
        setUser(loggedInUser)
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    },
    [authService],
  )

  const signOut = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      await authService.signOut()
      setUser(null)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [authService])

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setError(null)
        await authService.resetPassword(email)
      } catch (error) {
        handleError(error)
      }
    },
    [authService],
  )

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        setError(null)
        await authService.updatePassword(newPassword)
      } catch (error) {
        handleError(error)
      }
    },
    [authService],
  )

  const verifyEmail = useCallback(async () => {
    try {
      setError(null)
      await authService.verifyEmail()
    } catch (error) {
      handleError(error)
    }
  }, [authService])

  const refreshToken = useCallback(async () => {
    try {
      setError(null)
      return await authService.refreshToken()
    } catch (error) {
      handleError(error)
      return null
    }
  }, [authService])

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    verifyEmail,
    refreshToken,
  }
}