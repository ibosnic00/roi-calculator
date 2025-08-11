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
      <BrowserRouter>
        <div className="container">
          <header>
            <div className="header-left">
              <Link to="/" title="Home"><h1>Croatia</h1></Link>
              
              {/* PayPal Donation Button - Under Croatia Title */}
              <div className="donation-button-container">
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                  <input type="hidden" name="cmd" value="_s-xclick" />
                  <input type="hidden" name="hosted_button_id" value="2D5XX5HZM3E2L" />
                  <input type="hidden" name="currency_code" value="EUR" />
                  <button
                    type="submit"
                    className="donation-button"
                  >
                    <span>Support the project ☕</span>
                  </button>
                </form>
                <img 
                  src="./paypal-link.png" 
                  alt="PayPal QR Code" 
                  className="donation-qr-tooltip"
                />
              </div>
            </div>
            
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

