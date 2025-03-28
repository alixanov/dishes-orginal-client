import { memo } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

export const Auth = memo(() => {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  if (token) return <Outlet />;
  return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
});
// 
// 