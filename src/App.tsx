import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { IoHomeOutline } from "react-icons/io5"
import { IoSettingsOutline } from "react-icons/io5"
import { CalculationPage } from './pages/CalculationPage'
import { SettingsPage } from './pages/SettingsPage'
import { RentalDataProvider } from './contexts/RentalDataContext'
import './App.css'

function App() {
  return (
    <RentalDataProvider>
      <BrowserRouter>
        <div className="container">
          <header>
            <h1>Zagreb</h1>
            <nav className="main-nav">
              <Link to="/" title="Home"><IoHomeOutline size={24} /></Link>
              <Link to="/settings" title="Settings"><IoSettingsOutline size={24} /></Link>
            </nav>
          </header>

          <Routes>
            <Route path="/" element={<CalculationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </RentalDataProvider>
  )
}

export default App
