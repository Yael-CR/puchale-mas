
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import MainLayout from './components/layout/MainLayout'
import HomePage from './features/home/pages/HomePage'
import AuctionsPage from './features/auctions/pages/AuctionsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/subastas" element={<AuctionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
