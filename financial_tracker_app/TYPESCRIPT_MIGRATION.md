# TypeScript Migration Guide

TypeScript is now set up in your project! You can gradually migrate files from `.js` to `.tsx/.ts`.

## Setup Complete ✅

- ✅ TypeScript installed
- ✅ `tsconfig.json` configured
- ✅ Type definitions for React & React Native installed
- ✅ Shared types file created (`src/types.ts`)

## How to Migrate Files

### 1. Rename File Extensions
- Components: `.js` → `.tsx`
- Services/Utils: `.js` → `.ts`

### 2. Add Type Annotations

**Before (JavaScript):**
```javascript
export default function Dashboard({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  // ...
}
```

**After (TypeScript):**
```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile } from '../types';

type DashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export default function Dashboard({ navigation }: DashboardProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // ...
}
```

## Migration Order (Recommended)

1. **Start with types and services** (already have strong contracts)
   - `src/types.ts` ✅ (already done)
   - `src/services/userService.js` → `.ts`
   - `src/services/transactionService.js` → `.ts`
   - `src/config/firebase.js` → `.ts`

2. **Then contexts**
   - `src/context/AuthContext.js` → `.tsx`

3. **Then components**
   - `src/components/PasswordInput.js` → `.tsx`

4. **Finally screens** (as you work on them)
   - Migrate one screen at a time
   - No rush - JS and TS files can coexist!

## Quick Tips

- **Both .js and .ts files work together** - no need to migrate everything at once
- **Start small** - migrate one file when you're editing it
- **Use shared types** from `src/types.ts` for consistency
- **VS Code will help** - great autocomplete and error checking
- **Don't over-type** - `any` is OK when starting out

## Common Type Patterns

### React Components
```typescript
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

const MyComponent: FC<MyComponentProps> = ({ title, onPress }) => {
  // ...
};
```

### useState
```typescript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<UserProfile | null>(null);
```

### Async Functions
```typescript
const fetchData = async (): Promise<UserProfile> => {
  // ...
};
```

## Next Steps

When you want to migrate a file:
1. Rename it to `.ts` or `.tsx`
2. Add types for props, state, and functions
3. Import types from `src/types.ts`
4. Let me know if you need help!
