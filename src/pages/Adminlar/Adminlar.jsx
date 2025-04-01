import React, { useState } from "react";
import { Button, Modal, Form, Input, message, Checkbox, Table } from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useSignUpAsAdminMutation,
  useGetUsersQuery,
  useDeleteAdminMutation,
  useUpdateAdminMutation,
} from "../../context/service/adminlar.service";
import "./adminlar.css";

const { confirm } = Modal;

export default function Adminlar() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [signUpAsAdmin] = useSignUpAsAdminMutation();
  const { data: admins, isLoading, refetch } = useGetUsersQuery();
  const [deleteAdmin] = useDeleteAdminMutation();
  const [updateAdmin] = useUpdateAdminMutation();
  const [form] = Form.useForm();

  const showModal = () => setIsModalVisible(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingAdmin(null);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    const { name, login, password, role } = values;

    // Устанавливаем значения по умолчанию для permissions, если success не передается
    const permissions = {
      home: false,
      statistika: false,
      admin: false,
      ombor: false,
      kassa: false,
      product: false,
      partner: false,
      client: false,
      debtors: false,
      promo: false,
      sales: false,
      brak: false,
      expense: false,
      report: false,
      "report-add": false,
    };

    const payload = { name, login, password, role, success: permissions };

    try {
      await signUpAsAdmin(payload).unwrap();
      message.success("Foydalanuvchi muvaffaqiyatli qo'shildi!");
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error("Foydalanuvchini qo'shishda xatolik yuz berdi.");
    }
  };

  const handleEditFinish = async (values) => {
    const { name, login, password, role, success = [] } = values;

    const permissions = {
      home: success.includes("home"),
      statistika: success.includes("statistika"),
      admin: success.includes("admin"),
      ombor: success.includes("ombor"),
      kassa: success.includes("kassa"),
      product: success.includes("product"),
      partner: success.includes("partner"),
      client: success.includes("client"),
      debtors: success.includes("debtors"),
      promo: success.includes("promo"),
      sales: success.includes("sales"),
      brak: success.includes("brak"),
      expense: success.includes("expense"),
      report: success.includes("report"),
      "report-add": success.includes("report-add"),
    };

    const payload = {
      id: editingAdmin._id,
      name,
      login,
      password,
      role,
      success: permissions,
    };

    try {
      await updateAdmin(payload).unwrap();
      message.success("Foydalanuvchi muvaffaqiyatli yangilandi!");
      setIsEditModalVisible(false);
      setEditingAdmin(null);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error("Foydalanuvchini yangilashda xatolik yuz berdi.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdmin(id).unwrap();
      message.success("Foydalanuvchi muvaffaqiyatli o'chirildi!");
      refetch();
    } catch (error) {
      message.error("Foydalanuvchini o'chirishda xatolik yuz berdi.");
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Bu foydalanuvchini o'chirishni istaysizmi?",
      icon: <ExclamationCircleOutlined />,
      content: "Bu harakatni qaytarishning imkoni yo'q!",
      okText: "Ha",
      okType: "danger",
      cancelText: "Yo'q",
      onOk() {
        handleDelete(id);
      },
    });
  };

  const columns = [
    { title: "Ism", dataIndex: "name", key: "name" },
    { title: "Login", dataIndex: "login", key: "login" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Bosh sahifa",
      dataIndex: ["success", "home"],
      key: "home",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Statistika",
      dataIndex: ["success", "statistika"],
      key: "statistika",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Adminlar",
      dataIndex: ["success", "admin"],
      key: "admin",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Omborlar",
      dataIndex: ["success", "ombor"],
      key: "ombor",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Kassa",
      dataIndex: ["success", "kassa"],
      key: "kassa",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Mahsulotlar",
      dataIndex: ["success", "product"],
      key: "product",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Yetqazib beruvchilar",
      dataIndex: ["success", "partner"],
      key: "partner",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Xaridorlar",
      dataIndex: ["success", "client"],
      key: "client",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Qarzdorlar",
      dataIndex: ["success", "debtors"],
      key: "debtors",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Promokodlar",
      dataIndex: ["success", "promo"],
      key: "promo",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Sotilgan Mahsulotlar",
      dataIndex: ["success", "sales"],
      key: "sales",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Brak Mahsulotlar",
      dataIndex: ["success", "brak"],
      key: "brak",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Rasxodlar",
      dataIndex: ["success", "expense"],
      key: "expense",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Dalolatnoma",
      dataumers: ["success", "report"],
      key: "report",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Qoldiq qo'shish",
      dataIndex: ["success", "report-add"],
      key: "report-add",
      render: (text) => (text ? "Ha" : "Yo'q"),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <div className="admin__actions__card">
          <Button
            type="primary"
            onClick={() => {
              setEditingAdmin(record);
              setIsEditModalVisible(true);
              form.setFieldsValue({
                name: record.name,
                login: record.login,
                password: record.password,
                role: record.role,
                success: Object.keys(record.success).filter(
                  (key) => record.success[key]
                ),
              });
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => showDeleteConfirm(record._id)}
            icon={<DeleteOutlined />}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={showModal}
        style={{ marginBottom: "10px" }}
      >
        Foydalanuvchi qo'shish
      </Button>

      <Modal
        title="Foydalanuvchi Qo'shish"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        style={{ marginTop: "50px" }}
      >
        <Form layout="vertical" onFinish={handleFinish} form={form}>
          <Form.Item
            label="Ism"
            name="name"
            rules={[{ required: true, message: "Ismni kiriting!" }]}
          >
            <Input placeholder="Ism" />
          </Form.Item>
          <Form.Item
            label="Login"
            name="login"
            rules={[{ required: true, message: "Loginni kiriting!" }]}
          >
            <Input placeholder="Login" />
          </Form.Item>
          <Form.Item
            label="Parol"
            name="password"
            rules={[{ required: true, message: "Parolni kiriting!" }]}
          >
            <Input.Password placeholder="Parol" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Roleni kiriting!" }]}
          >
            <Input placeholder="Role" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Foydalanuvchini Tahrirlash"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        style={{ marginTop: "50MORpx" }}
      >
        <Form layout="vertical" onFinish={handleEditFinish} form={form}>
          <Form.Item
            label="Ism"
            name="name"
            rules={[{ required: true, message: "Ismni kiriting!" }]}
          >
            <Input placeholder="Ism" />
          </Form.Item>
          <Form.Item
            label="Login"
            name="login"
            rules={[{ required: true, message: "Loginni kiriting!" }]}
          >
            <Input placeholder="Login" />
          </Form.Item>
          <Form.Item
            label="Parol"
            name="password"
            rules={[{ required: true, message: "Parolni kiriting!" }]}
          >
            <Input.Password placeholder="Parol" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Roleni kiriting!" }]}
          >
            <Input placeholder="Role" />
          </Form.Item>
          <Form.Item label="Ruxsatlar" name="success">
            <Checkbox.Group>
              <Checkbox value="home">Bosh sahifa</Checkbox>
              <Checkbox value="statistika">Statistika</Checkbox>
              <Checkbox value="admin">Adminlar</Checkbox>
              <Checkbox value="ombor">Omborlar</Checkbox>
              <Checkbox value="kassa">Kassa</Checkbox>
              <Checkbox value="product">Mahsulotlar</Checkbox>
              <Checkbox value="partner">Yetqazib beruvchilar</Checkbox>
              <Checkbox value="client">Xaridorlar</Checkbox>
              <Checkbox value="debtors">Qarzdorlar</Checkbox>
              <Checkbox value="promo">Promokodlar</Checkbox>
              <Checkbox value="sales">Sotilgan Mahsulotlar</Checkbox>
              <Checkbox value="brak">Brak Mahsulotlar</Checkbox>
              <Checkbox value="expense">Rasxodlar</Checkbox>
              <Checkbox value="report">Dalolatnoma</Checkbox>
              <Checkbox value="report-add">Qoldiq qo'shish</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        dataSource={admins}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}