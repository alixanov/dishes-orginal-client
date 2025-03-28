import React from "react";
import { Modal, Button } from "antd";
import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

const PrintBarcodeModal = ({ visible, onCancel, barcode }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (visible) {
      try {
        JsBarcode(barcodeRef.current, barcode, { format: "CODE128" });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [visible, barcode]);




  const handlePrint = () => {
    const printWindow = window.open("", "_blank"); // Yangi oyna ochish
    const printContent = barcodeRef.current.parentElement.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Shtrix kodni chop etish</title>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; }
            svg { width: 100%; max-width: 300px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };


  return (
    <Modal
      title="Shtrix kodni chop etish"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Bekor qilish
        </Button>,
        <Button key="submit" type="primary" onClick={handlePrint}>
          Chop etish
        </Button>,
      ]}
    >
      <svg ref={barcodeRef}></svg>
    </Modal>
  );
};

export default PrintBarcodeModal;
