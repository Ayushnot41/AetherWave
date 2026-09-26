# Quick Reference Guide

## 🚀 Common Commands

### Development
```bash
npm run dev          # Start development server
npm run typecheck    # Check TypeScript types
npm run lint         # Run ESLint
```

### Building
```bash
# On Linux/macOS
npm run build

# On Windows (known issue with Next.js 15)
# Use npm run dev for development
# Build via CI/CD or WSL2
```

### Production
```bash
npm start           # Start production server (after build)
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── intake/       # Intake submission
│   │   ├── swarm/        # Risk analysis results
│   │   ├── actions/      # Recommended actions
│   │   ├── verification/ # Verification pipeline
│   │   ├── payout/       # Payout results
│   │   ├── weather/      # Weather data
│   │   ├── crops/        # Crop recommendations
│   │   ├── market/       # Market prices
│   │   ├── harvest/      # Harvest timing
│   │   ├── storage/      # Storage alerts
│   │   └── satellite/    # Satellite NDVI data
│   ├── onboarding/       # Onboarding flow
│   ├── dashboard/        # Main dashboard
│   ├── intake/           # Intake capture
│   ├── cascade/          # Risk cascade view
│   ├── action/           # Action selection
│   ├── verification/     # Verification flow
│   ├── payout/           # Payout screen
│   ├── offline/          # Offline fallback
│   ├── weather/          # Weather dashboard
│   ├── crop-advisor/     # Crop advisor
│   ├── harvest-timing/   # Harvest timing
│   ├── market-prices/    # Market prices
│   ├── notify/           # Notification center
│   ├── satellite/        # Satellite analysis
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── layout/           # Layout components
│   ├── capture/          # Capture components
│   └── notifications/    # Notification components
├── contracts/             # API contracts & schemas
│   ├── api.ts            # Zod schemas
│   └── index.ts          # Exports
├── stores/                # Zustand state stores
│   ├── auth-store.ts           # Authentication
│   ├── capture-store.ts        # Media capture
│   ├── risk-store.ts           # Risk analysis
│   ├── verification-store.ts   # Verification
│   ├── connectivity-store.ts   # Network status
│   ├── locale-store.ts         # Language/dialect
│   └── index.ts                # Exports
├── lib/                   # Utilities
│   ├── api-client.ts     # API client with retry/offline
│   ├── design-tokens.ts  # Design system tokens
│   ├── utils.ts          # Helper functions
│   └── zod-resolver.ts   # Form validation resolver
└── types/                 # TypeScript declarations
    └── global.d.ts       # Global type definitions
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `eslint.config.mjs` | ESLint rules |
| `postcss.config.mjs` | PostCSS plugins |
| `tailwind.config.js` | Tailwind CSS config (if exists) |
| `.gitignore` | Git ignore rules |
| `.npmrc` | NPM configuration |
| `package.json` | Dependencies & scripts |

## 🎨 Design Tokens

**Location**: `src/lib/design-tokens.ts`

```typescript
import { tokens } from '@/lib/design-tokens';

// Colors
tokens.colors.authority    // Primary green
tokens.colors.paper        // Background cream
tokens.colors.ink          // Text black
tokens.colors.slate        // Secondary text
tokens.colors.alertOchre   // Warning color
tokens.colors.verifiedForest // Success color

// Typography
tokens.fonts.body          // Body font (Mukta)
tokens.fonts.display       // Display font (Source Serif 4)

// Spacing
tokens.spacing.xs / sm / md / lg / xl / xxl

// Touch targets
tokens.touch.minTarget     // 44px minimum
```

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.2.1 | React framework |
| react | 19.0.0 | UI library |
| motion | 12.0.0 | Animations |
| zustand | 5.0.0 | State management |
| zod | 3.24.0 | Schema validation |
| react-hook-form | 7.54.0 | Form handling |
| lucide-react | 0.500.0 | Icons |
| tailwindcss | 4.x | Styling |

## 🔒 Environment Variables

**File**: `.env.local` (create this file, not in git)

```bash
NEXT_PUBLIC_API_URL=/api    # API base URL (optional, defaults to /api)
```

## 🛠️ Adding New Features

### 1. New API Route
```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  param: z.string().min(1),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = QuerySchema.safeParse(params);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.issues },
      { status: 400 }
    );
  }
  
  // Your logic here
  return NextResponse.json({ data: 'example' });
}
```

### 2. New Page
```typescript
// src/app/example/page.tsx
'use client';

