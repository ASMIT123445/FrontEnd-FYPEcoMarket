import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer, ConfirmDialog } from "./components/Toast";

import LandingPage from "./components/LandingPage";
import Home from "./components/Home";
import Main from "./components/Main";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import SellerOnboarding from "./components/SellerOnBoarding";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerification from "./components/EmailVerification";
import AddProduct from "./components/AddProduct";
import ProductDetail from "./components/ProductDetail";
import ShoppingCart from "./components/ShoppingCart";
import Payment from "./components/Payment";
import OrderConfirmation from "./components/OrderConfirmation";
import Profile from "./components/Profile";
import ViewAll from "./components/ViewAll";
import Wishlist from "./components/Wishlist";
import SellerDashboard from "./components/SellerDashboard";
import OrderTracking from "./components/OrderTracking";
import Chat from "./components/Chat";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <ConfirmDialog />
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

        <Route path="/main" element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        } />

        <Route path="/product/:id" element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        } />

        <Route path="/cart" element={
          <ProtectedRoute>
            <ShoppingCart />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />

        <Route path="/order-confirmation" element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/view-all" element={
          <ProtectedRoute>
            <ViewAll />
          </ProtectedRoute>
        } />

        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />

        {/* Seller Routes */}
        <Route path="/seller/onboarding" element={
          <ProtectedRoute>
            <SellerOnboarding />
          </ProtectedRoute>
        } />

        <Route path="/seller-dashboard" element={
          <ProtectedRoute>
            <SellerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/add-product" element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        } />

        <Route path="/track-order/:orderId" element={
          <ProtectedRoute>
            <OrderTracking />
          </ProtectedRoute>
        } />

        <Route path="/chat/:orderId/:sellerId" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
