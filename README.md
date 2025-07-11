# Airfield Parking System

A modern parking management system for airfields with QR code scanning, Stripe payments, and Airtable integration.

## 🚀 Features

- **QR Code Generation** - Generate QR codes for parking spots
- **Mobile-First Design** - Optimized for mobile devices
- **Real-time Payments** - Stripe integration for secure payments
- **Airtable Database** - Cloud-based data storage and management
- **Admin Dashboard** - Comprehensive management tools
- **Staff Exemptions** - Manage staff parking permissions
- **Payment Tracking** - Complete payment history and receipts

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: Airtable
- **Payments**: Stripe
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account
- Airtable account

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_live_your_public_key
STRIPE_SECRET_KEY=sk_live_your_secret_key

# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/matthewhairsnape/masterairfieldparkingjuly.git
   cd masterairfieldparkingjuly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the `.env` file and add your credentials

4. **Start development server**
   ```bash
   npm run dev:local
   ```

5. **Open in browser**
   - Navigate to http://localhost:3000

## 📱 Usage

### For Visitors
1. Scan QR code at parking spot
2. Enter license plate and email
3. Select parking duration
4. Complete payment via Stripe
5. Receive confirmation

### For Administrators
1. Access admin panel at `/admin`
2. Manage parking rates
3. View registrations and payments
4. Manage staff exemptions
5. Generate reports

## 🗄️ Airtable Schema

The system uses the following Airtable tables:

- **Parking Rates** - Duration types and pricing
- **Parking Registrations** - All parking transactions
- **Staff Exemptions** - Staff parking permissions
- **Users** - Admin user accounts

## 💳 Payment Flow

1. User scans QR code
2. System creates parking registration
3. Stripe payment intent created
4. User completes payment
5. Registration status updated to 'paid'
6. Confirmation sent to user

## 🔐 Security

- All payments processed through Stripe
- Environment variables for sensitive data
- Input validation and sanitization
- Secure session management

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 API Endpoints

- `GET /api/parking-rates` - Get parking rates
- `POST /api/parking-registration` - Create registration
- `POST /api/create-payment-intent` - Create Stripe payment
- `POST /api/confirm-payment` - Confirm payment
- `GET /api/parking-registrations` - Get registrations
- `GET /api/check-parking-status` - Check parking status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for airfield parking management** 