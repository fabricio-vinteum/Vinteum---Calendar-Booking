# Contributing to Vinteum Calendar

Thank you for your interest in contributing to Vinteum Calendar! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

- Node.js v18+ and npm v9+
- Git
- Code editor (VS Code recommended)
- Basic knowledge of TypeScript and React

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vinteumcalendar.git
   cd vinteumcalendar
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/Pizlo/vinteumcalendar.git
   ```

### Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Set Up Environment

```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Frontend
cp client/.env.example client/.env
# Edit client/.env with API URL
```

### Run Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Check TypeScript
npx tsc --noEmit

# Test manually
npm run dev
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit message format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```
feat: add email notifications for bookings
fix: resolve CORS error in production
docs: update API documentation
refactor: simplify booking service logic
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR template
5. Submit for review

---

## Coding Standards

### TypeScript

**Use strict typing:**
```typescript
// ✅ Good
function createBooking(data: BookingData): Promise<BookingResult> {
  // ...
}

// ❌ Bad
function createBooking(data: any): any {
  // ...
}
```

**Avoid `any` type:**
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
}

// ❌ Bad
const user: any = { id: '123', email: 'test@example.com' };
```

### React Components

**Use functional components:**
```typescript
// ✅ Good
export const TimeSlot: React.FC<TimeSlotProps> = ({ time, onClick }) => {
  return <button onClick={onClick}>{time}</button>;
};

// ❌ Bad
export class TimeSlot extends React.Component {
  // ...
}
```

**Use hooks for state:**
```typescript
// ✅ Good
const [selectedDate, setSelectedDate] = useState<Date>(new Date());

// ❌ Bad
this.state = { selectedDate: new Date() };
```

### Naming Conventions

**Variables and functions:**
```typescript
// camelCase
const userName = 'John';
function getUserName() { }
```

**Components:**
```typescript
// PascalCase
const BookingWidget = () => { };
```

**Constants:**
```typescript
// UPPER_SNAKE_CASE
const MAX_BOOKINGS_PER_SLOT = 2;
const API_BASE_URL = 'https://api.example.com';
```

**Files:**
```
// camelCase for utilities
utils/timezoneDetector.ts

// PascalCase for components
components/BookingWidget.tsx

// lowercase for config
config/env.ts
```

### Code Organization

**Group imports:**
```typescript
// 1. External libraries
import React, { useState } from 'react';
import axios from 'axios';

// 2. Internal modules
import { BookingService } from '../services/bookingService';
import { formatDate } from '../utils/dateFormatter';

// 3. Types
import type { BookingData } from '../types';

// 4. Styles
import './styles.css';
```

**Keep functions small:**
```typescript
// ✅ Good - Single responsibility
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateBookingData(data: BookingData): boolean {
  return validateEmail(data.email) && data.firstname.length > 0;
}

// ❌ Bad - Too much responsibility
function validateAndCreateBooking(data: any) {
  // 100 lines of validation and creation logic
}
```

### Error Handling

**Use custom error classes:**
```typescript
// ✅ Good
throw new ValidationError('Invalid email format');

// ❌ Bad
throw new Error('Invalid email format');
```

**Always handle errors:**
```typescript
// ✅ Good
try {
  await createBooking(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else {
    // Handle other errors
  }
}

// ❌ Bad
await createBooking(data); // Unhandled promise rejection
```

---

## Testing Guidelines

### Unit Tests

**Test pure functions:**
```typescript
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### Integration Tests

**Test API endpoints:**
```typescript
describe('POST /api/bookings', () => {
  it('should create booking with valid data', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send(validBookingData);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

### Component Tests

**Test React components:**
```typescript
describe('TimeSlot', () => {
  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<TimeSlot time="9:00 AM" onClick={onClick} />);
    
    fireEvent.click(screen.getByText('9:00 AM'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Test Coverage

Aim for:
- **Unit tests:** 80%+ coverage
- **Integration tests:** Critical paths
- **E2E tests:** Main user flows

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] Follows coding standards
```

### Review Process

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainer
3. **Feedback** addressed
4. **Approval** and merge

### After Merge

- Delete your branch
- Pull latest main
- Start next feature

---

## Project Structure

```
vinteumcalendar/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api/          # API clients
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utilities
│   │   └── types/        # TypeScript types
│   └── index.html
│
├── server/                # Express backend
│   ├── src/
│   │   ├── adapters/     # External APIs
│   │   ├── routes/       # HTTP endpoints
│   │   ├── services/     # Business logic
│   │   ├── errors/       # Error classes
│   │   └── config/       # Configuration
│   └── package.json
│
├── docs/                  # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONFIGURATION.md
│   └── TROUBLESHOOTING.md
│
└── README.md
```

---

## Areas for Contribution

### High Priority

- [ ] Email notifications
- [ ] Calendar sync (Google, Outlook)
- [ ] Multi-timezone improvements
- [ ] Database integration
- [ ] Analytics dashboard

### Medium Priority

- [ ] Recurring meetings
- [ ] Team management
- [ ] Custom branding
- [ ] Webhook support
- [ ] Mobile app

### Low Priority

- [ ] Additional integrations
- [ ] Advanced scheduling rules
- [ ] Reporting features
- [ ] Admin panel

---

## Questions?

- **Documentation:** Check [docs/](./docs/)
- **Issues:** Search [GitHub Issues](https://github.com/Pizlo/vinteumcalendar/issues)
- **Discussions:** Start a [Discussion](https://github.com/Pizlo/vinteumcalendar/discussions)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to Vinteum Calendar!** 🎉
