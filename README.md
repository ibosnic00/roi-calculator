# Zagreb ROI Calculator

A React application for calculating and comparing Return on Investment (ROI) for properties in Zagreb, Croatia. The app helps investors analyze different properties, compare their potential returns with S&P 500 investment, and manage rental data for different neighborhoods.

## 🚀 [Live Demo](https://ibosnic00.github.io/roi-calculator/)

![Demo](images/demo.gif)

## Project Structure

### Core Files
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Main application component with routing
- `src/App.css` - Global styles and responsive design

### Components
- `src/components/GraphView.tsx` - Investment comparison graph component using Recharts
  - Visualizes property value projections
  - Compares with S&P 500 returns
  - Configurable parameters for calculations
  - Interactive legend

### Pages
- `src/pages/CalculationPage.tsx` - Main calculator page
  - Property input form
  - Results table
  - Investment graph
- `src/pages/SettingsPage.tsx` - Rental data management
  - View/edit rental data by size range
  - Add/remove neighborhood data
  - Sort and filter capabilities

### Data Management
- `src/contexts/RentalDataContext.tsx` - Global rental data state management
  - Provides rental data to components
  - Handles data modifications
  - Persists changes to localStorage

### Types and Utils
- `src/types/Property.ts` - TypeScript interfaces for property data
- `src/utils/rentalData.ts` - Rental data utilities and initial data

## Features

### Property ROI Calculator
- Input property details (price, size, neighborhood, renovation costs)
- Automatic rent estimation based on neighborhood and size
- ROI calculation including:
  - Monthly rent
  - Property appreciation
  - Maintenance costs
  - Renovation costs

### Investment Comparison Graph
- Visual comparison of multiple properties
- S&P 500 investment comparison
- Adjustable parameters:
  - S&P 500 return rate
  - Property appreciation rate
  - Investment timeline
  - Various calculation methods

### Property Management
- Table view with sortable columns
- Editable fields:
  - Expected prices
  - Notes
  - Year
  - Maintenance costs
- Mobile-responsive design

### Rental Data Management
- Size range-based data organization
- Neighborhood rental price management
- Add/remove functionality
- Data persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```

## Technical Stack
- React 18
- TypeScript
- Recharts
- React Router
- Context API
- CSS Modules
- Vite

## Mobile Support
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized tables with horizontal scroll
- Adapted graph view for mobile devices 