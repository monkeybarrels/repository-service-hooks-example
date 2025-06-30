import React, { useEffect } from 'react'
import { useAuth } from '@hooks/auth/useAuth'
import { LoginForm } from '@components/auth/LoginForm'
import { SignUpForm } from '@components/auth/SignUpForm'
import { UserProfile } from '@components/user/UserProfile'
import { UserList } from '@components/user/UserList'
import { ErrorBoundary } from '@components/common/ErrorBoundary'
import { RepositorySwitcher } from '@components/common/RepositorySwitcher'
import { initializeMockData } from '@utils/mockData'
import { getRepositoryType } from '@config/container'
import './App.css'

function App(): React.ReactElement {
  const { user, signOut, loading } = useAuth()
  const [showSignUp, setShowSignUp] = React.useState(false)

  useEffect(() => {
    // Initialize demo data for localStorage repository
    if (getRepositoryType() === 'localStorage') {
      initializeMockData()
    }
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>ServiceHooks - Clean Architecture Demo</h1>
        </header>
        <main className="app-main">
          {showSignUp ? (
            <>
              <SignUpForm />
              <p>
                Already have an account?{' '}
                <button 
                  className="link-button"
                  onClick={() => setShowSignUp(false)}
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <LoginForm />
              <p>
                Don't have an account?{' '}
                <button 
                  className="link-button"
                  onClick={() => setShowSignUp(true)}
                >
                  Sign Up
                </button>
              </p>
            </>
          )}
        </main>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <RepositorySwitcher />
        <header className="app-header">
          <h1>ServiceHooks - Clean Architecture Demo</h1>
          <nav>
            <span>Welcome, {user.displayName || user.email}</span>
            <button onClick={signOut}>Sign Out</button>
          </nav>
        </header>
        <main className="app-main">
          <div className="content-grid">
            <section className="content-section">
              <UserProfile />
            </section>
            {user.metadata?.role === 'admin' && (
              <section className="content-section">
                <UserList />
              </section>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App