import { tokens } from '@/lib/design-tokens';

export default function ExamplePage() {
  return (
    <div style={{ 
      backgroundColor: tokens.colors.paper,
      color: tokens.colors.ink,
      padding: tokens.spacing.xl
    }}>
      <h1 style={{ color: tokens.colors.authority }}>
        Example Page
      </h1>
    </div>
  );
}
```

### 3. New Zustand Store
```typescript
// src/stores/example-store.ts
import { create } from 'zustand';

interface ExampleState {
  count: number;
}

interface ExampleActions {
  increment: () => void;
  decrement: () => void;
}

type ExampleStore = ExampleState & ExampleActions;

export const useExampleStore = create<ExampleStore>()((set) => ({
  count: 0,
  
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### 4. New API Contract
```typescript
// In src/contracts/api.ts
export const ExampleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  value: z.number().positive(),
});
export type Example = z.infer<typeof ExampleSchema>;

// Export in src/contracts/index.ts
export { ExampleSchema } from './api';
export type { Example } from './api';
```

## 🐛 Debugging Tips

### TypeScript Errors
```bash
npm run typecheck    # Check all type errors
```

### Check Specific File
```bash
npx tsc --noEmit src/path/to/file.ts
```

### Inspect Zustand State
```typescript
// In any component
const authState = useAuthStore();
console.log('Auth state:', authState);
```

### API Client Errors
```typescript
const result = await submitIntake(data);
if (!result.ok) {
  console.error('Error:', result.error);
  console.error('Retryable:', result.error.retryable);
}
```

### Check Network Status
```typescript
const { isOnline, isSlowConnection } = useConnectivityStore();
console.log('Online:', isOnline);
console.log('Slow:', isSlowConnection);
```

## 📱 Testing on Mobile

### Using Dev Server
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start dev server: `npm run dev`
3. On mobile, navigate to: `http://YOUR_IP:3000`

### PWA Testing
1. Build the app: `npm run build`
2. Start production: `npm start`
3. On mobile, use "Add to Home Screen"
4. Test offline by enabling airplane mode

## 🔍 Common Issues & Solutions

### "Cannot find module"
- Run `npm install`
- Check imports use `@/` for absolute paths
- Verify file exists at the path

### TypeScript Errors
- Run `npm run typecheck` to see all errors
- Check `src/types/global.d.ts` for missing declarations
- Ensure `types: ["node"]` in `tsconfig.json`

### Build Fails on Windows
- Known issue with Next.js 15 + dynamic routes
- Use `npm run dev` for development
- Build on Linux/macOS or via CI/CD
- See `FIXES_APPLIED.md` for details

### CSS Not Loading
- Restart dev server
- Clear `.next` folder: `rm -rf .next`
- Check `globals.css` import in `layout.tsx`

### State Not Persisting
- Check Zustand `persist` middleware is configured
- Look in browser localStorage: `aetherweave-auth`, etc.
- Clear localStorage to reset: `localStorage.clear()`

### API Errors
- Check browser Network tab
- Verify API route exists
- Check Zod schema validation
- Ensure auth token is present (if required)

## 📚 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Zod Docs](https://zod.dev)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Motion Docs](https://motion.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)

## 💡 Pro Tips

1. **Always use design tokens** - Never hard-code colors or spacing
2. **Validate everything** - Use Zod schemas for all data
3. **Think offline-first** - Test with network throttling
4. **Check accessibility** - Use semantic HTML and ARIA labels
5. **Type everything** - Avoid `any` types
6. **Handle errors** - Every API call should handle errors
7. **Test on mobile** - Desktop testing is not enough
8. **Keep components small** - Break down complex components
9. **Document as you go** - Add JSDoc comments
10. **Run typecheck often** - Catch errors early

## 🆘 Getting Help

1. Check `FIXES_APPLIED.md` for known issues
2. Check `PREVENTIVE_MEASURES.md` for best practices
3. Search error messages in browser console
4. Check Next.js documentation
5. Search GitHub issues for Next.js/React
6. Ask in team chat with full error message

---

**Last Updated**: After comprehensive project analysis
**Maintainer**: AetherWave Development Team
