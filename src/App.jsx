import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import SellerOnboarding from "./components/SellerOnBoarding";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<ProductList />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/seller/onboarding" element={<SellerOnboarding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
