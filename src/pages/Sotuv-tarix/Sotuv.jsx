import React, { useEffect, useState } from "react";
import { useGetSalesHistoryQuery } from "../../context/service/sales.service";
import { DatePicker, Input, Select, Table, Button, Space } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import moment from "moment";
import { useGetClientsQuery } from "../../context/service/client.service";

const { Option } = Select;

const Sales = () => {
  const { data: clients = [] } = useGetClientsQuery();
  const { data: sales = [], isLoading } = useGetSalesHistoryQuery();
  const [filters, setFilters] = useState({
    productName: "",
    productCode: "",
    paymentMethod: "",
    dateRange: [],
    selectedClient: "",
  });
  const [filteredSales, setFilteredSales] = useState([]);

  useEffect(() => {
    setFilteredSales(
      sales.filter((sale) => {
        const matchesProductName = sale.productId?.name
          ?.toLowerCase()
          .includes(filters.productName?.toLowerCase());

        const matchesProductCode = sale.productId?.code
          ?.toLowerCase()
          .includes(filters.productCode?.toLowerCase());
        const matchesClient = filters.selectedClient
          ? sale.clientId?._id === filters.selectedClient
          : true;

        const matchesPaymentMethod =
          !filters.paymentMethod || sale.paymentMethod === filters.paymentMethod;
        const matchesDateRange =
          !filters.dateRange.length ||
          (moment(sale.createdAt).isSameOrAfter(moment(filters.dateRange[0]), "day") &&
            moment(sale.createdAt).isSameOrBefore(moment(filters.dateRange[1]), "day"));
        return matchesProductName && matchesProductCode && matchesPaymentMethod && matchesDateRange && matchesClient;
      })
    );
  }, [filters, sales]);

  const generatePDF = (sale) => {
    const printWindow = window.open("", "", "width=600,height=600");

    if (!printWindow) {
      alert("Iltimos, brauzeringizda pop-up oynalarni ruxsat bering!");
      return;
    }

    const totalPrice = (sale.sellingPrice || 0) * (sale.quantity || 0);
    const paymentMethodText = sale.paymentMethod === "cash" ? "Naqd" : sale.paymentMethod === "card" ? "Karta" : "Noma'lum";

    // Determine buyer name - show client name if exists, otherwise show partner name
    const buyerName = sale.clientId?.name || sale.partnerName || "Noma'lum";

    const tableRow = `
      <tr>
        <td>1</td>
        <td>${sale.productId?.name || "Noma'lum mahsulot"}</td>
        <td>${sale.quantity || 0}</td>
        <td>${sale.sellingPrice || 0}</td>
        <td>${totalPrice.toLocaleString()}</td>
        <td>${paymentMethodText}</td>
        <td>${moment(sale.createdAt).format("DD.MM.YYYY HH:mm")}</td>
      </tr>
    `;

    const content = `
      <div style="width:210mm; height:297mm; padding:20px; font-family:Arial, sans-serif; color:#001529;">
        <h2 style="text-align:center; margin-bottom:20px;">
          ${moment().format("DD.MM.YYYY")} даги Хисобварак-фактура
        </h2>
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
          <div>
            <b>Етказиб берувчи:</b><br/>
            <p>${localStorage.getItem("user_login") || "Noma'lum"}</p>
          </div>
          <div>
            <b>Сотиб олувчи:</b><br/>
            <p>${buyerName}</p>
          </div>
        </div>
        <table border="1" style="border-collapse:collapse; width:100%; text-align:center;">
          <thead style="background:#001529; color:white;">
            <tr>
              <th>No</th>
              <th>Mahsulot nomi</th>
              <th>Soni</th>
              <th>Sotish narxi</th>
              <th>Umumiy summa</th>
              <th>To'lov usuli</th>
              <th>Sotish sanasi</th>
            </tr>
          </thead>
          <tbody>${tableRow}</tbody>
        </table>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head><title>Хисобварак-фактура - ${buyerName}</title></head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const columns = [
    {
      title: "Haridor",
      key: "buyer",
      render: (_, record) => (
        record.clientId?.name || record.partnerName || "Noma'lum"
      )
    },
    { title: "Mahsulot nomi", dataIndex: ["productId", "name"], key: "productId" },
    { title: "Mahsulot kodi", dataIndex: ["productId", "code"], key: "productId" },
    { title: "Mahsulot o'lchami", dataIndex: ["productId", "size"], key: "productId" },
    { title: "Ombor", dataIndex: ["warehouseId", "name"], key: "warehouseId" },
    { title: "Soni", dataIndex: "quantity", key: "quantity" },
    {
      title: "To'lov usuli",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text) => text === "cash" ? "Naqd" : text === "card" ? "Karta" : "Qarz"
    },
    {
      title: "Sotib olish narxi",
      key: "purchasePrice",
      render: (_, record) =>
        `${record.productId?.purchasePrice?.value || 0} ${record.productId?.currency || "N/A"}`,
    },
    {
      title: "Sotish narxi",
      dataIndex: "sellingPrice",
      render: (value) => (value ? `${value.toFixed(2)}` : "0.00"),
    },
    {
      title: "To'lov(so'm)",
      render: (_, record) => {
        const sum = record.payment?.sum;
        return sum !== undefined && sum !== null ? `${sum.toFixed(2)} so'm` : "0.00 so'm";
      },
    },
    {
      title: "To'lov($)",
      render: (_, record) => {
        const usd = record.payment?.usd;
        return usd !== undefined && usd !== null ? `${usd.toFixed(2)}$` : "0.00$";
      },
    },
    {
      title: "Sotish sanasi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Harakat",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => generatePDF(record)}
        >
          Chop etish
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="sales-page">
      <div className="page_header">
        <h1>Sotilgan Mahsulotlar</h1>
        <div className="header_actions">
          <Space>
            <Input
              style={{ width: "300px" }}
              placeholder="Mahsulot nomi"
              onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
            />
            <Input
              style={{ width: "200px" }}
              placeholder="Mahsulot kodi"
              onChange={(e) => setFilters({ ...filters, productCode: e.target.value })}
            />
            <Select
              style={{ width: "150px" }}
              onChange={(value) => setFilters({ ...filters, selectedClient: value })}
              value={filters.selectedClient}
            >
              <Option value="">Barchasi</Option>
              {clients.map((client) => (
                <Option key={client._id} value={client._id}>
                  {client.name}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: "150px" }}
              placeholder="To'lov usuli"
              onChange={(value) => setFilters({ ...filters, paymentMethod: value })}
              value={filters.paymentMethod}
            >
              <Option value="">Barchasi</Option>
              <Option value="cash">Naqd</Option>
              <Option value="card">Karta</Option>
            </Select>
            <DatePicker.RangePicker
              style={{ width: "300px" }}
              placeholder={["Dan", "Gacha"]}
              onChange={(dates, dateStrings) => {
                if (!dateStrings[0] || !dateStrings[1]) {
                  setFilters({ ...filters, dateRange: [] });
                } else {
                  setFilters({ ...filters, dateRange: dateStrings });
                }
              }}
            />
          </Space>
        </div>
      </div>
      <Table columns={columns} dataSource={filteredSales} rowKey="_id" />
    </div>
  );
};

export default Sales;