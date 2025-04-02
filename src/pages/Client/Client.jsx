import React, { useState } from "react";
import { Table, Button, Modal, message, Popover, Tooltip } from "antd";
import { UserOutlined, EyeOutlined, DollarOutlined } from "@ant-design/icons";
import {
  useGetClientsQuery,
  useGetClientHistoryQuery,
} from "../../context/service/client.service";
import {
  useGetDebtsByClientQuery,
  usePayDebtMutation,
} from "../../context/service/debt.service";
import moment from "moment";

const Client = () => {
  const { data: clients = [], isLoading: clientsLoading } = useGetClientsQuery();
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data: clientHistory = [] } = useGetClientHistoryQuery(selectedClient?._id, {
    skip: !selectedClient,
  });
  const { data: debts = [] } = useGetDebtsByClientQuery(selectedClient?._id, {
    skip: !selectedClient,
  });
  const [payDebt] = usePayDebtMutation();

  const handlePayDebt = async (debtId, amount, currency) => {
    try {
      await payDebt({
        id: debtId,
        amount: amount,
        currency,
      }).unwrap();
      message.success("Qarz muvaffaqiyatli to'landi");
    } catch (error) {
      message.error("Qarz to'lashda xatolik yuz berdi");
    }
  };

  const clientColumns = [
    {
      title: "Ismi",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          {text}
        </span>
      ),
    },
    { title: "Telefon raqami", dataIndex: "phone", key: "phone" },
    { title: "Manzil", dataIndex: "address", key: "address" },
    {
      title: "Amallar",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedClient(record);
            setIsModalVisible(true);
          }}
        >
          Ko'rish
        </Button>
      ),
    },
  ];

  const combinedData = [
    ...(clientHistory?.map((sale) => ({ ...sale, type: "sale" })) || []),
    ...(debts?.map((debt) => ({ ...debt, type: "debt" })) || []),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const historyAndDebtColumns = [
    { title: "Tovar nomi", dataIndex: ["productId", "name"], key: "productId.name" },
    { title: "Soni", dataIndex: "quantity", key: "quantity" },
    { title: "Sotish narxi", dataIndex: "sellingPrice", key: "sellingPrice" },
    { title: "Valyuta", dataIndex: "currency", key: "currency" },
    { title: "Chegirma(%)", dataIndex: "discount", key: "discount" },
    {
      title: "Umumiy summa",
      key: "total",
      render: (_, record) =>
        record.sellingPrice && record.quantity ? (record.sellingPrice * record.quantity).toLocaleString() : "-",
    },
    { title: "Qoldiq qarz", dataIndex: "remainingAmount", key: "amount" },
    {
      title: "Holati",
      dataIndex: "type",
      key: "type",
      render: (_, record) =>
        record.type === "debt" ? (record.status === "paid" ? "To'langan" : "To'lanmagan") : "Sotilgan",
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (text ? moment(text).format("DD.MM.YYYY") : "-"),
    },
    {
      title: "Amallar",
      render: (_, record) =>
        record.type === "debt" && (
          <div className="table_actions">
            {record.status === "pending" && (
              <Tooltip
                title={
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const amount = Number(e.target[0].value);
                      const currency = e.target[1].value;
                      handlePayDebt(record._id, amount, currency);
                    }}
                    className="modal_form"
                  >
                    <input
                      type="number"
                      step={0.001}
                      required
                      placeholder="To‘lov summasi"
                    />
                    <select required>
                      <option value="" disabled selected>
                        Valyutani tanlang
                      </option>
                      <option value="USD">USD</option>
                      <option value="SUM">SUM</option>
                    </select>
                    <button type="submit">Tasdiqlash</button>
                  </form>
                }
                trigger="click"
              >
                <Button type="primary">To'lash</Button>
              </Tooltip>
            )}
            <Popover
              content={
                <div>
                  {record.paymentHistory?.map((payment, index) => (
                    <p key={index}>
                      {moment(payment.date).format("DD.MM.YYYY")}: {payment.amount} {payment.currency}
                    </p>
                  ))}
                </div>
              }
              title="To'lov tarixi"
            >
              <Button style={{ marginLeft: 8 }}>To'lov tarixi</Button>
            </Popover>
          </div>
        ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5" }}>
      <h1 style={{ color: "#001529", marginBottom: "24px" }}>Xaridorlar</h1>
      <Table
        columns={clientColumns}
        dataSource={clients}
        rowKey="_id"
        loading={clientsLoading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "Xaridorlar mavjud emas" }}
      />
      <Modal
        title={`${selectedClient?.name} tarixi va qarzlari`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1440}
      >
        <Table
          columns={historyAndDebtColumns}
          dataSource={combinedData}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );
};

export default Client;