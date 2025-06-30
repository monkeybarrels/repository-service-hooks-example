import { User, UserRole } from '@interfaces/models/User'

const funNames = [
  'Alice Wonderland', 'Bob Builder', 'Charlie Chaplin', 'Diana Prince',
  'Ethan Hunt', 'Fiona Shrek', 'Gordon Freeman', 'Harry Potter',
  'Iris West', 'Jack Sparrow', 'Katniss Everdeen', 'Luke Skywalker',
  'Mary Poppins', 'Neo Anderson', 'Olivia Pope', 'Peter Parker',
  'Quinn Fabray', 'Rey Skywalker', 'Steve Rogers', 'Tony Stark',
]

const funEmails = [
  'alice@wonderland.com', 'bob@construction.com', 'charlie@comedy.com', 'diana@themyscira.com',
  'ethan@impossible.com', 'fiona@swamp.com', 'gordon@blackmesa.com', 'harry@hogwarts.com',
  'iris@centralcity.com', 'jack@pirate.com', 'katniss@district12.com', 'luke@rebellion.com',
  'mary@magical.com', 'neo@matrix.com', 'olivia@gladiator.com', 'peter@spider.com',
  'quinn@glee.com', 'rey@resistance.com', 'steve@shield.com', 'tony@stark.com',
]

const funAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Gordon',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Harry',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Iris',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Katniss',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luke',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Rey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Steve',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Tony',
]

const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const getRandomRole = (): UserRole => {
  const roles: UserRole[] = ['user', 'admin', 'guest']
  const weights = [0.7, 0.2, 0.1] // 70% user, 20% admin, 10% guest
  
  const random = Math.random()
  let cumWeight = 0
  
  for (let i = 0; i < roles.length; i++) {
    cumWeight += weights[i]
    if (random <= cumWeight) {
      return roles[i]
    }
  }
  
  return 'user'
}

export const generateMockUser = (index: number): User => {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
  
  const createdAt = getRandomDate(sixMonthsAgo, now)
  const lastLoginAt = getRandomDate(createdAt, now)
  
  return {
    id: `mock_user_${index + 1}`,
    email: funEmails[index],
    displayName: funNames[index],
    photoURL: funAvatars[index],
    emailVerified: Math.random() > 0.3, // 70% verified
    createdAt,
    updatedAt: createdAt,
    metadata: {
      isActive: Math.random() > 0.1, // 90% active
      role: getRandomRole(),
      lastLoginAt,
      signInProvider: 'password',
      preferences: {
        theme: Math.random() > 0.5 ? 'dark' : 'light',
        language: 'en',
        notifications: {
          email: Math.random() > 0.3,
          push: Math.random() > 0.5,
          sms: Math.random() > 0.7,
        },
      },
    },
  }
}

export const generateMockUsers = (count: number = 20): User[] => {
  const users: User[] = []
  
  for (let i = 0; i < Math.min(count, funNames.length); i++) {
    users.push(generateMockUser(i))
  }
  
  return users
}

export const initializeMockData = (): void => {
  const shouldInitialize = import.meta.env.VITE_ENABLE_DEMO_DATA === 'true'
  
  if (!shouldInitialize) {
    return
  }
  
  // Check if data already exists
  const existingData = localStorage.getItem('servicehooks_users')
  if (existingData) {
    const users = JSON.parse(existingData)
    if (users.length > 0) {
      console.log('📦 Demo data already exists, skipping initialization')
      return
    }
  }
  
  console.log('🎭 Initializing fun demo data...')
  
  const mockUsers = generateMockUsers(20)
  localStorage.setItem('servicehooks_users', JSON.stringify(mockUsers))
  
  // Create passwords for mock users (demo only!)
  mockUsers.forEach((user) => {
    const password = 'demo123' // Simple password for demo
    const hashedPassword = btoa(password)
    localStorage.setItem(`password_${user.id}`, hashedPassword)
  })
  
  console.log('✨ Demo data initialized! You can log in with any of these accounts:')
  console.log('📧 Email: any of the fun emails (e.g., alice@wonderland.com)')
  console.log('🔑 Password: demo123')
  console.log('🎯 Try: alice@wonderland.com / demo123 (Admin user)')
  
  // Make Alice an admin for demo purposes
  const users = JSON.parse(localStorage.getItem('servicehooks_users') || '[]')
  if (users.length > 0) {
    users[0].metadata.role = 'admin'
    localStorage.setItem('servicehooks_users', JSON.stringify(users))
  }
}

export const clearMockData = (): void => {
  localStorage.removeItem('servicehooks_users')
  localStorage.removeItem('servicehooks_current_user')
  
  // Clear all password entries
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('password_')) {
      localStorage.removeItem(key)
    }
  })
  
  console.log('🧹 Demo data cleared!')
}

export const resetMockData = (): void => {
  clearMockData()
  initializeMockData()
}