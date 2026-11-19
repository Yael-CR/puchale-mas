
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import MainLayout from './components/layout/MainLayout'
import HomePage from './features/home/pages/HomePage'
import AuctionsPage from './features/auctions/pages/AuctionsPage'
import AuctionDetailPage from './features/auctions/pages/AuctionDetailPage'
import ProductCatalogPage from './features/products/pages/ProductCatalogPage'
import ProductsPage from './features/products/pages/ProductsPage'
import ProductCreatePage from './features/products/pages/ProductCreatePage'
import ProductEditPage from './features/products/pages/ProductEditPage'
import ProductDetailPage from './features/products/pages/ProductDetailPage'

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

          <Route path="/catalogo" element={<ProductCatalogPage />} />
          <Route path="/catalogo/:productId" element={<ProductDetailPage />} />
          <Route path="/productos/nuevo" element={<ProductCreatePage />} />
          <Route
            path="/productos/:productId/editar"
            element={<ProductEditPage />}
          />
          <Route path="/productos" element={<ProductsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
