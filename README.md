# Detailing Store

A full-stack web application for a detailing shop offering online product sales, service booking, work order management, and integrated Momo payment processing.

## 🎯 Features

### Customer Features
- **Product Catalog & Shopping Cart**
  - Browse detailing products, accessories, and parts
  - Add to cart with quantity management
  - Apply discount codes
  - Free shipping threshold support
  
- **Momo Payment Integration**
  - Pay for product orders using Momo QR code
  - Real-time payment status tracking
  - Automatic order status updates
  - Vietnamese error messages

- **Service Requests**
  - Submit detailing service requests online
  - Select from available services
  - Provide vehicle and contact details
  - Track request status

- **User Account Management**
  - Register and login (Email/Password or Google OAuth)
  - View order history and payment status
  - Manage saved addresses
  - Update profile information

### Staff Features
- **Work Order Management**
  - View assigned work orders
  - Update work order status
  - Track service progress
  - Mark completion with notes

### Admin Features
- **Dashboard & Analytics**
  - Overview of orders, bookings, and revenue
  - Real-time statistics
  
- **Content Management**
  - Manage hero banners with linked services
  - Update site content and settings
  
- **Order & Booking Management**
  - Process orders and service bookings
  - Update order statuses
  - View payment information
  
- **Staff Management**
  - Create staff accounts
  - Assign work orders
  - Track staff performance
  
- **Product Management**
  - Add/edit/delete products
  - Manage inventory
  - Set discount pricing

## 🛠️ Tech Stack

### Backend
- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Authentication**: JWT + Google OAuth 2.0
- **Real-time**: SignalR (for chat)
- **Email**: SMTP integration for notifications
- **Payment**: Momo Payment Gateway (Sandbox)

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Redux Toolkit
- **Styling**: CSS Modules + Custom CSS
- **Icons**: React Icons (Feather Icons)
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App with Craco

### DevOps & Tools
- **Version Control**: Git
- **Package Managers**: npm (frontend), NuGet (backend)
- **Database Migrations**: EF Core Migrations
- **API Testing**: Postman / Thunder Client

## 📁 Project Structure

```
DetailingStore/
├── backend/                    # ASP.NET Core Web API
│   ├── Controllers/           # API endpoints
│   ├── Models/                # Entity models
│   ├── DTOs/                  # Data transfer objects
│   ├── Services/              # Business logic
│   ├── Data/                  # Database context
│   ├── Migrations/            # EF Core migrations
│   ├── Hubs/                  # SignalR hubs
│   ├── Exceptions/            # Custom exceptions
│   ├── appsettings.json       # Configuration (DO NOT COMMIT)
│   └── .env.development       # Environment variables (DO NOT COMMIT)
│
├── frontend/                   # React TypeScript SPA
│   ├── public/                # Static assets
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Page components
│       ├── features/          # Redux slices
│       ├── services/          # API services
│       ├── hooks/             # Custom React hooks
│       ├── context/           # React context providers
│       ├── utils/             # Utility functions
│       ├── types/             # TypeScript type definitions
│       └── app/               # Redux store configuration
│
└── .kiro/                      # Kiro AI agent specs (gitignored)
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **.NET SDK** 8.0+
- **PostgreSQL** 14+
- **Git**

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   dotnet restore
   ```

3. **Configure environment variables**
   
   Create `.env.development` file:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=detailing_store_dev
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_ISSUER=DetailingStoreAPI
   JWT_AUDIENCE=DetailingStoreClient
   JWT_EXPIRY_MINUTES=60

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_NAME=Detailing Store
   SMTP_FROM_EMAIL=noreply@yourdomain.com

   # Momo Payment Gateway (Sandbox)
   MOMO_PARTNER_CODE=MOMOIQA420180417
   MOMO_ACCESS_KEY=SvDmj2cOTYZmQQ3H
   MOMO_SECRET_KEY=PPuDXq1KowPT1ftR8DvlQTHhC03aul17
   MOMO_API_ENDPOINT=https://test-payment.momo.vn
   MOMO_IPN_CALLBACK_URL=https://your-domain.com/api/momo-ipn/callback
   MOMO_PAYMENT_REDIRECT_URL=https://your-domain.com/payment/callback
   ```

4. **Update appsettings.Development.json**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=detailing_store_dev;Username=postgres;Password=your_password"
     },
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     }
   }
   ```

5. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

6. **Run the API**
   ```bash
   dotnet run
   ```
   
   API will be available at `http://localhost:5080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file:
   ```env
   REACT_APP_API_URL=http://localhost:5080/api
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. **Run the development server**
   ```bash
   npm start
   ```
   
   Frontend will be available at `http://localhost:3000`

## 🔑 Default Admin Account

After running migrations, you can login with:
- **Email**: `admin@61team.vn`
- **Password**: `Admin@123`

**⚠️ Important**: Change the default password immediately in production!

## 💳 Momo Payment Integration

### Testing in Sandbox Mode

