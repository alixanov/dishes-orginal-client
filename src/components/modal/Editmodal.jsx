import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

export default function EditModal({ visible, onCancel, onOk, warehouse }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (warehouse) {
      form.setFieldsValue(warehouse);
    } else {
      form.resetFields();
    }
  }, [warehouse, form]);

  return (
    <Modal
      title="Ombor Ma'lumotlarini Taxrirlash"
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onOk({ ...values, _id: warehouse._id })}
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
  );
}
