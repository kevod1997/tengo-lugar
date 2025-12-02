# Database Schema Overview

## Overview
PostgreSQL database with Prisma ORM for type-safe operations.

**Prisma Schema**: [prisma/schema.prisma](../../../prisma/schema.prisma)

---

## Core Entities

### User
Central user entity for authentication and profile data.

**Relationships:**
- `driver` → Driver (1:1)
- `passenger` → Passenger (1:1)
- `identityCard` → IdentityCard (1:1)
- `licence` → Licence (1:1)
- `notifications` → Notification[] (1:N)
- `pushSubscriptions` → PushSubscription[] (1:N)
- `actionLogs` → UserActionLog[] (1:N)

**Key Fields:**
- `id` - UUID primary key
- `email` - Unique email address
- `name` - User full name
- `role` - 'admin' or 'user'
- `emailVerified` - Email verification status
- `image` - Profile image URL

---

## Role Models

### Driver
Represents users who offer rides.

**Relationships:**
- `user` → User (1:1)
- `driverCars` → DriverCar[] (1:N) - Driver's vehicles

**Key Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User
- `verificationStatus` - 'PENDING' | 'VERIFIED' | 'REJECTED'
- `rating` - Average driver rating (0-5)
- `totalRatings` - Number of ratings received
- `totalTrips` - Number of trips completed

### Passenger
Represents users who book rides.

**Relationships:**
- `user` → User (1:1)
- `tripPassengers` → TripPassenger[] (1:N) - Booked trips

**Key Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User
- `rating` - Average passenger rating (0-5)
- `totalRatings` - Number of ratings received
- `totalTrips` - Number of trips taken

---

## Vehicle Models

### Brand
Car manufacturer (e.g., Toyota, Ford).

**Relationships:**
- `carModels` → CarModel[] (1:N)

### CarModel
Specific car model (e.g., Corolla, Focus).

**Relationships:**
- `brand` → Brand (N:1)
- `cars` → Car[] (1:N)

### Car
Physical vehicle instance.

**Relationships:**
- `carModel` → CarModel (N:1)
- `driverCars` → DriverCar[] (1:N)
- `vehicleCard` → VehicleCard (1:1)
- `insurancePolicy` → InsurancePolicy (1:1)

**Key Fields:**
- `id` - UUID primary key
- `patent` - Unique license plate
- `year` - Manufacturing year
- `color` - Vehicle color
- `carModelId` - Foreign key to CarModel

### DriverCar
Association between Driver and Car (driver can have multiple cars).

**Relationships:**
- `driver` → Driver (N:1)
- `car` → Car (N:1)
- `trips` → Trip[] (1:N)

**Key Fields:**
- `id` - UUID primary key
- `driverId` - Foreign key to Driver
- `carId` - Foreign key to Car
- `isActive` - Whether this car is currently active

---

## Trip Models

### Trip
A scheduled ride from origin to destination.

**Relationships:**
- `driverCar` → DriverCar (N:1)
- `passengers` → TripPassenger[] (1:N)
- `reviews` → Review[] (1:N)

**Key Fields:**
- `id` - UUID primary key
- `origin` - Starting location
- `destination` - End location
- `departureDate` - Scheduled departure time
- `estimatedArrivalDate` - Expected arrival time
- `availableSeats` - Number of available seats
- `pricePerSeat` - Cost per passenger
- `status` - 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
- `chatRoomId` - External chat room ID

### TripPassenger
Association between Trip and Passenger (booking).

**Relationships:**
- `trip` → Trip (N:1)
- `passenger` → Passenger (N:1)
- `payment` → Payment (1:1)

**Key Fields:**
- `id` - UUID primary key
- `tripId` - Foreign key to Trip
- `passengerId` - Foreign key to Passenger
- `seatsReserved` - Number of seats booked
- `totalPrice` - Total amount to pay
- `status` - 'PENDING' | 'CONFIRMED' | 'CANCELLED'

---

## Payment Models

### Payment
Payment for a trip booking.

**Relationships:**
- `tripPassenger` → TripPassenger (1:1)

**Key Fields:**
- `id` - UUID primary key
- `tripPassengerId` - Foreign key to TripPassenger
- `amount` - Payment amount
- `status` - 'PENDING' | 'APPROVED' | 'REJECTED'
- `receiptUrl` - URL to payment receipt (if uploaded)
- `verifiedAt` - Admin verification timestamp
- `verifiedBy` - Admin user who verified

---

## Document Models

### IdentityCard
User's identity document.

**Relationships:**
- `user` → User (1:1)

**Key Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User
- `documentNumber` - ID card number
- `frontImageUrl` - Front image S3 URL
- `backImageUrl` - Back image S3 URL
- `verificationStatus` - 'PENDING' | 'VERIFIED' | 'REJECTED'

