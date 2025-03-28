import React, { memo } from "react";
import "./loading.css";
import { useSelector } from "react-redux";

export const Loading = memo(() => {
  const loading = useSelector((state) => state.loading);
  const circle = Array.from({ length: 20 }, (_, i) => i + 1);
  return (
    <div className={loading ? "loading-box active" : "loading-box"}>
      {circle.map((item) => (
        <span key={item} className={`circle circle-${item}`}></span>
      ))}
    </div>
  );
});


