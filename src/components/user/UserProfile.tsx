import React, { useState } from 'react'
import { useAuth } from '@hooks/auth/useAuth'
import { useUser } from '@hooks/user/useUser'
import { UpdateUserDTO } from '@interfaces/models/User'

export const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const { updateUser, loading, error } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
  })

  if (!user) {
    return <div>Please log in to view your profile</div>
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    const updates: UpdateUserDTO = {
      displayName: formData.displayName,
      photoURL: formData.photoURL,
    }

    try {
      await updateUser(user.id, updates)
      setIsEditing(false)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const handleCancel = (): void => {
    setFormData({
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {error && <div className="error-message">{error}</div>}
      
      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-field">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="profile-field">
            <strong>Display Name:</strong> {user.displayName || 'Not set'}
          </div>
          <div className="profile-field">
            <strong>Photo URL:</strong> {user.photoURL || 'Not set'}
          </div>
          <div className="profile-field">
            <strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}
          </div>
          <div className="profile-field">
            <strong>Role:</strong> {user.metadata?.role || 'user'}
          </div>
          <div className="profile-field">
            <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </div>
          
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="photoURL">Photo URL</label>
            <input
              id="photoURL"
              name="photoURL"
              type="url"
              value={formData.photoURL}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}