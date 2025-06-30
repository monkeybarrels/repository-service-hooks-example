# ServiceHooks - Clean React Firebase Architecture

A comprehensive, production-ready React repository demonstrating clean architecture principles with Firebase integration. This project serves as a reference implementation for building scalable, maintainable React applications using TypeScript.

## 🏗️ Architecture Overview

This project implements a clean architecture pattern with clear separation of concerns:

```
src/
├── components/     # React components (presentation layer)
├── hooks/          # Custom React hooks (application layer)
├── services/       # Business logic layer
├── repositories/   # Data access layer
├── interfaces/     # TypeScript interfaces and types
├── config/         # Configuration files
├── pages/          # Page components
└── utils/          # Utility functions
```

### Key Principles

- **Dependency Inversion**: Higher-level modules don't depend on lower-level modules
- **Single Responsibility**: Each class/module has one reason to change
- **Interface Segregation**: Clients depend only on interfaces they use
- **Separation of Concerns**: Clear boundaries between layers

## 🚀 Features

- **🏗️ Clean Architecture Implementation**
  - Repository pattern for data access
  - Service layer for business logic
  - Custom hooks for React integration
  - Dependency injection container

- **👤 User Management System**
  - Authentication (sign up, sign in, sign out)
  - User profile management
  - Role-based access control
  - User search and listing

- **💾 Dual Repository Support**
  - **localStorage** (default) - Instant setup, no configuration
  - **Firebase** - Production-ready cloud backend
  - Runtime switching between repositories
  - Same interfaces, different implementations

- **🎭 Fun Demo Experience**
  - Pre-generated mock users with fun names
  - Interactive repository switcher
  - Demo data management tools
  - Quick login credentials

- **🛠️ Modern Tech Stack**
  - React 18+ with TypeScript
  - Firebase 9+ (Modular SDK)
  - Vite for blazing fast builds
  - Jest & React Testing Library

- **👨‍💻 Developer Experience**
  - Strict TypeScript configuration
  - ESLint + Prettier setup
  - Husky pre-commit hooks
  - GitHub Actions CI/CD
  - Path aliases for clean imports

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ServiceHooks.git
cd ServiceHooks
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

### 🚀 Quick Start (localStorage)

No configuration needed! Just run:
```bash
npm run dev
```

The app will start with localStorage repository and demo data. Try logging in with:
- **Email:** alice@wonderland.com
- **Password:** demo123
- **Role:** Admin (can see user management)

### 🔥 Firebase Setup (Optional)

To use Firebase instead of localStorage:

1. Update your `.env` file:
```env
VITE_REPOSITORY_TYPE=firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

2. Set up Firebase project:
   - Create a new Firebase project
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Copy configuration to `.env`

## 🛠️ Development

Start the development server:
```bash
npm run dev
```

### 🎮 Interactive Demo Features

- **Repository Switcher**: Toggle between localStorage and Firebase (top-right corner)
- **Demo Data Controls**: Generate, reset, or clear mock users
- **Fun Mock Users**: 20 pre-generated users with themed names and avatars
- **Admin Access**: Alice (alice@wonderland.com) has admin privileges

Other available commands:
```bash
npm run build         # Build for production
npm run preview       # Preview production build
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript compiler
```

## 🏛️ Architecture Layers

### 🎯 Repository Pattern Demonstration

This project showcases how the same interfaces can work with completely different data sources:

| Feature | localStorage | Firebase |
|---------|-------------|----------|
| Setup | ✅ Zero config | 🔧 Requires setup |
| Persistence | 🖥️ Browser only | ☁️ Cloud sync |
| Real-time | ❌ No | ✅ Yes |
| Scalability | 👤 Single user | 🌍 Multi-user |
| Demo Data | 🎭 Built-in | 🚫 Manual |
| Best For | 🧪 Development/Testing | 🚀 Production |

### 🏗️ Layer Implementation

### 1. Repository Layer
Pure data access layer with multiple implementations:

```typescript
// Firebase Implementation
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  async createWithAuth(data: CreateUserDTO): Promise<User> {
    // Firebase interaction logic
  }
}

// localStorage Implementation  
export class LocalStorageUserRepository implements IUserRepository {
  async createWithAuth(data: CreateUserDTO): Promise<User> {
    // localStorage interaction logic
  }
}
```

### 2. Service Layer
Business logic implementation:

```typescript
// src/services/user/UserService.ts
export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}
  
  async updateUser(userId: string, data: UpdateUserDTO): Promise<User> {
    // Business logic and validation
  }
}
```

### 3. Hook Layer
React integration layer:

```typescript
// src/hooks/auth/useAuth.ts
export const useAuth = (): UseAuthReturn => {
  const authService = getAuthService()
  // React state management and side effects
}
```

### 4. Component Layer
Presentation components:

```typescript
// src/components/auth/LoginForm.tsx
export const LoginForm: React.FC = () => {
  const { signIn, loading, error } = useAuth()
  // UI logic
}
```

## 🔧 Configuration

### Repository Selection

Choose your data source via environment variables:

```env
# localStorage (default) - No setup required
VITE_REPOSITORY_TYPE=localStorage

