import React, { memo } from "react";
import "./table.css";

export const Table = memo(({ children }) => {
  return (
    <table className="table" border="1">
      {children}
    </table>
  );
});
