import React, { useEffect, useState } from "react";
import { useGetSalesHistoryQuery } from "../../context/service/sales.service";
import { DatePicker, Input, Select, Table } from "antd";
import moment from "moment";
import { useGetClientsQuery } from "../../context/service/client.service";

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

  const columns = [
    { title: "Mijoz ismi", dataIndex: ["clientId", "name"], key: "clientId" },
    { title: "Mahsulot nomi", dataIndex: ["productId", "name"], key: "productId" },
    { title: "Mahsulot kodi", dataIndex: ["productId", "code"], key: "productId" },
    { title: "Mahsulot o'lchami", dataIndex: ["productId", "size"], key: "productId" },
    { title: "Ombor", dataIndex: ["warehouseId", "name"], key: "warehouseId" },
    { title: "Soni", dataIndex: "quantity", key: "quantity" },
    { title: "To'lov usuli", dataIndex: "paymentMethod", key: "paymentMethod" },
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
  ];

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="sales-page">
      <div className="page_header">
        <h1>Sotilgan Mahsulotlar</h1>
        <div className="header_actions">
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
          >
            <Select.Option value="">Barchasi</Select.Option>
            {clients.map((client) => (
              <Select.Option key={client._id} value={client._id}>
                {client.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            style={{ width: "150px" }}
            placeholder="To'lov usuli"
            onChange={(value) => setFilters({ ...filters, paymentMethod: value })}
          >
            <Select.Option value="">Barchasi</Select.Option>
            <Select.Option value="cash">Naqd</Select.Option>
            <Select.Option value="card">Karta</Select.Option>
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
        </div>
      </div>
      <Table columns={columns} dataSource={filteredSales} rowKey="_id" />
    </div>
  );
};

export default Sales;