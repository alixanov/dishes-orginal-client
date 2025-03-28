import React, { memo } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";
import Login from "./pages/auth/login";
import Admin from "./pages/admin/admin";
import Home from "./pages/Home/Home";
import Kassa from "./pages/Kassa/Kassa";
import Debtors from "./pages/Debt/Debtors";

export const Routera = memo(() => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token") || null;

  return (
    <>
      {token ? (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={role === "admin" ? <Home /> : <Kassa />} />
            <Route path="/debtors" element={<Debtors />} />
            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Route>
        </Routes>
      ) : (
        <Login />
      )}
    </>
  );
});

export default Routera;
