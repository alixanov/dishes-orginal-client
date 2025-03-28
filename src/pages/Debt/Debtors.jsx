import React, { useState } from "react";
import { Table, Button, message, Modal, Input, Select } from "antd";
import {
  useGetAllDebtorsQuery,
  usePayDebtMutation,
} from "../../context/service/debt.service";
import { EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { FaChevronLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Debtors = () => {
  const { data: debtors = [] } = useGetAllDebtorsQuery();
  const [payDebt] = usePayDebtMutation();
  const role = localStorage.getItem("role");
  const navigate = useNavigate()
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("")
  const handlePayDebt = async (debtId) => {
    try {
      await payDebt({ id: debtId, amount: paymentAmount, currency: selectedCurrency }).unwrap();
      setSelectedCurrency("")
      setPaymentAmount(null)
      message.success("Qarz muvaffaqiyatli to'landi");
      setIsModalVisible(false);
    } catch (error) {
      message.error("Qarz to'lashda xatolik yuz berdi");
    }
  };
  const debtorsColumn = [
    {
      title: "Mijoz ismi",
      dataIndex: ["clientId", "name"],
      key: "clientId.name",
    },
    {
      title: "Telefon raqami",
      dataIndex: ["clientId", "phone"],
      key: "clientId.phone",
    },
    {
      title: "Manzil",
      dataIndex: ["clientId", "address"],
      key: "clientId.address",
    },
    ...(role === "admin" ? [
      {
        title: "Tovar nomi",
        dataIndex: ["productId", "name"],
        key: "productId.name",
      },

      {
        title: "Sotish narxi", dataIndex: "sellingPrice", key: "sellingPrice"
      },
      {
        title: "Valyuta", dataIndex: "currency", key: "currency"
      },
      { title: "Soni", dataIndex: "quantity", key: "quantity" },
      { title: "Umumiy summa", dataIndex: "totalAmount", key: "totalAmount" }] : []),
    {
      title: "Qoldiq summa",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
    },
    { title: "Qarz muddati", dataIndex: "dueDate", render: (text) => moment(text).format("DD.MM.YYYY"), key: "dueDate" },
    {
      title: "Holati",
      dataIndex: "status",
      key: "status",
      render: (status) => (status === "paid" ? "To'langan" : "To'lanmagan"),
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <div className="table_actions">
          {record.status === "pending" && (
            <Button
              type="primary"
              onClick={() => {
                setSelectedDebtor(record);
                setIsModalVisible(true);
              }}
            >
              To'lash
            </Button>
          )}
          {
            role !== "seller" && (

              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedDebtor(record);
                  setIsHistoryModalVisible(true);
                }}
              >
                Tarix
              </Button>
            )
          }
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page_header" style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff", height: "40px", marginTop: "10px" }}>

        <h1 style={{ color:"#001529"}} >Qarzdorlar</h1>
        {
          role !== "admin" && (
            <Button onClick={() => navigate("/")} type="primary">
              <FaChevronLeft />
            </Button>
          )
        }
      </div>
      <Table columns={debtorsColumn} dataSource={debtors} rowKey="_id" />
      <Modal
        title="Qarz to'lash"
        visible={isModalVisible}
        onOk={() => handlePayDebt(selectedDebtor._id)}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          type="number"
          placeholder="To'lov miqdorini kiriting"
          step={0.001}
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
        />
        <Select
          style={{ width: "100%", marginTop: "12px" }}
          type="text"
          placeholder="To'lov valyutasini tanlang"
          value={selectedCurrency}

          onChange={(value) => setSelectedCurrency(value)}
        >
          <Select.Option value="USD">USD</Select.Option>
          <Select.Option value="SUM">SUM</Select.Option>
        </Select>
      </Modal>
      <Modal
        title="To'lovlar tarixi"
        visible={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
      >
        <Table
          columns={[
            {
              title: "To'lov miqdori",
              dataIndex: "amount",
              key: "amount",
            },
            {
              title: "Valyuta",
              dataIndex: "currency",
              key: "currency",
            },
            {
              title: "To'lov sanasi",
              dataIndex: "date",
              key: "date",
              render: (date) => new Date(date).toLocaleString(),
            },
          ]}
          dataSource={selectedDebtor ? selectedDebtor.paymentHistory : []}
          rowKey={(record) => record.date}
        />
      </Modal>
    </div>
  );
};

export default Debtors;
