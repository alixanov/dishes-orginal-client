import React, { useState } from "react";
import {
  useGetBrakHistoryQuery,
  useAddBrakMutation,
  useSearchProductsQuery,
} from "../../context/service/brak.service";
import { Table, Form, Input, Button, Select } from "antd";
import moment from "moment";
// import "./brak.css";

const { Option } = Select;

const Brak = () => {
  const { data: braks = [], isLoading: isLoadingBraks } =
    useGetBrakHistoryQuery();
  const [addBrak] = useAddBrakMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products = [], isLoading: isLoadingProducts } =
    useSearchProductsQuery(searchTerm, {
      skip: !searchTerm,
    });

  const [selectedUnit, setSelectedUnit] = useState("quantity");

  const stm = {
    kg_quantity: 'kg',
    quantity: 'dona',
    box_quantity: 'karobka',
    package_quantity: 'pachka',
  }

  const columns = [
    {
      title: "Mahsulot nomi",
      dataIndex: ["productId", "name"],
      key: "productId",
      render: (text) => text || "Tovar o'chirilgan"
    },
    {
      title: "Soni",
      render: (_, record) => record.unit === "box_quantity" ? record.quantity / record?.productId?.package_quantity_per_box / record?.productId?.quantity_per_package : record.unit === "package_quantity" ? record.quantity / record.productId?.quantity_per_package : record.unit === "quantity" ? record.quantity : null,
      key: "quantity",
    },
    {
      title: "Birlik",
      dataIndex: "unit",
      render: (text) => stm[text] || text,
      key: "unit",
    },
    { title: "Sababi", dataIndex: "reason", key: "reason" },
    { title: "Qo'shilgan vaqti", dataIndex: "createdAt", key: "createdAt", render: (text) => moment(text).format("DD.MM.YYYY HH:mm") },
  ];

  const onFinish = (values) => {
    const item = products.find((p) => p._id === values.productId);
    values.quantity = (selectedUnit === "quantity" ? values.quantity : selectedUnit === "package_quantity" ? values.quantity * item?.quantity_per_package : selectedUnit === "box_quantity" ? values.quantity * item?.quantity_per_package * item.package_quantity_per_box : null)
    addBrak(values);
  };

  return (
    <div className="brak-page">
      <h1>Brak Mahsulotlar</h1>
      <Form onFinish={onFinish} layout="inline">
        <Form.Item
          name="productId"
          label="Mahsulot"
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            placeholder="Mahsulotni qidiring"
            onSearch={(value) => setSearchTerm(value)}
            loading={isLoadingProducts}
            filterOption={false}
            style={{ width: 400 }}
          >
            {products.map((product) => (
              <Option key={product._id} value={product._id}>
                {product.name} - o'lcham: {product.size}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="quantity" label="Soni" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item
          name="unit"
          rules={[{ required: true, message: "O'lchov birlikni kiriting" }]}
        >
          <Select style={{ width: "150px" }} required onChange={(value) => setSelectedUnit(value)} value={selectedUnit} placeholder="Tanlang">
            <Select.Option value="quantity">Dona</Select.Option>
            <Select.Option value="package_quantity">Pachka</Select.Option>
            <Select.Option value="box_quantity">Karobka</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="reason" label="Sababi" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Qo'shish
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={columns}
        dataSource={braks}
        rowKey="_id"
        loading={isLoadingBraks}
      />
    </div>
  );
};

export default Brak;
