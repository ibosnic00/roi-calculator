import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { IoCalculatorOutline, IoSettingsOutline, IoTrendingUpOutline } from "react-icons/io5"
import { CalculationPage } from './pages/CalculationPage'
import { SettingsPage } from './pages/SettingsPage'
import { RentalDataProvider } from './contexts/RentalDataContext'
import { HomePage } from './pages/HomePage'
import { InvestmentComparisonPage } from './pages/InvestmentComparisonPage'
import './App.css'

function App() {
  return (
    <RentalDataProvider>
      <BrowserRouter basename="/roi-calculator">
        <div className="container">
          <header>
          <Link to="/" title="Home"><h1>Croatia</h1></Link>
            <nav className="main-nav">
              <Link to="/calculator" title="Calculator"><IoCalculatorOutline size={24} /></Link>
              <Link to="/investment" title="Investment Comparison"><IoTrendingUpOutline size={24} /></Link>
              <Link to="/settings" title="Settings"><IoSettingsOutline size={24} /></Link>
            </nav>
          </header>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calculator" element={<CalculationPage />} />
            <Route path="/investment" element={<InvestmentComparisonPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </RentalDataProvider>
  )
}
export default App

