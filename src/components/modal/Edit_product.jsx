import React, { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { useUpdateProductMutation } from "../../context/service/product.service";
import { useGetWarehousesQuery } from "../../context/service/ombor.service";

const { Option } = Select;

export default function EditProductModal({ visible, onCancel, product }) {
  const [form] = Form.useForm();
  const [updateProduct] = useUpdateProductMutation();
  const { data: warehouses = [], isLoading: warehousesLoading } =
    useGetWarehousesQuery();

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        unit: product.unit,
        purchasePrice: product.purchasePrice.value,
        sellingPrice: product.sellingPrice.value,
        currency: product.currency,
        warehouse: product.warehouse._id,
        category: product.category,
        barcode: product.barcode,
      });
    }
  }, [product, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.purchasePrice = { value: parseFloat(values.purchasePrice) };
      values.sellingPrice = { value: parseFloat(values.sellingPrice) };
      await updateProduct({ id: product._id, ...values }).unwrap();
      message.success("Product updated successfully");
      onCancel();
    } catch (error) {
      message.error("Failed to update product");
    }
  };

  return (
    <Modal
      title="Edit Product"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical" name="edit_product_form">
        <Form.Item
          name="name"
          rules={[
            { required: true, message: "Please input the product name!" },
          ]}
        >
          <Input placeholder="Product Name" />
        </Form.Item>
        <Form.Item
          name="unit"
          rules={[{ required: true, message: "Please select the unit!" }]}
        >
          <Select placeholder="Select Unit">
            <Option value="kg">Kilogram</Option>
            <Option value="dona">Dona</Option>
            <Option value="karobka">Karobka</Option>
            <Option value="pachka">Pachka</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="purchasePrice"
        >
          <Input placeholder="Purchase Price" type="number" />
        </Form.Item>
        <Form.Item
          name="size"
          rules={[{ required: true, message: "O'lchamni kiriting" }]}
        >
          <Input placeholder="O'lcham" type="number" />
        </Form.Item>
        <Form.Item
          name="code"
          rules={[{ required: true, message: "Mahsulot kodini kiriting" }]}
        >
          <Input placeholder="Kod" type="text" />
        </Form.Item>
        <Form.Item
          name="sellingPrice"
        >
          <Input placeholder="Selling Price" type="number" />
        </Form.Item>
        <Form.Item
          name="currency"
        >
          <Select placeholder="Select Currency">
            <Option value="">Keyin kiritish</Option>

            <Option value="USD">USD</Option>
            <Option value="SUM">SUM</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="warehouse"
          rules={[{ required: true, message: "Please select the warehouse!" }]}
        >
          <Select placeholder="Select Warehouse" loading={warehousesLoading}>
            {warehouses.map((warehouse) => (
              <Option key={warehouse._id} value={warehouse._id}>
                {warehouse.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="category"
          rules={[{ required: true, message: "Please input the category!" }]}
        >
          <Input placeholder="Category" />
        </Form.Item>
        <Form.Item
          name="barcode"
          hidden // Barcode ni foydalanuvchi ko'ra olmaydi
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
