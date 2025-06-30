export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

export const isValidDisplayName = (displayName: string): boolean => {
  return displayName.length >= 2 && displayName.length <= 50
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

export const validateUserInput = (data: {
  email?: string
  password?: string
  displayName?: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format')
  }

  if (data.password && !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters long')
  }

  if (data.displayName && !isValidDisplayName(data.displayName)) {
    errors.push('Display name must be between 2 and 50 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}