### Licence
Driver's license document.

**Relationships:**
- `user` → User (1:1)

**Key Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User
- `licenceNumber` - License number
- `expirationDate` - Expiry date
- `frontImageUrl` - Front image S3 URL
- `backImageUrl` - Back image S3 URL
- `verificationStatus` - 'PENDING' | 'VERIFIED' | 'REJECTED'

### VehicleCard
Vehicle registration document.

**Relationships:**
- `car` → Car (1:1)

**Key Fields:**
- `id` - UUID primary key
- `carId` - Foreign key to Car
- `documentNumber` - Registration number
- `imageUrl` - Document image S3 URL
- `verificationStatus` - 'PENDING' | 'VERIFIED' | 'REJECTED'

### InsurancePolicy
Vehicle insurance document.

**Relationships:**
- `car` → Car (1:1)

**Key Fields:**
- `id` - UUID primary key
- `carId` - Foreign key to Car
- `policyNumber` - Insurance policy number
- `expirationDate` - Policy expiry date
- `imageUrl` - Policy document S3 URL
- `verificationStatus` - 'PENDING' | 'VERIFIED' | 'REJECTED'

---

## Review Models

### Review
Rating and feedback for a trip.

**Relationships:**
- `trip` → Trip (N:1)
- `reviewer` → User (N:1)
- `reviewee` → User (N:1)

**Key Fields:**
- `id` - UUID primary key
- `tripId` - Foreign key to Trip
- `reviewerId` - User giving the review
- `revieweeId` - User being reviewed
- `rating` - Rating (1-5)
- `comment` - Optional text feedback
- `type` - 'DRIVER_TO_PASSENGER' | 'PASSENGER_TO_DRIVER'

---

## Notification Models

### Notification
In-app notification for users.

**Relationships:**
- `user` → User (N:1)

**Key Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User
- `title` - Notification title
- `message` - Notification content
- `type` - Notification category
- `link` - Optional link to related resource
- `data` - Additional JSON data
- `read` - Read status (boolean)
- `createdAt` - Creation timestamp

### PushSubscription
Web push notification subscription.

**Relationships:**
- `user` → User (N:1)

**Key Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User
- `endpoint` - Push subscription endpoint
- `keys` - Push subscription keys (JSON)

---

## Logging Models

### UserActionLog
Audit log of user actions.

**Relationships:**
- `user` → User (N:1)

**Key Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User
- `action` - Action type (enum)
- `status` - 'SUCCESS' | 'FAILED'
- `metadata` - Additional JSON data
- `timestamp` - Action timestamp

### ErrorLog
Application error logging.

**Key Fields:**
- `id` - UUID primary key
- `errorMessage` - Error message
- `errorStack` - Stack trace
- `context` - JSON context data
- `userId` - Optional user ID (if authenticated)
- `timestamp` - Error timestamp

---

## Common Query Patterns

### Get User with Roles

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    driver: true,
    passenger: true,
    identityCard: true,
    licence: true
  }
});
```

### Get Trip with Full Details

```typescript
const trip = await prisma.trip.findUnique({
  where: { id: tripId },
  include: {
    driverCar: {
      include: {
        driver: {
          include: { user: true }
        },
        car: {
          include: {
            carModel: {
              include: { brand: true }
            }
          }
        }
      }
    },
    passengers: {
      include: {
        passenger: {
          include: { user: true }
        },
        payment: true
      }
    },
    reviews: {
      include: {
        reviewer: true,
        reviewee: true
      }
    }
  }
});
```

### Get Driver's Active Trips

```typescript
const trips = await prisma.trip.findMany({
  where: {
    driverCar: {
      driver: { userId: session.user.id }
    },
    status: 'ACTIVE'
  },
  include: {
    passengers: {
      include: {
        passenger: {
          include: { user: true }
        }
      }
    }
  },
  orderBy: { departureDate: 'asc' }
});
```

---

## Database Migrations

### View Migrations
```bash
# List all migrations
ls prisma/migrations

# View specific migration
cat prisma/migrations/20240101_migration_name/migration.sql
```

### Rollback (Not Recommended)
Prisma doesn't support rollback. Instead:
1. Create new migration to revert changes
2. Or reset database in development

---

## Indexes

Key indexes for performance:

- `User.email` - Unique index
- `Trip.status` - For filtering active trips
- `Trip.departureDate` - For chronological queries
- `Payment.status` - For filtering pending payments
- `Notification.userId` - For user notifications
- `Car.patent` - Unique index

---

## Related Documentation

- [Database Patterns](../patterns/database-patterns.md) - Query optimization
- [Prisma Commands](commands.md) - Database operations
- [Environment Variables](environment-vars.md) - DATABASE_URL configuration
