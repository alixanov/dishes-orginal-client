import React from "react";
import { Button } from "antd";

const PrintButton = () => {
  const printDocument = () => {
    if (window.nativefier) {
      window.nativefier.print();
    } else {
      window.print();
    }
  };

  return (
    <Button type="primary" onClick={printDocument}>
      Print Document
    </Button>
  );
};

export default PrintButton;
