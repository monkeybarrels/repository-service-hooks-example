import { UserRepository } from '@repositories/user/UserRepository'
import { LocalStorageUserRepository } from '@repositories/user/LocalStorageUserRepository'
import { AuthService } from '@services/auth/AuthService'
import { LocalStorageAuthService } from '@services/auth/LocalStorageAuthService'
import { UserService } from '@services/user/UserService'
import { IUserRepository } from '@interfaces/repositories/IUserRepository'
import { IAuthService } from '@interfaces/services/IAuthService'
import { IUserService } from '@interfaces/services/IUserService'

class DIContainer {
  private static instance: DIContainer
  private services: Map<string, unknown> = new Map()

  private constructor() {
    this.registerServices()
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  private registerServices(): void {
    // Allow runtime override via sessionStorage (for demo purposes)
    const repositoryType = sessionStorage.getItem('OVERRIDE_REPOSITORY_TYPE') || 
                          import.meta.env.VITE_REPOSITORY_TYPE || 
                          'localStorage'
    
    // Repositories - choose based on environment
    let userRepository: IUserRepository
    
    if (repositoryType === 'firebase') {
      userRepository = new UserRepository()
    } else {
      userRepository = new LocalStorageUserRepository()
    }
    
    this.register<IUserRepository>('UserRepository', userRepository)

    // Services - choose auth service based on repository type
    if (repositoryType === 'firebase') {
      this.register<IAuthService>(
        'AuthService',
        new AuthService(userRepository),
      )
    } else {
      this.register<IAuthService>(
        'AuthService',
        new LocalStorageAuthService(userRepository as LocalStorageUserRepository),
      )
    }
    
    this.register<IUserService>(
      'UserService',
      new UserService(userRepository),
    )
    
    // Store repository type for runtime access
    this.register<string>('RepositoryType', repositoryType)
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service)
  }

  get<T>(key: string): T {
    const service = this.services.get(key)
    if (!service) {
      throw new Error(`Service ${key} not found in container`)
    }
    return service as T
  }
}

export const container = DIContainer.getInstance()

// Export convenience functions
export const getUserRepository = (): IUserRepository =>
  container.get<IUserRepository>('UserRepository')

export const getAuthService = (): IAuthService =>
  container.get<IAuthService>('AuthService')

export const getUserService = (): IUserService =>
  container.get<IUserService>('UserService')

export const getRepositoryType = (): string =>
  container.get<string>('RepositoryType')