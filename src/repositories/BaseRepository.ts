import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  CollectionReference,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@config/firebase'
import { IRepository, IQueryOptions, WhereFilterOp } from '@interfaces/repositories/IRepository'

export abstract class BaseRepository<T extends { id: string }>
  implements IRepository<T>
{
  protected collection: CollectionReference<DocumentData>

  constructor(protected collectionName: string) {
    this.collection = collection(db, collectionName)
  }

  protected abstract toModel(data: DocumentData): T
  protected abstract toFirestore(data: Partial<T>): DocumentData

  async create(data: Partial<T>): Promise<T> {
    const id = data.id || doc(this.collection).id
    const timestamp = Timestamp.now()
    const firestoreData = {
      ...this.toFirestore(data),
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await setDoc(doc(this.collection, id), firestoreData)
    return this.toModel({ ...firestoreData, id })
  }

  async findById(id: string): Promise<T | null> {
    const docRef = doc(this.collection, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return this.toModel({ ...docSnap.data(), id: docSnap.id })
  }

  async findAll(): Promise<T[]> {
    const querySnapshot = await getDocs(this.collection)
    return querySnapshot.docs.map((doc) =>
      this.toModel({ ...doc.data(), id: doc.id }),
    )
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const docRef = doc(this.collection, id)
    const updateData = {
      ...this.toFirestore(data),
      updatedAt: Timestamp.now(),
    }

    await updateDoc(docRef, updateData)
    const updated = await this.findById(id)
    if (!updated) {
      throw new Error(`Document with id ${id} not found`)
    }
    return updated
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.collection, id))
  }

  protected buildQuery(options: IQueryOptions<T>): QueryConstraint[] {
    const constraints: QueryConstraint[] = []

    if (options.where) {
      options.where.forEach((condition) => {
        constraints.push(
          where(
            condition.field as string,
            condition.operator as WhereFilterOp,
            condition.value,
          ),
        )
      })
    }

    if (options.orderBy) {
      constraints.push(
        orderBy(
          options.orderBy.field as string,
          options.orderBy.direction,
        ),
      )
    }

    if (options.limit) {
      constraints.push(limit(options.limit))
    }

    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter))
    }

    return constraints
  }

  async query(options: IQueryOptions<T>): Promise<T[]> {
    const constraints = this.buildQuery(options)
    const q = query(this.collection, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) =>
      this.toModel({ ...doc.data(), id: doc.id }),
    )
  }
}