import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useUser } from '@hooks/user/useUser'
import { User } from '@interfaces/models/User'
import { IPaginatedResult } from '@interfaces/repositories/IRepository'

export const UserList: React.FC = () => {
  const { listUsers, loading, error } = useUser()
  const [users, setUsers] = useState<IPaginatedResult<User> | null>(null)
  const [page, setPage] = useState(0)
  const pageTokensRef = useRef<(unknown | undefined)[]>([undefined])

  const loadUsers = useCallback(async (pageIndex: number): Promise<void> => {
    const result = await listUsers({
      limit: 10,
      startAfter: pageTokensRef.current[pageIndex],
    })
    if (result) {
      setUsers(result)
      if (result.hasMore && pageTokensRef.current.length === pageIndex + 1) {
        pageTokensRef.current = [...pageTokensRef.current, result.lastDoc]
      }
    }
  }, [listUsers])

  useEffect(() => {
    loadUsers(page)
  }, [loadUsers, page])

  const handleNextPage = (): void => {
    if (users?.hasMore) {
      setPage(page + 1)
    }
  }

  const handlePreviousPage = (): void => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  if (loading) return <div>Loading users...</div>
  if (error) return <div className="error-message">Error: {error}</div>
  if (!users || users.data.length === 0) return <div>No users found</div>

  return (
    <div className="user-list">
      <h2>Users ({users.total})</h2>
      
      <table className="user-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.data.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.displayName || '-'}</td>
              <td>{user.metadata?.role || 'user'}</td>
              <td>{user.metadata?.isActive ? 'Active' : 'Inactive'}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button 
          onClick={handlePreviousPage} 
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button 
          onClick={handleNextPage} 
          disabled={!users.hasMore}
        >
          Next
        </button>
      </div>
    </div>
  )
}