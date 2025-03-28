import React, { useState, useEffect } from "react";
import { Button, Tabs } from "antd";
import "antd/dist/reset.css";
import "./admin.css";
import { UserAddOutlined } from "@ant-design/icons";
import Adminlar from "../Adminlar/Adminlar";
import EditProductModal from "../../components/modal/Editmodal"; // Tahrirlash modal komponenti
import { useGetUsdRateQuery } from "../../context/service/usd.service"; // USD kursi uchun xizmat

const Admin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal oynasi holatini boshqarish
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Tahrirlash modal oynasi holatini boshqarish
  const [barcode, setBarcode] = useState(""); // Shtrix kod holati
  const access = JSON.parse(localStorage.getItem("acsess")); // Foydalanuvchi huquqlarini olish
  const [editingProduct, setEditingProduct] = useState(null); // Hozir tahrirlanayotgan mahsulot
  const { data: usdRateData } = useGetUsdRateQuery(); // USD kursini olish
  const [usdRate, setUsdRate] = useState(usdRateData?.rate || 1); // USD kursi holati
  useEffect(() => {
    if (usdRateData) {
      setUsdRate(usdRateData.rate);
    }
  }, [usdRateData]);

  // Modal oynasi ochilganda shtrix kod yaratish
  useEffect(() => {
    if (isModalOpen) {
      const generateBarcode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setBarcode(code);
      };
      generateBarcode();
    }
  }, [isModalOpen]);

  // USD kursi o'zgarganda mahsulotlar ro'yxatini yangilash
  useEffect(() => {}, [usdRate]);

  // Tahrirlash modal oynasini yopish
  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="admin-container">
      <Tabs defaultActiveKey="1" style={{ flexGrow: 1, width: "100%" }}>
        {access?.adminlar && (
          <Tabs.TabPane
            tab={
              <Button type="default" icon={<UserAddOutlined />}>
                Admin qo'shish
              </Button>
            }
            key="2"
          >
            <Adminlar />
          </Tabs.TabPane>
        )}
      </Tabs>
      <EditProductModal
        visible={isEditModalOpen}
        onCancel={handleEditComplete}
        product={editingProduct}
        usdRate={usdRate}
      />
    </div>
  );
};

export default Admin;
