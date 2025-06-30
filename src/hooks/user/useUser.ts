import { useState, useCallback } from 'react'
import { getUserService } from '@config/container'
import { User, UpdateUserDTO, UserRole } from '@interfaces/models/User'
import { IQueryOptions, IPaginatedResult } from '@interfaces/repositories/IRepository'
import { UserStats } from '@interfaces/services/IUserService'

interface UseUserReturn {
  loading: boolean
  error: string | null
  getUser: (userId: string) => Promise<User | null>
  getUserByEmail: (email: string) => Promise<User | null>
  updateUser: (userId: string, data: UpdateUserDTO) => Promise<User | null>
  deleteUser: (userId: string) => Promise<void>
  deactivateUser: (userId: string) => Promise<void>
  activateUser: (userId: string) => Promise<void>
  changeUserRole: (userId: string, role: UserRole) => Promise<User | null>
  searchUsers: (searchTerm: string) => Promise<User[]>
  listUsers: (options?: IQueryOptions<User>) => Promise<IPaginatedResult<User> | null>
  getUserStats: () => Promise<UserStats | null>
}

export const useUser = (): UseUserReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userService = getUserService()

  const handleError = (error: unknown): void => {
    const message = error instanceof Error ? error.message : 'An error occurred'
    setError(message)
    console.error('useUser error:', error)
  }

  const getUser = useCallback(
    async (userId: string): Promise<User | null> => {
      try {
        setError(null)
        setLoading(true)
        return await userService.getUser(userId)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const getUserByEmail = useCallback(
    async (email: string): Promise<User | null> => {
      try {
        setError(null)
        setLoading(true)
        return await userService.getUserByEmail(email)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const updateUser = useCallback(
    async (userId: string, data: UpdateUserDTO): Promise<User | null> => {
      try {
        setError(null)
        setLoading(true)
        return await userService.updateUser(userId, data)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const deleteUser = useCallback(
    async (userId: string): Promise<void> => {
      try {
        setError(null)
        setLoading(true)
        await userService.deleteUser(userId)
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const deactivateUser = useCallback(
    async (userId: string): Promise<void> => {
      try {
        setError(null)
        setLoading(true)
        await userService.deactivateUser(userId)
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const activateUser = useCallback(
    async (userId: string): Promise<void> => {
      try {
        setError(null)
        setLoading(true)
        await userService.activateUser(userId)
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const changeUserRole = useCallback(
    async (userId: string, role: UserRole): Promise<User | null> => {
      try {
        setError(null)
        setLoading(true)
        return await userService.changeUserRole(userId, role)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const searchUsers = useCallback(
    async (searchTerm: string): Promise<User[]> => {
      try {
        setError(null)
        setLoading(true)
        return await userService.searchUsers(searchTerm)
      } catch (error) {
        handleError(error)
        return []
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const listUsers = useCallback(
    async (options?: IQueryOptions<User>): Promise<IPaginatedResult<User> | null> => {
      try {
        setError(null)
        setLoading(true)
        return await userService.listUsers(options)
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userService],
  )

  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    try {
      setError(null)
      setLoading(true)
      return await userService.getUserStats()
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [userService])

  return {
    loading,
    error,
    getUser,
    getUserByEmail,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    changeUserRole,
    searchUsers,
    listUsers,
    getUserStats,
  }
}