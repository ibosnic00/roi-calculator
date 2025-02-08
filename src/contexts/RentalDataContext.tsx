import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { RentalData } from '../utils/importedData'
import { initializeRentalData } from '../utils/importedData'

interface RentalDataContextType {
  rentalData: RentalData[];
}

const RentalDataContext = createContext<RentalDataContextType | undefined>(undefined)

export function RentalDataProvider({ children }: { children: ReactNode }) {
  const [rentalData, setRentalData] = useState<RentalData[]>([])

  // Load rental data on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await initializeRentalData()
      setRentalData(data)
    }
    loadData()
  }, [])

  return (
    <RentalDataContext.Provider value={{ rentalData }}>
      {children}
    </RentalDataContext.Provider>
  )
}

export const useRentalData = () => {
  const context = useContext(RentalDataContext)
  if (context === undefined) {
    throw new Error('useRentalData must be used within a RentalDataProvider')
  }
  return context
} 