1. **Obtain Momo Sandbox Credentials**
   - Visit [Momo Developer Portal](https://developers.momo.vn)
   - Register for sandbox access
   - Get your Partner Code, Access Key, and Secret Key

2. **Configure Momo Settings**
   - Update `.env.development` with your credentials
   - Ensure IPN callback URL is publicly accessible (use ngrok for local testing)

3. **Test Payment Flow**
   - Add products to cart
   - Select "Ví MoMo / ZaloPay" payment method
   - Complete checkout
   - Scan QR code with Momo app (sandbox mode)
   - Verify payment success and order status update

### IPN Webhook Setup

The Momo IPN (Instant Payment Notification) webhook requires a publicly accessible URL:

```bash
# For local development, use ngrok
ngrok http 5080

# Update MOMO_IPN_CALLBACK_URL in .env.development
MOMO_IPN_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/momo-ipn/callback
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google-login` - Google OAuth login
- `POST /api/auth/request-otp` - Request OTP for verification
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/{id}` - Update product (Admin)
- `DELETE /api/products/{id}` - Delete product (Admin)

### Orders (Local Storage on Frontend)
- Orders are stored in browser localStorage
- No backend endpoints for order management yet

### Service Requests
- `GET /api/service-requests` - Get all service requests
- `GET /api/service-requests/{id}` - Get service request by ID
- `POST /api/service-requests` - Create service request
- `POST /api/service-requests/{id}/accept` - Accept request (Admin)
- `POST /api/service-requests/{id}/reject` - Reject request (Admin)

### Work Orders
- `GET /api/work-orders` - Get work orders (filtered by role)
- `GET /api/work-orders/{id}` - Get work order by ID
- `POST /api/work-orders` - Create work order (Admin)
- `PUT /api/work-orders/{id}/status` - Update work order status (Staff/Admin)

### Payment (Momo Integration)
- `POST /api/payment/orders/{orderId}/initiate` - Initiate order payment
- `GET /api/payment/status/{orderId}` - Get payment status
- `POST /api/momo-ipn/callback` - Momo IPN webhook (public)

### Content Management
- `GET /api/content/slides` - Get hero slides
- `POST /api/content/slides` - Create hero slide (Admin)
- `PUT /api/content/slides/{id}` - Update hero slide (Admin)
- `DELETE /api/content/slides/{id}` - Delete hero slide (Admin)

### Users & Staff
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/staff` - Get all staff (Admin)
- `POST /api/staff` - Create staff account (Admin)

## 🧪 Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🌐 Deployment

### Backend Deployment
1. Configure production environment variables
2. Update `appsettings.Production.json`
3. Run production migrations:
   ```bash
   dotnet ef database update --connection "your-production-connection-string"
   ```
4. Build and publish:
   ```bash
   dotnet publish -c Release -o ./publish
   ```
5. Deploy to hosting provider (Azure, AWS, Railway, etc.)

### Frontend Deployment
1. Update `.env.production` with production API URL
2. Build production bundle:
   ```bash
   npm run build
   ```
3. Deploy `build/` folder to static hosting (Vercel, Netlify, Cloudflare Pages)

### Important for Momo Payment
- IPN callback URL **MUST** be publicly accessible
- Use HTTPS in production
- Configure CORS appropriately
- Set secure JWT secrets

## 🔒 Security Considerations

- ✅ JWT-based authentication with secure token storage
- ✅ Password hashing with ASP.NET Identity
- ✅ CORS configured for frontend domain
- ✅ SQL injection prevention via EF Core parameterized queries
- ✅ Input validation with data annotations
- ✅ Momo signature validation for IPN webhooks
- ⚠️ **Never commit** `.env` files or `appsettings.*.json` files
- ⚠️ Use **strong secrets** in production
- ⚠️ Enable HTTPS in production

## 📝 Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `detailing_store_dev` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `your-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxx` |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USERNAME` | Email username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email app password | `your-app-password` |
| `MOMO_PARTNER_CODE` | Momo partner code | `MOMOIQA420180417` |
| `MOMO_ACCESS_KEY` | Momo access key | `SvDmj2cOTYZmQQ3H` |
| `MOMO_SECRET_KEY` | Momo secret key | `PPuDXq1KowPT1ftR8DvlQTHhC03aul17` |
| `MOMO_API_ENDPOINT` | Momo API URL | `https://test-payment.momo.vn` |
| `MOMO_IPN_CALLBACK_URL` | IPN webhook URL | `https://yourdomain.com/api/momo-ipn/callback` |
| `MOMO_PAYMENT_REDIRECT_URL` | Payment return URL | `https://yourdomain.com/payment/callback` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5080/api` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |

## 🐛 Common Issues & Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string in appsettings.Development.json
# Ensure DB_PASSWORD in .env.development matches PostgreSQL user password
```

### Momo Payment Issues
- **QR Code Not Displaying**: Check if `MOMO_API_ENDPOINT` is correct
- **IPN Not Received**: Ensure callback URL is publicly accessible (use ngrok for local dev)
- **Signature Validation Failed**: Verify `MOMO_SECRET_KEY` matches your sandbox credentials

### CORS Errors
```csharp
// Update Program.cs if frontend URL changes
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:3000", "https://your-production-domain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### Migration Issues
```bash
# Drop database and recreate (CAUTION: Development only!)
dotnet ef database drop --force
dotnet ef database update

# Generate new migration
dotnet ef migrations add MigrationName
```

## 📚 Additional Documentation

- **Momo Integration Setup**: See `backend/MOMO_ERROR_CODES.md` for error code reference
- **API Documentation**: Available via Swagger at `http://localhost:5080/swagger` (development only)

## 📄 License

This project is private and proprietary.
