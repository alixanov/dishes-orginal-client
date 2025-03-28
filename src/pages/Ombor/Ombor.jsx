import React, { useState } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  message,
  Space,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useAddWarehouseMutation,
  useGetWarehousesQuery,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} from "../../context/service/ombor.service";
import { useGetProductsByWarehouseQuery } from "../../context/service/product.service";
import "./Ombor.css";

export default function Ombor() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isProductsModalVisible, setIsProductsModalVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [form] = Form.useForm();
  const [addWarehouse] = useAddWarehouseMutation();
  const [updateWarehouse] = useUpdateWarehouseMutation();
  const [deleteWarehouse] = useDeleteWarehouseMutation();
  const { data: omborlar = [], refetch } = useGetWarehousesQuery();
  const { data: products = [] } = useGetProductsByWarehouseQuery(
    selectedWarehouse?._id,
    {
      skip: !selectedWarehouse,
    }
  );

  // Состояния для поиска
  const [searchName, setSearchName] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
  };

  const handleAddOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        form.resetFields();
        try {
          await addWarehouse(values).unwrap();
          refetch();
          setIsAddModalVisible(false);
          message.success("Ombor muvaffaqiyatli qo'shildi");
        } catch (error) {
          console.error("Error adding warehouse: ", error);
          message.error("Ombor qo'shishda xatolik yuz berdi");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsEditModalVisible(true);
    form.setFieldsValue({
      name: warehouse.name,
      address: warehouse.address,
    });
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setSelectedWarehouse(null);
  };

  const handleEditOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          await updateWarehouse({
            id: selectedWarehouse._id,
            ...values,
          }).unwrap();
          refetch();
          setIsEditModalVisible(false);
          setSelectedWarehouse(null);
          message.success("Ombor muvaffaqiyatli tahrirlandi");
        } catch (error) {
          console.error("Error updating warehouse: ", error);
          message.error("Ombor tahrirlashda xatolik yuz berdi");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleDelete = async (id) => {
    try {
      await deleteWarehouse(id).unwrap();
      refetch();
      message.success("Ombor muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting warehouse: ", error);
      message.error("Ombor o'chirishda xatolik yuz berdi");
    }
  };

  const handleViewProducts = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsProductsModalVisible(true);
    setSearchName(""); // Сброс поиска при открытии
    setSearchBarcode("");
  };

  const handleProductsModalCancel = () => {
    setIsProductsModalVisible(false);
    setSelectedWarehouse(null);
    setSearchName(""); // Сброс поиска при закрытии
    setSearchBarcode("");
  };

  const columns = [
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Joylashuvi",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Siz shu ma'lumotni o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewProducts(record)}
          />
        </Space>
      ),
    },
  ];

  const productColumns = [
    {
      title: "Mahsulot Nomi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Soni",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Birlik",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Sotib Olish Narxi",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      render: (text, record) =>
        `${record.purchasePrice.value} ${record.currency}`,
    },
    {
      title: "Sotish Narxi",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (text, record) =>
        `${record.sellingPrice.value} ${record.currency}`,
    },
    {
      title: "Kategoriya",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Shtrix Kod",
      dataIndex: "barcode",
      key: "barcode",
    },
  ];

  // Фильтрация продуктов по названию и штрих-коду
  const filteredProducts = products.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesBarcode = product.barcode
      ?.toLowerCase()
      .includes(searchBarcode.toLowerCase());
    return (
      (searchName ? matchesName : true) &&
      (searchBarcode ? matchesBarcode : true)
    );
  });

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showAddModal}
        style={{ marginBottom: 16 }}
      >
        Yangi Ombor Qo'shish
      </Button>
      <Table columns={columns} dataSource={omborlar} rowKey="_id" />
      <Modal
        title="Yangi Ombor Qo'shish"
        visible={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={form} layout="vertical" name="ombor_form">
          <Form.Item
            name="name"
            label="Ombor Nomi"
            rules={[
              { required: true, message: "Iltimos, ombor nomini kiriting!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Joylashuvi"
            rules={[
              { required: true, message: "Iltimos, joylashuvni kiriting!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Ombor Ma'lumotlarini Taxrirlash"
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="edit_ombor_form"
          initialValues={selectedWarehouse}
        >
          <Form.Item
            name="name"
            label="Ombor Nomi"
            rules={[
              { required: true, message: "Iltimos, ombor nomini kiriting!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Joylashuvi"
            rules={[
              { required: true, message: "Iltimos, joylashuvni kiriting!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Ombordagi Mahsulotlar"
        visible={isProductsModalVisible}
        onCancel={handleProductsModalCancel}
        footer={null}
        width="80%"
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Mahsulot nomini kiriting"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 200 }}
          />
          <Input
            placeholder="Shtrix kodni kiriting"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            style={{ width: 200 }}
          />
        </Space>
        <Table
          columns={productColumns}
          dataSource={filteredProducts}
          rowKey="_id"
        />
      </Modal>
    </div>
  );
}