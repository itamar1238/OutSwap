# OutSwap - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm start
```

### Step 3: Open in Your Preferred Platform

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## 📱 Test the App

### Navigation Flow

1. **Home Screen** - Start here to see quick actions
2. **Browse Tab** - Search and filter outfits
3. **Explore Tab** - View categories and how-to guides

### Try These Features

#### As a Renter:

1. Tap "Browse Outfits" on home screen
2. Apply filters (category, size, price)
3. Tap an outfit to view details
4. Tap "Rent Now" to request rental
5. View "My Rentals" to see your requests

#### As an Owner:

1. Tap "List an Outfit" on home screen
2. Fill in outfit details
3. Add images (placeholder for now)
4. Set pricing (hourly/daily)
5. Submit listing
6. View "My Rentals" → "As Owner" tab to manage requests

## 🔗 Backend Setup (Required for Full Functionality)

The app expects a REST API at `http://localhost:3000/api` by default.

### Expected Endpoints:

```
GET    /outfits/search
GET    /outfits/:id
POST   /outfits
PUT    /outfits/:id
DELETE /outfits/:id
GET    /outfits/owner/:userId
GET    /outfits/nearby

POST   /rentals
POST   /rentals/:id/confirm
POST   /rentals/:id/return
POST   /rentals/:id/cancel
GET    /rentals/:id
GET    /rentals/renter/:userId
GET    /rentals/owner/:userId

POST   /ratings
GET    /ratings/outfit/:id
GET    /ratings/user/:id
PUT    /ratings/:id
DELETE /ratings/:id

GET    /users/:id
PUT    /users/:id
GET    /users/me
```

### Configure API URL:

Create `.env` file:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 📁 Project Structure Quick Reference

```
app/
├── (tabs)/
│   ├── index.tsx       → Home screen with quick actions
│   └── explore.tsx     → Categories and guides
├── outfits/
│   ├── browse.tsx      → Search & filter outfits
│   ├── create.tsx      → Create new listing
│   └── [id].tsx        → Outfit details
└── rentals/
    ├── index.tsx       → Manage rentals
    └── create.tsx      → Request rental

types/index.ts          → All TypeScript types
services/api.ts         → API service layer
utils/validation.ts     → Validation functions
```

## 🧪 Testing Validation

Try entering invalid data to see validation in action:

**Create Outfit:**

- Leave title empty → Error
- Price = 0 → Error
- Price = -10 → Error
- No images → Error

**Request Rental:**

- End date before start date → Error
- Past dates → Error

## 💡 Development Tips

### Hot Reload

Changes to `.tsx` files automatically reload the app.

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### View Logs

Open the terminal running `npm start` to see console.log outputs.

### Debugging

- Shake device or press Cmd+D (iOS) / Cmd+M (Android)
- Select "Debug Remote JS"
- Open Chrome DevTools

## 🎨 Customization

### Colors

Edit theme colors in `constants/theme.ts`

### Branding

- Update app name in `app.json`
- Replace logo in `assets/images/`

### Add New Category

1. Add to `OutfitCategory` type in `types/index.ts`
2. Add emoji in `explore.tsx` categories array
3. Add to filter in `browse.tsx`

## 📦 Build for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Web

```bash
npm run build:web
```

## 🐛 Common Issues

### "Cannot find module"

```bash
rm -rf node_modules
npm install
```

### Metro bundler cache issues

```bash
npm start -- --clear
```

### TypeScript errors

```bash
npx tsc --noEmit
```

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Review `PROJECT_SUMMARY.md` for feature overview
3. Examine code comments in source files
4. Open an issue on GitHub

---

**Happy coding! 🎉**