# Firebase - Requires Firebase project setup
VITE_REPOSITORY_TYPE=firebase

# Demo features
VITE_ENABLE_DEMO_DATA=true
VITE_ENABLE_REPOSITORY_SWITCHER=true
```

### TypeScript Configuration
Strict TypeScript settings with path aliases:

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      // ... other aliases
    }
  }
}
```

### ESLint Configuration
Comprehensive linting rules for code quality:

```javascript
{
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    // ... other rules
  }
}
```

## 🧪 Testing

The project includes a comprehensive testing setup:

```typescript
// src/__tests__/services/UserService.test.ts
describe('UserService', () => {
  it('should update user successfully', async () => {
    // Test implementation
  })
})
```

Run tests:
```bash
npm run test
npm run test:coverage
```

## 🚢 CI/CD

GitHub Actions workflow for continuous integration:

- Runs on push to main/develop branches
- Tests on multiple Node.js versions
- Linting and type checking
- Security audit
- Code coverage reporting

## 🎭 Demo Users

When using localStorage, the app comes with 20 fun pre-generated users:

| Email | Password | Role | Character |
|-------|----------|------|----------|
| alice@wonderland.com | demo123 | admin | Alice in Wonderland |
| bob@construction.com | demo123 | user | Bob the Builder |
| charlie@comedy.com | demo123 | user | Charlie Chaplin |
| diana@themyscira.com | demo123 | user | Wonder Woman |
| harry@hogwarts.com | demo123 | user | Harry Potter |
| ... and 15 more! | demo123 | various | Various characters |

**🎯 Quick Demo:** Use `alice@wonderland.com` / `demo123` for admin access!

## 📝 Project Structure

```
ServiceHooks/
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── user/          # User management components
│   │   └── common/        # Shared components
│   ├── hooks/             # Custom React hooks
│   │   ├── auth/          # Authentication hooks
│   │   └── user/          # User management hooks
│   ├── services/          # Business logic services
│   │   ├── auth/          # Authentication service
│   │   └── user/          # User management service
│   ├── repositories/      # Data access layer
│   │   ├── user/          # User repository
│   │   └── BaseRepository.ts
│   ├── interfaces/        # TypeScript interfaces
│   │   ├── models/        # Domain models
│   │   ├── repositories/  # Repository interfaces
│   │   └── services/      # Service interfaces
│   ├── config/            # Configuration files
│   │   ├── firebase.ts    # Firebase setup
│   │   └── container.ts   # DI container
│   ├── pages/             # Page components
│   ├── styles/            # Global styles
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx          # Entry point
│   └── vite-env.d.ts     # Vite type definitions
├── public/                # Static assets
├── .github/
│   └── workflows/         # GitHub Actions
├── .husky/               # Git hooks
├── .env.example          # Environment variables template
├── .eslintrc.cjs         # ESLint configuration
├── .prettierrc           # Prettier configuration
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Project dependencies
```

## 🔐 Security

- Environment variables for sensitive configuration
- Firebase security rules (to be configured in Firebase console)
- Input validation in service layer
- Error boundaries for React components
- Dependency vulnerability scanning in CI/CD

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service:
   - Firebase Hosting
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

## 📚 Best Practices

1. **Always use interfaces** for dependency injection
2. **Keep components pure** - business logic belongs in services
3. **Use custom hooks** for reusable stateful logic
4. **Follow the dependency rule** - dependencies point inward
5. **Write tests** for services and critical components
6. **Use TypeScript strictly** - avoid `any` types
7. **Handle errors gracefully** at appropriate layers

## 🎮 Interactive Features

### Repository Switcher
Click the settings gear (⚙️) in the top-right corner to:
- Switch between localStorage and Firebase
- Manage demo data (add, reset, clear)
- View architecture benefits

### Demo Data Management
- **🎭 Add Demo Users**: Generate 20 fun mock users
- **🔄 Reset Demo Data**: Fresh set of users
- **🧹 Clear All Data**: Start clean

### Fun Elements
- Character-themed user names (Alice, Harry Potter, etc.)
- Randomized user roles and activity status
- Avatar images from DiceBear API
- Realistic creation dates and login times

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Clean Architecture principles by Robert C. Martin
- React and Firebase teams for excellent documentation
- The open-source community for inspiration

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

Built with ❤️ using React, TypeScript, localStorage, and Firebase

## 🌟 Why This Architecture?

This project demonstrates the power of clean architecture:

- **🔄 Flexibility**: Switch data sources without changing business logic
- **🧪 Testability**: Easy testing with localStorage mock data
- **🚀 Scalability**: Start local, deploy to cloud seamlessly
- **👨‍💻 Developer Experience**: Fun demo data makes development enjoyable
- **📚 Educational**: Perfect example of dependency inversion principle

**Try it now!** See how the same UI works with both localStorage and Firebase! 🎉