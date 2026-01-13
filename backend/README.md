# OutSwap Backend API

Node.js/Express backend with MongoDB for the OutSwap peer-to-peer outfit rental platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MongoDB

**Option A: MongoDB Atlas (Recommended - Free)**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

**Option B: Local MongoDB**

```bash
# Install MongoDB locally
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string: mongodb://localhost:27017/outswap
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
```

Required variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/outswap
PORT=3000
FRONTEND_URL=http://localhost:8081
```

### 4. Start Server

```bash
# Development with auto-reload
npm run dev

# Production build
npm run build
npm start
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Outfits

| Method | Endpoint                        | Description                 |
| ------ | ------------------------------- | --------------------------- |
| POST   | `/api/outfits`                  | Create new outfit           |
| POST   | `/api/outfits/search`           | Search outfits with filters |
| GET    | `/api/outfits/:id`              | Get outfit by ID            |
| GET    | `/api/outfits/owner/:ownerId`   | Get owner's outfits         |
| PUT    | `/api/outfits/:id`              | Update outfit               |
| DELETE | `/api/outfits/:id`              | Delete outfit               |
| GET    | `/api/outfits/nearby/:lat/:lng` | Get nearby outfits          |

### Rentals

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| POST   | `/api/rentals`                | Create rental request  |
| POST   | `/api/rentals/:id/confirm`    | Confirm rental (owner) |
| POST   | `/api/rentals/:id/return`     | Mark as returned       |
| POST   | `/api/rentals/:id/cancel`     | Cancel rental          |
| GET    | `/api/rentals/:id`            | Get rental by ID       |
| GET    | `/api/rentals/renter/:userId` | Get renter's rentals   |
| GET    | `/api/rentals/owner/:userId`  | Get owner's rentals    |

### Ratings

| Method | Endpoint                        | Description        |
| ------ | ------------------------------- | ------------------ |
| POST   | `/api/ratings`                  | Create rating      |
| GET    | `/api/ratings/outfit/:outfitId` | Get outfit ratings |
| GET    | `/api/ratings/user/:userId`     | Get user ratings   |
| PUT    | `/api/ratings/:id`              | Update rating      |
| DELETE | `/api/ratings/:id`              | Delete rating      |

## 🗄️ Database Schema

### Collections

**outfits**

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  images: [String],
  size: String,
  category: String,
  styleTags: [String],
  pricePerHour: Number,
  pricePerDay: Number,
  ownerId: ObjectId,
  location: {
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: [Number, Number] // [lng, lat]
  },
  available: Boolean,
  rating: Number,
  totalRatings: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**rentals**

```javascript
{
  _id: ObjectId,
  outfitId: ObjectId,
  renterId: ObjectId,
  ownerId: ObjectId,
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  status: String, // pending, confirmed, active, returned, cancelled
  notes: String,
  cancelReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

**ratings**

```javascript
{
  _id: ObjectId,
  rating: Number, // 1-5
  comment: String,
  outfitId: ObjectId, // Optional
  toUserId: ObjectId, // Optional
  fromUserId: ObjectId,
  rentalId: ObjectId, // Optional
  createdAt: Date
}
```

### Indexes

Automatically created on server start:

- Geospatial index on `outfits.location.coordinates`
- Text index on `outfits.title`, `description`, `styleTags`
- Query indexes on common fields (ownerId, category, status, etc.)

## 🔍 Example Requests

### Create Outfit

```bash
curl -X POST http://localhost:3000/api/outfits \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vintage Leather Jacket",
    "description": "Classic 90s leather jacket",
    "images": ["https://example.com/image1.jpg"],
    "size": "M",
    "category": "casual",
    "styleTags": ["vintage", "leather", "edgy"],
    "pricePerHour": 15,
    "pricePerDay": 80,
    "ownerId": "507f1f77bcf86cd799439011",
    "location": {
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "country": "USA",
      "coordinates": [-118.2437, 34.0522]
    }
  }'
```

### Search Outfits

```bash
curl -X POST http://localhost:3000/api/outfits/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "leather",
    "category": "casual",
    "size": "M",
    "minPrice": 50,
    "maxPrice": 100,
    "location": {
      "coordinates": [-118.2437, 34.0522]
    },
    "radius": 8046.72,
    "sortBy": "proximity",
    "page": 1,
    "limit": 20
  }'
```

### Create Rental

```bash
curl -X POST http://localhost:3000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "outfitId": "507f1f77bcf86cd799439011",
    "renterId": "507f191e810c19729de860ea",
    "startDate": "2026-01-20T10:00:00Z",
    "endDate": "2026-01-22T18:00:00Z",
    "notes": "Need it for a party"
  }'
```

## 🧪 Testing

Test the API with curl, Postman, or Thunder Client:

```bash
# Health check
curl http://localhost:3000/health

# Create a test outfit
curl -X POST http://localhost:3000/api/outfits \
  -H "Content-Type: application/json" \
  -d @test-outfit.json
```

## 📊 Features

- ✅ MongoDB with geospatial queries
- ✅ Location-based outfit search
- ✅ Smart rental pricing calculation
- ✅ Automatic rating aggregation
- ✅ Comprehensive indexes for performance
- ✅ TypeScript for type safety
- ✅ Error handling and validation
- ✅ CORS configured for frontend
- ✅ Development hot reload

## 🔒 Security (TODO)

- [ ] JWT authentication
- [ ] Input validation with express-validator
- [ ] Rate limiting
- [ ] Helmet.js for security headers
- [ ] Request sanitization
- [ ] Role-based access control

## 🚀 Deployment

### Heroku

```bash
# Install Heroku CLI
heroku create outswap-api
heroku config:set MONGODB_URI=your-connection-string
git push heroku main
```

### Railway

```bash
# Connect GitHub repo at railway.app
# Add MONGODB_URI environment variable
# Deploy automatically on push
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

## 📝 License

MIT
