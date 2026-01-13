# OutSwap - Peer-to-Peer Outfit Rental App

OutSwap is a modern, location-based outfit rental platform that connects people who want to rent stylish outfits with local outfit owners. Built with React Native and Expo for iOS, Android, and web.

## 🎯 Features

### 1. Outfit Listings

- **Create Listings**: Owners can list outfits with images, descriptions, sizes, categories, and pricing
- **Categories**: Formal, Casual, Sportswear, Party, Business, Wedding, and more
- **Flexible Pricing**: Set hourly and daily rates
- **Availability Management**: Define when outfits are available for rent
- **Style Tags**: Tag outfits with relevant style keywords for better discovery

### 2. Location-Based Search

- **Proximity Search**: Find outfits near your location with customizable radius
- **Advanced Filters**: Filter by category, size, price range, and ratings
- **Multiple Sort Options**: Sort by proximity, price (low/high), rating, or newest
- **Map Integration**: View outfit locations on a map (future enhancement)

### 3. Rental Management

- **Request Rentals**: Choose rental period and see automatic price calculation
- **Smart Pricing**: System automatically calculates the best rate (hourly vs daily)
- **Status Tracking**: Track rentals through pending, confirmed, active, and returned states
- **Dual Perspectives**: Manage rentals as both renter and outfit owner
- **Confirmation Flow**: Owners can approve or decline rental requests

### 4. Rating & Review System

- **5-Star Ratings**: Rate both outfits and users
- **Written Reviews**: Leave detailed feedback
- **Trust Building**: View ratings before renting or listing
- **Mutual Reviews**: Both renters and owners can leave reviews

### 5. Validation & Safety

- **Input Validation**: Comprehensive validation for all user inputs
- **Price Validation**: Ensures prices are positive and reasonable
- **Date Validation**: Prevents invalid or past rental dates
- **Data Integrity**: Strong TypeScript typing throughout

## 🏗️ Architecture

### Project Structure

```
OutSwap/
├── app/                          # React Native screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx            # Home screen
│   │   └── explore.tsx          # Category exploration
│   ├── outfits/                 # Outfit-related screens
│   │   ├── browse.tsx           # Search & browse outfits
│   │   ├── create.tsx           # Create new outfit listing
│   │   └── [id].tsx             # Outfit detail view
│   └── rentals/                 # Rental management screens
│       ├── index.tsx            # My rentals list
│       └── create.tsx           # Request rental
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Core types (Outfit, Rental, User, Rating)
├── services/                    # Business logic & API
│   └── api.ts                   # API service layer with all endpoints
├── utils/                       # Utility functions
│   └── validation.ts            # Input validation & price calculation
└── components/                  # Reusable UI components

```

### Type System

**Core Models:**

- `User`: User profile with location and ratings
- `Outfit`: Outfit listing with all details
- `Rental`: Rental transaction with status tracking
- `Rating`: Review and rating for outfits/users
- `Location`: Geographic location data

**Categories & Enums:**

- `OutfitCategory`: formal | casual | sportswear | party | business | wedding
- `ClothingSize`: XXS | XS | S | M | L | XL | XXL | XXXL
- `RentalStatus`: pending | confirmed | active | returned | cancelled | disputed
- `SortOption`: proximity | price-low | price-high | rating-high | newest

### API Service Layer

**Outfit API:**

- `create(input)` - Create new outfit listing
- `update(input)` - Update existing outfit
- `delete(id)` - Delete outfit
- `getById(id)` - Get outfit details
- `getByOwner(ownerId)` - Get user's listings
- `search(params)` - Advanced search with filters
- `getNearby(lat, lng, radius)` - Proximity search

**Rental API:**

- `createRequest(input)` - Request rental
- `confirm(id)` - Confirm rental (owner)
- `markReturned(id)` - Mark as returned
- `cancel(id, reason)` - Cancel rental
- `getByRenter(userId)` - Get user's rentals
- `getByOwner(userId)` - Get rentals for user's outfits
- `calculatePrice(...)` - Calculate rental cost

