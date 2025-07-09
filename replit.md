# Parking Payment System

## Overview

This is a QR code-based parking payment system built with React (frontend) and Express.js (backend). The system allows visitors to scan QR codes to pay for parking using Stripe, while providing admins with comprehensive management tools for rates, staff exemptions, and registration oversight.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state
- **UI Components**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Airtable for data storage and management
- **Payment Processing**: Stripe API integration
- **Session Management**: In-memory session storage

### Key Components

#### Customer Flow
1. **Payment Page** (`/payment`): QR code entry point for customers
   - License plate input with formatting
   - Duration selection (Half Day, Full Day, Weekly, Monthly)
   - Optional email for receipts
   - Stripe payment integration

2. **Confirmation Page** (`/confirmation`): Post-payment success screen
   - Payment confirmation details
   - Parking validity information

3. **Mobile Lookup** (`/mobile-lookup`): Quick parking status verification

#### Admin Interface
1. **Admin Overview**: Dashboard with system stats and quick actions
2. **QR Code Generator**: Create printable QR codes for parking locations
3. **Rate Management**: Dynamic pricing configuration for different parking durations
4. **Staff Exemptions**: Manage staff parking privileges with date ranges
5. **Registration Management**: View all registrations with filtering and export capabilities
6. **Registration Search**: Look up specific parking registrations and verify status

#### Airtable Schema
- **Users**: Admin authentication and role management
- **Parking Rates**: Configurable pricing tiers (half_day, full_day, weekly, monthly)
- **Parking Registrations**: Customer payment records with license plates and validity periods
- **Staff Exemptions**: Staff parking permissions with active date ranges

## Data Flow

1. **Customer Payment Process**:
   - QR scan → Payment form → Stripe payment intent → Database registration → Confirmation

2. **Admin Management**:
   - Rate updates → Database → Real-time pricing changes
   - Staff exemptions → Database → Parking verification system

3. **Parking Verification**:
   - License plate lookup → Check paid registrations and staff exemptions → Return status

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment processing with webhooks for payment confirmation
- **Stripe Elements**: Secure payment form components

### Database & Infrastructure
- **Airtable**: Cloud-based database with easy data management
- **Airtable API**: RESTful API for data operations and queries
- **Real-time Data**: Live data updates and synchronized records

### UI & Styling
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Consistent icon library

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Connected to Neon PostgreSQL instance
- **Environment Variables**: Stripe keys, database URL configuration

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: ESBuild compilation for Node.js deployment
- **Static Assets**: Served directly from Express in production

### Environment Configuration
- `AIRTABLE_API_KEY`: Airtable personal access token
- `AIRTABLE_BASE_ID`: Airtable base identifier
- `STRIPE_SECRET_KEY`: Server-side Stripe integration
- `VITE_STRIPE_PUBLIC_KEY`: Client-side Stripe integration

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025: Complete QR code parking payment system implementation
  ✓ Airtable database integration replacing PostgreSQL
  ✓ Stripe payment integration with secure processing
  ✓ QR code generation for parking locations
  ✓ Mobile-responsive customer payment flow
  ✓ Admin panel with sidebar navigation and overview dashboard
  ✓ QR generator integrated into admin panel
  ✓ Staff exemptions and rate management
  ✓ Mobile lookup for parking status verification
  ✓ CSV export functionality for registrations
  ✓ Clean customer-focused homepage without admin confusion
  ✓ Removed staff access button from customer interface - admins access via /admin URL
  ✓ Updated parking duration options to clear time-based choices (1h, 2h, 4h, 8h, 12h, 24h)
  ✓ Converted entire system to use British Pounds (GBP) with proper £ formatting