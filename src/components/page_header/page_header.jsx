import React, { memo } from "react";
import "./page_header.css";

export const PageHeader = memo(({  children }) => {
  return (
    <div className="page-header">
      <div className="page-header__actions">{children}</div>
    </div>
  );
});
