import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import {
  DocumentData,
  getDocs,
  query,
  where,
  limit as firestoreLimit,
} from 'firebase/firestore'
import { auth } from '@config/firebase'
import { BaseRepository } from '../BaseRepository'
import { IUserRepository } from '@interfaces/repositories/IUserRepository'
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserMetadata,
} from '@interfaces/models/User'
import { IQueryOptions, IPaginatedResult } from '@interfaces/repositories/IRepository'

export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  constructor() {
    super('users')
  }

  protected toModel(data: DocumentData): User {
    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      metadata: data.metadata || {
        isActive: true,
        role: 'user',
      },
    }
  }

  protected toFirestore(data: Partial<User>): DocumentData {
    const firestoreData: DocumentData = {}

    if (data.email !== undefined) firestoreData.email = data.email
    if (data.displayName !== undefined)
      firestoreData.displayName = data.displayName
    if (data.photoURL !== undefined) firestoreData.photoURL = data.photoURL
    if (data.emailVerified !== undefined)
      firestoreData.emailVerified = data.emailVerified
    if (data.metadata !== undefined) firestoreData.metadata = data.metadata

    return firestoreData
  }

  async createWithAuth(data: CreateUserDTO): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    )
    const firebaseUser = userCredential.user

    if (data.displayName) {
      await updateProfile(firebaseUser, { displayName: data.displayName })
    }

    const user: Partial<User> = {
      id: firebaseUser.uid,
      email: firebaseUser.email || data.email,
      displayName: data.displayName || null,
      photoURL: null,
      emailVerified: firebaseUser.emailVerified,
      metadata: {
        isActive: true,
        role: 'user',
        lastLoginAt: new Date(),
        signInProvider: userCredential.providerId || 'password',
      },
    }

    return await this.create(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const q = query(this.collection, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return this.toModel({ ...doc.data(), id: doc.id })
  }

  async updateProfile(userId: string, data: UpdateUserDTO): Promise<User> {
    const updateData: Partial<User> = {}

    if (data.displayName !== undefined)
      updateData.displayName = data.displayName
    if (data.photoURL !== undefined) updateData.photoURL = data.photoURL
    if (data.metadata !== undefined) {
      const existingUser = await this.findById(userId)
      if (existingUser) {
        updateData.metadata = {
          ...existingUser.metadata,
          ...data.metadata,
        } as UserMetadata
      }
    }

    if (auth.currentUser && auth.currentUser.uid === userId) {
      const profileUpdate: { displayName?: string; photoURL?: string } = {}
      if (data.displayName !== undefined)
        profileUpdate.displayName = data.displayName
      if (data.photoURL !== undefined) profileUpdate.photoURL = data.photoURL

      if (Object.keys(profileUpdate).length > 0) {
        await updateProfile(auth.currentUser, profileUpdate)
      }
    }

    return await this.update(userId, updateData)
  }

  async deactivate(userId: string): Promise<void> {
    await this.update(userId, {
      metadata: {
        isActive: false,
      } as UserMetadata,
    })
  }

  async activate(userId: string): Promise<void> {
    await this.update(userId, {
      metadata: {
        isActive: true,
      } as UserMetadata,
    })
  }

  async exists(userId: string): Promise<boolean> {
    const user = await this.findById(userId)
    return user !== null
  }

  async queryPaginated(
    options: IQueryOptions<User>,
  ): Promise<IPaginatedResult<User>> {
    const constraints = this.buildQuery(options)
    const paginatedLimit = options.limit || 10

    const q = query(
      this.collection,
      ...constraints,
      firestoreLimit(paginatedLimit + 1),
    )
    const querySnapshot = await getDocs(q)

    const data = querySnapshot.docs
      .slice(0, paginatedLimit)
      .map((doc) => this.toModel({ ...doc.data(), id: doc.id }))

    const hasMore = querySnapshot.docs.length > paginatedLimit
    const lastDoc = hasMore
      ? querySnapshot.docs[paginatedLimit - 1]
      : undefined

    const countQuery = query(this.collection, ...constraints.filter(c => 
      !c.toString().includes('limit') && !c.toString().includes('startAfter')
    ))
    const countSnapshot = await getDocs(countQuery)
    const total = countSnapshot.size

    return {
      data,
      total,
      hasMore,
      lastDoc,
    }
  }
}