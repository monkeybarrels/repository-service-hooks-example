import React, { useState } from 'react'
import { getRepositoryType } from '@config/container'
import { initializeMockData, clearMockData, resetMockData } from '@utils/mockData'

export const RepositorySwitcher: React.FC = () => {
  const [currentRepo] = useState(getRepositoryType())
  const [showDemo, setShowDemo] = useState(false)

  const isLocalStorage = currentRepo === 'localStorage'
  const enableSwitcher = import.meta.env.VITE_ENABLE_REPOSITORY_SWITCHER === 'true'

  if (!enableSwitcher) {
    return null
  }

  const handleRepoChange = (newRepo: string): void => {
    if (newRepo === currentRepo) return
    
    const confirmSwitch = window.confirm(
      `Switch to ${newRepo} repository? This will reload the page and you'll need to sign in again.`
    )
    
    if (confirmSwitch) {
      // Update environment variable simulation
      sessionStorage.setItem('OVERRIDE_REPOSITORY_TYPE', newRepo)
      window.location.reload()
    }
  }

  const handleInitializeDemo = (): void => {
    initializeMockData()
    alert('Demo data initialized! Try logging in with:\n\nEmail: alice@wonderland.com\nPassword: demo123')
  }

  const handleClearDemo = (): void => {
    const confirm = window.confirm('Clear all demo data? This will remove all users and sign you out.')
    if (confirm) {
      clearMockData()
      window.location.reload()
    }
  }

  const handleResetDemo = (): void => {
    const confirm = window.confirm('Reset demo data? This will regenerate fresh demo users.')
    if (confirm) {
      resetMockData()
      alert('Demo data reset! Fresh users generated.')
      window.location.reload()
    }
  }

  return (
    <div className="repository-switcher">
      <div className="repo-info">
        <span className="repo-badge">
          {isLocalStorage ? '💾' : '🔥'} {currentRepo}
        </span>
        <button 
          className="demo-toggle"
          onClick={() => setShowDemo(!showDemo)}
        >
          ⚙️
        </button>
      </div>

      {showDemo && (
        <div className="demo-panel">
          <h4>🎮 Demo Controls</h4>
          
          <div className="repo-selector">
            <h5>Repository Type:</h5>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="repository"
                  value="localStorage"
                  checked={currentRepo === 'localStorage'}
                  onChange={(e) => handleRepoChange(e.target.value)}
                />
                💾 Local Storage (Instant, No Setup)
              </label>
              <label>
                <input
                  type="radio"
                  name="repository"
                  value="firebase"
                  checked={currentRepo === 'firebase'}
                  onChange={(e) => handleRepoChange(e.target.value)}
                />
                🔥 Firebase (Real Backend)
              </label>
            </div>
          </div>

          {isLocalStorage && (
            <div className="demo-controls">
              <h5>Demo Data:</h5>
              <div className="button-group">
                <button onClick={handleInitializeDemo} className="demo-btn init">
                  🎭 Add Demo Users
                </button>
                <button onClick={handleResetDemo} className="demo-btn reset">
                  🔄 Reset Demo Data
                </button>
                <button onClick={handleClearDemo} className="demo-btn clear">
                  🧹 Clear All Data
                </button>
              </div>
              
              <div className="demo-hint">
                <p>💡 <strong>Quick Start:</strong></p>
                <p>📧 Email: alice@wonderland.com</p>
                <p>🔑 Password: demo123</p>
                <p>👑 Alice is an admin user!</p>
              </div>
            </div>
          )}

          {!isLocalStorage && (
            <div className="firebase-info">
              <p>🔥 Firebase mode requires configuration in .env file</p>
              <p>📝 See README.md for setup instructions</p>
            </div>
          )}

          <div className="architecture-info">
            <h5>🏗️ Architecture Benefits:</h5>
            <ul>
              <li>🔄 Same interfaces, different implementations</li>
              <li>🧪 Easy testing with localStorage</li>
              <li>🚀 Production-ready with Firebase</li>
              <li>🎯 Clean dependency injection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}