
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import MainLayout from './components/layout/MainLayout'
import HomePage from './features/home/pages/HomePage'
import AuctionsPage from './features/auctions/pages/AuctionsPage'
import AuctionDetailPage from './features/auctions/pages/AuctionDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/subastas" element={<AuctionsPage />} />
          <Route
            path="/subastas/:auctionId"
            element={<AuctionDetailPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
