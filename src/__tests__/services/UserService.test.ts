import { UserService } from '@services/user/UserService'
import { IUserRepository } from '@interfaces/repositories/IUserRepository'
import { User, UserRole } from '@interfaces/models/User'

describe('UserService', () => {
  let userService: UserService
  let mockUserRepository: jest.Mocked<IUserRepository>

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      isActive: true,
      role: 'user',
    },
  }

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createWithAuth: jest.fn(),
      findByEmail: jest.fn(),
      updateProfile: jest.fn(),
      deactivate: jest.fn(),
      activate: jest.fn(),
      query: jest.fn(),
      queryPaginated: jest.fn(),
      exists: jest.fn(),
    }

    userService = new UserService(mockUserRepository)
  })

  describe('getUser', () => {
    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser)

      const result = await userService.getUser('123')

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.findById).toHaveBeenCalledWith('123')
    })

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      await expect(userService.getUser('123')).rejects.toThrow(
        'User with id 123 not found',
      )
    })
  })

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser)

      const result = await userService.getUserByEmail('test@example.com')

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      )
    })

    it('should throw error when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null)

      await expect(
        userService.getUserByEmail('test@example.com'),
      ).rejects.toThrow('User with email test@example.com not found')
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      mockUserRepository.exists.mockResolvedValue(true)
      mockUserRepository.updateProfile.mockResolvedValue(mockUser)

      const updateData = { displayName: 'Updated Name' }
      const result = await userService.updateUser('123', updateData)

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.exists).toHaveBeenCalledWith('123')
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(
        '123',
        updateData,
      )
    })

    it('should throw error when user not found', async () => {
      mockUserRepository.exists.mockResolvedValue(false)

      await expect(
        userService.updateUser('123', { displayName: 'Updated' }),
      ).rejects.toThrow('User with id 123 not found')
    })
  })

  describe('changeUserRole', () => {
    it('should change user role successfully', async () => {
      const updatedUser = { ...mockUser, metadata: { ...mockUser.metadata, role: 'admin' as UserRole, isActive: true } }
      mockUserRepository.findById.mockResolvedValue(mockUser)
      mockUserRepository.updateProfile.mockResolvedValue(updatedUser)

      const result = await userService.changeUserRole('123', 'admin')

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith('123', {
        metadata: expect.objectContaining({ role: 'admin' }),
      })
    })
  })

  describe('searchUsers', () => {
    it('should search by email when search term contains @', async () => {
      mockUserRepository.query.mockResolvedValue([mockUser])

      const result = await userService.searchUsers('test@example.com')

      expect(result).toEqual([mockUser])
      expect(mockUserRepository.query).toHaveBeenCalledWith({
        where: [
          {
            field: 'email',
            operator: '==',
            value: 'test@example.com',
          },
        ],
      })
    })

    it('should search all users when search term does not contain @', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser])

      const result = await userService.searchUsers('test')

      expect(result).toEqual([mockUser])
      expect(mockUserRepository.findAll).toHaveBeenCalled()
    })
  })

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', async () => {
      const users: User[] = [
        { ...mockUser, metadata: { isActive: true, role: 'admin' } },
        { ...mockUser, id: '456', metadata: { isActive: true, role: 'user' } },
        { ...mockUser, id: '789', metadata: { isActive: false, role: 'user' } },
      ]
      mockUserRepository.findAll.mockResolvedValue(users)

      const result = await userService.getUserStats()

      expect(result).toEqual({
        totalUsers: 3,
        activeUsers: 2,
        inactiveUsers: 1,
        usersByRole: { admin: 1, user: 2, guest: 0 },
        recentSignups: 3,
      })
    })
  })
})