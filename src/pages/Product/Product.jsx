import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  message,
  Popconfirm,
  Upload,
  Switch,
  Space,
} from "antd";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import {
  useAddProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../../context/service/product.service";
import {
  useGetProductsPartnerQuery,
  useDeleteProductPartnerMutation,
  useUpdateProductPartnerMutation,
} from "../../context/service/partner.service";
import { useGetWarehousesQuery } from "../../context/service/ombor.service";
import { MdEdit, MdDeleteForever, MdPrint } from "react-icons/md";
import axios from "axios";
import { FaArrowRight, FaUpload } from "react-icons/fa";
import "./product.css";

const { Option } = Select;

const generateBarcode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const BarcodePrint = React.forwardRef(({ barcode }, ref) => (
  <div ref={ref} style={{ width: "4cm", height: "3cm" }}>
    <Barcode value={barcode} width={2} height={60} fontSize={12} />
  </div>
));

const Product = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [editingProduct, setEditingProduct] = useState("");
  const [editingSource, setEditingSource] = useState("");
  const { data: products = [], isLoading: productsLoading } = useGetProductsQuery();
  const { data: partnerProducts = [], isLoading: partnerProductsLoading } = useGetProductsPartnerQuery();
  const { data: warehouses = [], isLoading: warehousesLoading } = useGetWarehousesQuery();
  const [addProduct] = useAddProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [deleteProductPartner] = useDeleteProductPartnerMutation();
  const [editProduct] = useUpdateProductMutation();
  const [editProductPartner] = useUpdateProductPartnerMutation();
  const [currentBarcode, setCurrentBarcode] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isPackage, setIsPackage] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");

  const allProducts = [
    ...products.map((product) => ({
      ...product,
      source: "product",
      name: product.name || "Noma'lum",
      barcode: product.barcode || "",
      name_partner: product.name_partner || "",
      partner_number: product.partner_number || "",
    })),
    ...partnerProducts.map((product) => ({
      ...product,
      source: "partner",
      name: product.name || "Noma'lum",
      barcode: product.barcode || "",
      name_partner: product.name_partner || "",
      partner_number: product.partner_number || "",
    })),
  ];

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", "65384e0beb6c45b817d791e806199b7e");

    try {
      const response = await axios.post("https://api.imgbb.com/1/upload", formData);
      const url = response.data.data.url;
      setImageUrl(url);
      message.success("Rasm muvaffaqiyatli yuklandi!");
    } catch (error) {
      console.error("Yuklashda xatolik:", error);
      message.error("Rasmni yuklashda xatolik yuz berdi.");
    }
  };

  const printRef = useRef();

  useEffect(() => {
    if (currentBarcode) {
      handlePrint();
    }
  }, [currentBarcode]);

  const handleAddProduct = () => {
    setModalVisible(true);
    setEditingSource("product");
  };

  const handleCancel = () => {
    setModalVisible(false);
    setImageUrl("");
    setEditingSource("");
    form.resetFields();
  };

  const handleImageModalCancel = () => {
    setImageModalVisible(false);
    setSelectedImage("");
  };

  const onFinish = async (values) => {
    try {
      if (!editingProduct) {
        const newBarcode = generateBarcode();
        setCurrentBarcode(newBarcode);
        values.barcode = newBarcode;
        values.isPackage = isPackage;
      }
      values.image_url = imageUrl;

      const total_kg = Number(values.total_kg)?.toFixed(2);
      values.kg_per_box = (total_kg / Number(values.box_quantity))?.toFixed(2);
      values.kg_per_package = isPackage
        ? (total_kg / Number(values.package_quantity))?.toFixed(2)
        : null;
      values.kg_per_quantity = (total_kg / Number(values.quantity))?.toFixed(2);

      if (editingProduct) {
        if (editingSource === "product") {
          await editProduct({
            id: editingProduct,
            data: values,
          }).unwrap();
          message.success("Mahsulot muvaffaqiyatli tahrirlandi!");
        } else if (editingSource === "partner") {
          await editProductPartner({
            id: editingProduct,
            data: values,
          }).unwrap();
          message.success("Mahsulot muvaffaqiyatli tahrirlandi!");
        }
      } else {
        await addProduct(values).unwrap();
        message.success("Mahsulot muvaffaqiyatli qo'shildi!");
      }
      form.resetFields();
      setEditingProduct("");
      setEditingSource("");
      setModalVisible(false);
      setImageUrl("");
    } catch (error) {
      if (error.data?.message?.includes("E11000 duplicate key error collection")) {
        message.error("Barcode must be unique");
      } else {
        message.error("Mahsulotni qo'shishda xatolik yuz berdi!");
        console.error("Error:", error);
      }
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setCurrentBarcode(""),
  });

  const handleDelete = async (id, source) => {
    if (source === "product") {
      await deleteProduct(id);
    } else if (source === "partner") {
      await deleteProductPartner(id);
    }
  };

  const columns = [
    {
      title: "Tovar",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {record.image_url ? (
            <img
              src={record.image_url}
              alt={record.name}
              className="table-product-image"
              onClick={() => {
                setSelectedImage(record.image_url);
                setImageModalVisible(true);
              }}
            />
          ) : (
            <div
              className="table-no-image"
              onClick={() => {
                setSelectedImage("");
                setImageModalVisible(true);
              }}
            >
              Rasm yo'q
            </div>
          )}
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Xamkor ismi",
      dataIndex: "name_partner",
      key: "name_partner",
      render: (text) => text || "-",
    },
    {
      title: "Xamkor raqami",
      dataIndex: "partner_number",
      key: "partner_number",
      render: (text) => text || "-",
    },
    {
      title: "Kod",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "O'lcham",
      dataIndex: "size",
      key: "size",
    },
    {
      title: "Umumiy vazni(kg)",
      dataIndex: "total_kg",
      key: "total_kg",
      render: (text) => text?.toFixed(2),
      align: "center", // Выравнивание чисел по центру
    },
    {
      title: "Dona soni",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Karobka soni",
      dataIndex: "box_quantity",
      key: "box_quantity",
      render: (text) => text?.toFixed(2),
      align: "center",
    },
    {
      title: "Pachka soni",
      key: "package_quantity",
      render: (_, record) =>
        record?.isPackage ? record?.package_quantity?.toFixed(2) : "-",
      align: "center",
    },
    {
      title: "Valyuta",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Tan narxi",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      render: (text, record) => `${record.purchasePrice?.value || "-"}`,
      align: "center",
    },
    {
      title: "Sotish narxi",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (text, record) => `${record.sellingPrice?.value || "-"}`,
      align: "center",
    },
    {
      title: "Ombor",
      dataIndex: "warehouse",
      key: "warehouse",
      render: (text, record) => record?.warehouse?.name || "-",
    },
    {
      title: "Shtrix kod",
      dataIndex: "barcode",
      key: "barcode",
    },
    {
      title: "Kategoriya",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <div className="table_actions" style={{ flexDirection: "column" }}>
          <Button
            type="primary"
            onClick={() => {
              setEditingProduct(record._id);
              setEditingSource(record.source);
              form.setFieldsValue({
                ...record,
                barcode: record.barcode,
                package_quantity: record.package_quantity?.toFixed(2),
                box_quantity: record.box_quantity?.toFixed(2),
              });
              setImageUrl(record.image_url);
              setModalVisible(true);
            }}
          >
            <MdEdit />
          </Button>
          <Popconfirm
            title="Mahsulotni o'chirmoqchimisiz"
            onCancel={() => { }}
            onConfirm={() => handleDelete(record._id, record.source)}
            okText="O'chirish"
            cancelText="Orqaga"
          >
            <Button type="primary">
              <MdDeleteForever />
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            onClick={() => setCurrentBarcode(record.barcode)}
          >
            <MdPrint />
          </Button>
        </div>
      ),
      align: "center",
    },
  ];

  const filteredProducts = allProducts.filter((product) => {
    const name = (product.name || "").toLowerCase();
    const barcode = (product.barcode || "").toLowerCase();
    const searchNameLower = searchName.toLowerCase();
    const searchBarcodeLower = searchBarcode.toLowerCase();

    return (
      (searchName ? name.includes(searchNameLower) : true) &&
      (searchBarcode ? barcode.includes(searchBarcodeLower) : true)
    );
  });

  return (
    <div className="product-container">
      <div className="page_header">
        <Space>
          <Button
            type="primary"
            onClick={handleAddProduct}
            className="product-add-button"
          >
            Tovar qo'shish
          </Button>
          <Input
            placeholder="Tovar nomini kiriting"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="product-search-input"
          />
          <Input
            placeholder="Shtrix kodni kiriting"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            className="product-search-input"
          />
        </Space>
        <div className="stats">
          <p>
            Umumiy tovar soni: {allProducts.reduce((a, b) => a + (b.quantity || 0), 0)}
          </p>
          <p>
            Umumiy tovar tan narxi (sum):{" "}
            {allProducts
              .filter((p) => p.currency === "SUM")
              .reduce(
                (acc, product) =>
                  acc + (product.quantity || 0) * (product.purchasePrice?.value || 0),
                0
              )
              .toLocaleString()}{" "}
            so'm
          </p>
          <p>
            Umumiy tovar tan narxi ($):{" "}
            {allProducts
              .filter((p) => p.currency === "USD")
              .reduce(
                (acc, product) =>
                  acc + (product.quantity || 0) * (product.purchasePrice?.value || 0),
                0
              )
              .toLocaleString()}
            $
          </p>
        </div>
      </div>

      <Table
        className="product-table" // Уникальный класс для таблицы
        columns={columns}
        dataSource={filteredProducts}
        loading={productsLoading || partnerProductsLoading}
        style={{ overflow: "auto", minWidth: "100%" }}
        rowKey="_id"
      />

      <Modal
        title={editingProduct ? "Tovar tahrirlash" : "Tovar qo'shish"}
        visible={modalVisible}
        onCancel={handleCancel}
        footer={null}
        className="product-modal"
      >
        <Form
          autoComplete="off"
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="product-form"
        >
          <Form.Item
            name="name"
            label="Tovar nomi"
            rules={[{ required: true, message: "Tovar nomini kiriting!" }]}
          >
            <Input placeholder="Tovar nomi" className="product-form-input" />
          </Form.Item>
          <Form.Item name="name_partner" label="Xamkor ismi">
            <Input placeholder="Xamkor ismi" className="product-form-input" />
          </Form.Item>
          <Form.Item name="partner_number" label="Xamkor raqami">
            <Input placeholder="Xamkor raqami" className="product-form-input" />
          </Form.Item>
          <Form.Item
            label="Tovar o'lchami"
            name="size"
            rules={[{ required: true, message: "O'lchamni kiriting" }]}
          >
            <Input placeholder="O'lcham" type="text" className="product-form-input" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Tovar kodi"
            rules={[{ required: true, message: "Mahsulot kodini kiriting" }]}
          >
            <Input placeholder="Kod" type="text" className="product-form-input" />
          </Form.Item>
          <Form.Item label="Tan narxi" name={["purchasePrice", "value"]}>
            <Input placeholder="Tan narxi" type="number" className="product-form-input" />
          </Form.Item>
          <Form.Item label="Sotish narxi" name={["sellingPrice", "value"]}>
            <Input placeholder="Sotish narxi" type="number" className="product-form-input" />
          </Form.Item>
          <Form.Item label="Umumiy vazni" name="total_kg">
            <Input placeholder="Umumiy vazni(kg)" type="number" className="product-form-input" />
          </Form.Item>
          <Form.Item label="Dona miqdori" name="quantity">
            <Input placeholder="Dona miqdori" type="number" className="product-form-input" />
          </Form.Item>
          <Form.Item label="Pachka miqdori" name="package_quantity">
            <Input
              disabled={!isPackage}
              placeholder="Pachka miqdori"
              type="number"
              className="product-form-input"
            />
          </Form.Item>
          <Form.Item label="1 pachkadagi dona miqdori" name="quantity_per_package">
            <Input
              disabled={!isPackage}
              placeholder="1 pachkadagi dona miqdori"
              type="number"
              className="product-form-input"
            />
          </Form.Item>
          <Form.Item label="Karobka miqdori" name="box_quantity">
            <Input placeholder="Karobka miqdori" type="number" className="product-form-input" />
          </Form.Item>
          <Form.Item
            label={`1 karobkadagi ${isPackage ? "pachka" : "dona"} miqdori`}
            name="package_quantity_per_box"
          >
            <Input
              placeholder={`1 karobkadagi ${isPackage ? "pachka" : "dona"} miqdori`}
              type="number"
              className="product-form-input"
            />
          </Form.Item>
          <div className="product-switch">
            <p className="product-switch-label">
              Karobka <FaArrowRight /> Dona
            </p>
            <Switch
              checked={isPackage}
              onChange={(checked) => setIsPackage(checked)}
              className="product-switch-toggle"
            />
            <p className="product-switch-label">
              Karobka <FaArrowRight /> Pachka <FaArrowRight /> Dona
            </p>
          </div>
          <Form.Item label="Valyuta" name="currency">
            <Select placeholder="Valyuta tanlash" className="product-form-select">
              <Option value="">Keyin kiritish</Option>
              <Option value="USD">USD</Option>
              <Option value="SUM">SUM</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Ombor"
            name="warehouse"
            rules={[{ required: true, message: "Ombor tanlang!" }]}
          >
            <Select
              placeholder="Ombor tanlash"
              loading={warehousesLoading}
              className="product-form-select"
            >
              {warehouses.map((warehouse) => (
                <Option key={warehouse._id} value={warehouse._id}>
                  {warehouse?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Kategoriya"
            name="category"
            rules={[{ required: true, message: "Kategoriyani kiriting!" }]}
          >
            <Input placeholder="Kategoriya" className="product-form-input" />
          </Form.Item>
          <Form.Item label="Barkod" name="barcode" hidden>
            <Input />
          </Form.Item>
          <Upload
            customRequest={({ file }) => handleUpload(file)}
            showUploadList={false}
          >
            <Button className="product-upload-button">
              <FaUpload /> Rasmni tanlash
            </Button>
          </Upload>
          <Form.Item>
            {imageUrl && (
              <div className="product-upload-preview">
                <p>Yuklangan rasm:</p>
                <img src={imageUrl} alt="Uploaded" className="product-upload-image" />
                <p>
                  <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                    Rasm URL manzili
                  </a>
                </p>
              </div>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="product-submit-button">
              {editingProduct ? "Tahrirlash" : "Tovar qo'shish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tovar rasmi"
        visible={imageModalVisible}
        onCancel={handleImageModalCancel}
        footer={null}
        className="image-modal"
      >
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Enlarged"
            className="enlarged-image"
          />
        ) : (
          <div className="no-image-placeholder">
            Rasm yo'q
          </div>
        )}
      </Modal>

      <div style={{ display: "none" }}>
        <BarcodePrint ref={printRef} barcode={currentBarcode} />
      </div>
    </div>
  );
};

export default Product;