# 🌍 TravelApp - Modern Travel Booking Platform

A comprehensive travel booking platform built with React, Vite, and Tailwind CSS, featuring modern design and complete API integration.

## ✨ Features

### 🏠 Landing Pages

- **Homepage**: Hero banners, featured activities, search functionality, trusted companies, FAQ section
- **Activities**: Browse and filter activities with advanced search, category filtering, price ranges
- **Activity Details**: Detailed activity pages with image galleries, reviews, booking functionality
- **Promotions**: Browse and apply promo codes with discount calculations

### 👤 User Features

- **User Dashboard**: Personalized dashboard with booking stats, quick actions, travel insights
- **Shopping Cart**: Add activities, manage quantities, apply promo codes
- **Checkout**: Complete booking process with payment method selection
- **Transaction History**: Track bookings, upload payment proofs, view order details
- **Profile Management**: Update personal information, security settings, preferences

### 🔐 Authentication

- **Login/Register**: Secure user authentication with form validation
- **Protected Routes**: Role-based access control for user and admin areas
- **Auto-redirect**: Intelligent navigation based on authentication status

### 🎨 Design System

- **Modern UI**: Clean, minimalist design with gradient accents
- **Responsive**: Mobile-first design that works on all devices
- **Consistent**: Unified component library with reusable components
- **Accessible**: WCAG compliant with proper contrast and navigation

## 🛠 Tech Stack

- **Frontend**: React 19.1.1 with hooks and Context API
- **Build Tool**: Vite 7.1.3 for fast development and building
- **Styling**: Tailwind CSS v4.1.12 for utility-first styling
- **Routing**: React Router 7.8.2 for client-side navigation
- **Icons**: Lucide React for consistent iconography
- **State Management**: Context API with useReducer for complex state

## 📁 Project Structure

```
src/
├── api/                    # API integration layer
│   ├── activity.js         # Activity CRUD operations
│   ├── auth.js            # Authentication endpoints
│   ├── banner.js          # Banner management
│   ├── cart.js            # Shopping cart operations
│   ├── category.js        # Category management
│   ├── payment-method.js  # Payment methods
│   ├── promo.js           # Promotion management
│   ├── transaction.js     # Transaction operations
│   └── user.js            # User profile management
├── components/            # Reusable UI components
│   ├── ActivityCard.jsx   # Activity display component
│   ├── BannerCard.jsx     # Banner display component
│   ├── CartCard.jsx       # Cart item component
│   ├── NavbarNew.jsx      # Modern navigation bar
│   ├── Footer.jsx         # Site footer
│   ├── LoadingSpinner.jsx # Loading states
│   ├── PromoCard.jsx      # Promotion display
│   ├── SearchSection.jsx  # Advanced search
│   └── UserLayout.jsx     # User page wrapper
├── hooks/                 # Custom React hooks
│   ├── useAuth.jsx        # Authentication state
│   ├── useCart.jsx        # Cart management
│   ├── useToast.jsx       # Toast notifications
│   └── useTravelDataNew.jsx # Travel data state
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   ├── landing/           # Public pages
│   └── user/              # Protected user pages
└── utils/                 # Utility functions
    ├── axios.js           # API client configuration
    ├── theme.js           # Theme configuration
    └── validation.js      # Form validation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd finalproject-travel
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables
   Create a `.env` file with your API configuration:

```env
VITE_API_BASE_URL=your_api_base_url
VITE_API_KEY=your_api_key
```

4. Start development server

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🔌 API Integration

The application integrates with a complete travel API supporting:

- **Authentication**: User registration, login, logout, profile management
- **Activities**: Browse, search, filter, and book travel activities
- **Banners**: Dynamic promotional banners and hero content
- **Categories**: Activity categorization and filtering
- **Cart**: Shopping cart functionality with item management
- **Promotions**: Discount codes and special offers
- **Transactions**: Booking creation, payment tracking, order history
- **Payment Methods**: Multiple payment options and processing

## 🎯 Key Features Implemented

### 🛒 Shopping Experience

- Add activities to cart with quantity selection
- Apply promo codes for discounts
- Secure checkout process with payment method selection
- Real-time cart updates and total calculations

### 📱 User Experience

- Responsive design for mobile, tablet, and desktop
- Intuitive navigation with breadcrumbs and search
- Loading states and error handling
- Toast notifications for user feedback
- Smooth animations and micro-interactions

### 💳 Payment Flow

- Multiple payment method support
- Payment proof upload functionality
- Transaction status tracking
- Order history with detailed breakdowns

### 🔍 Search & Discovery

- Advanced activity search with filters
- Category-based browsing
- Price range filtering
- Rating and review system
- Location-based recommendations

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design Principles

- **Minimalist**: Clean interfaces with plenty of whitespace
- **Modern**: Contemporary design patterns and interactions
- **Consistent**: Unified color scheme and typography
- **Accessible**: Keyboard navigation and screen reader support
- **Performance**: Optimized images and lazy loading

## 🔒 Security Features

- JWT token-based authentication
- Protected routes for sensitive areas
- Input validation and sanitization
- Secure API communication
- Role-based access control

## 📞 Support

For support and questions, please contact:

- Email: support@travelapp.com
- Phone: +62 21 1234 5678

---

Built with ❤️ for travelers by the TravelApp team.
