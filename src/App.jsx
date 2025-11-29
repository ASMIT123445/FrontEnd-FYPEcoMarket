import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgetPassword from "./components/ForgetPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";   // spelled as Pasword


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<ProductList />} /> */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;