**Rating API:**

- `create(input)` - Create rating/review
- `getForOutfit(id)` - Get outfit reviews
- `getForUser(id)` - Get user reviews
- `update(id, updates)` - Update rating
- `delete(id)` - Delete rating

### Validation System

Comprehensive validation for:

- **Prices**: Must be positive, reasonable limits
- **Dates**: Valid format, future dates only, proper ranges
- **Strings**: Min/max length, required fields
- **Arrays**: Minimum items required
- **Complex Objects**: Multi-field validation with detailed error messages

### Pricing Logic

Smart rental pricing:

```typescript
// Calculate best rate for rental period
const hourlyTotal = hours × pricePerHour
const dailyTotal = days × pricePerDay
finalPrice = min(hourlyTotal, dailyTotal)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Run on web
npx expo start --web
```

### Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔌 Backend Integration

The app is designed to work with a REST API backend. Configure the API base URL in:

- Environment variable: `EXPO_PUBLIC_API_URL`
- Default: `http://localhost:3000/api`

### Expected API Endpoints

```
GET    /outfits/search          # Search outfits
GET    /outfits/:id             # Get outfit details
POST   /outfits                 # Create outfit
PUT    /outfits/:id             # Update outfit
DELETE /outfits/:id             # Delete outfit

POST   /rentals                 # Create rental request
POST   /rentals/:id/confirm     # Confirm rental
POST   /rentals/:id/return      # Mark returned
GET    /rentals/renter/:userId  # Get user's rentals

POST   /ratings                 # Create rating
GET    /ratings/outfit/:id      # Get outfit ratings
```

## 📱 Key Screens

### Home Screen

- Welcome message and app overview
- Quick action cards for browsing, listing, and managing rentals
- Feature highlights

### Browse Screen

- Search bar with text filtering
- Category, size, and price filters
- Sort options (proximity, price, rating)
- Grid view of outfit cards
- Location-based results

### Outfit Detail

- Image gallery
- Full outfit information
- Owner details and rating
- Reviews section
- "Rent Now" call-to-action

### Create Listing

- Multi-step form for outfit details
- Image upload
- Category and size selection
- Pricing inputs (hourly/daily)
- Style tags
- Availability dates

### Rental Request

- Outfit summary
- Date/time pickers
- Duration calculation
- Automatic price calculation
- Total cost display

### My Rentals

- Tabbed view (As Renter / As Owner)
- Rental cards with status badges
- Action buttons (Confirm, Return, Cancel)
- Rental history

## 🎨 Design Principles

- **Clean & Modern**: iOS-inspired design language
- **Intuitive Navigation**: Tab-based navigation with clear hierarchy
- **Responsive**: Works on phones, tablets, and web
- **Accessible**: Color contrast, touch targets, readable fonts
- **Performant**: Optimized images, lazy loading, efficient state management

## 🔒 Security Considerations

- Input validation on all user inputs
- Sanitize data before API calls
- Secure payment processing (integrate with Stripe/PayPal)
- User authentication required for sensitive operations
- Rate limiting on API calls
- Data encryption in transit (HTTPS)

## 🚧 Future Enhancements

- [ ] Real-time messaging between users
- [ ] Push notifications for rental updates
- [ ] Image upload and storage (Cloudinary/S3)
- [ ] Payment integration (Stripe)
- [ ] User authentication (Firebase Auth)
- [ ] Real location services (GPS)
- [ ] Calendar integration for availability
- [ ] Advanced filters (brand, occasion, color)
- [ ] Favorites/wishlist functionality
- [ ] Damage protection insurance
- [ ] Identity verification
- [ ] Social media sharing
- [ ] Referral program
- [ ] Analytics dashboard for owners

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linter
npm run lint

# Future: Unit tests
npm test
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 📧 Support

For support, email support@outswap.com or open an issue.

---

**Built with ❤️ using React Native, Expo, and TypeScript**
