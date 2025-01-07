import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { rentalData as initialRentalData } from '../utils/rentalData'

interface RentalDataContextType {
  rentalData: typeof initialRentalData;
  removeRent: (sizeRange: number, neighborhood: string) => void;
  addRent: (sizeRange: number, neighborhood: string, rent: number) => void;
}

const RentalDataContext = createContext<RentalDataContextType | undefined>(undefined)

export function RentalDataProvider({ children }: { children: ReactNode }) {
  const [rentalData, setRentalData] = useState(() => {
    const saved = localStorage.getItem('rentalData')
    return saved ? JSON.parse(saved) : initialRentalData
  })

  useEffect(() => {
    localStorage.setItem('rentalData', JSON.stringify(rentalData))
  }, [rentalData])

  const removeRent = (sizeRange: number, neighborhood: string) => {
    setRentalData((prevData: typeof initialRentalData) => 
      prevData.map(range => {
        if (range.minSize === sizeRange) {
          const { [neighborhood]: removed, ...rest } = range.averageRents
          return {
            ...range,
            averageRents: rest
          }
        }
        return range
      })
    )
  }

  const addRent = (sizeRange: number, neighborhood: string, rent: number) => {
    setRentalData((prevData: typeof initialRentalData) => 
      prevData.map(range => {
        if (range.minSize === sizeRange) {
          return {
            ...range,
            averageRents: {
              ...range.averageRents,
              [neighborhood]: rent
            }
          }
        }
        return range
      })
    )
  }

  return (
    <RentalDataContext.Provider value={{ rentalData, removeRent, addRent }}>
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