import React, { useState, useEffect } from "react";
import {
  useGetExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../../context/service/expense.service";
import { Table, Button, Modal, Form, Input, Select, DatePicker } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Option } = Select;
const { confirm } = Modal;

const Expense = () => {
  const { data: expenses = [], isLoading } = useGetExpensesQuery();
  const [addExpense] = useAddExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [filters, setFilters] = useState({ category: null, dateRange: [] });
  useEffect(() => {
    const uniqueCategories = [
      ...new Set(expenses.map((expense) => expense.category)),
    ];
    setCategories(uniqueCategories);
  }, [expenses]);

  const columns = [
    { title: "Sana", dataIndex: "date", render: (text) => moment(text).format("DD.MM.YYYY HH:mm"), key: "date" },
    { title: "Miqdor", dataIndex: "amount", key: "amount" },
    { title: "Kategoriya", dataIndex: "category", key: "category" },
    { title: "Tavsif", dataIndex: "description", key: "description" },
    { title: "To'langan shaxs", dataIndex: "paidTo", key: "paidTo" },
    {
      title: "Harakatlar",
      key: "actions",
      render: (text, record) => (
        <div className="table_actions">
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record._id)}
          />
        </div>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const showEditModal = (expense) => {
    setCurrentExpense(expense);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      paidTo: expense.paidTo,
    });
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentExpense(null);
    editForm.resetFields();
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Rosdan ham o'chirmoqchimisiz?",
      icon: <ExclamationCircleOutlined />,
      content: "O'chirilgan ma'lumotni qaytarib bo'lmaydi.",
      okText: "Ha",
      okType: "danger",
      cancelText: "Yo'q",
      onOk() {
        handleDelete(id);
      },
      onCancel() {
      },
    });
  };

  const handleDelete = (id) => {
    deleteExpense(id);
  };

  const handleAdd = async (values) => {
    await addExpense(values);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleUpdate = async (values) => {
    await updateExpense({ id: currentExpense._id, ...values });
    setIsEditModalVisible(false);
    setCurrentExpense(null);
    editForm.resetFields();
  };

  const handleAddCategory = (values) => {
    setCategories([...categories, values.category]);
    setIsCategoryModalVisible(false);
    categoryForm.resetFields();
  };

  const handleCategoryFilterChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
  };

  const handleDateFilterChange = (dates, dateStrings) => {
    if (!dates || dateStrings[0] === "" || dateStrings[1] === "") {
      setFilters((prev) => ({ ...prev, dateRange: [] }));
    } else {
      setFilters((prev) => ({ ...prev, dateRange: dates }));
    }
  };
  ;
  useEffect(() => {
    setFilteredExpenses(expenses.filter((expense) => {
      const isCategoryMatch = filters.category ? expense.category === filters.category : true;
      const isDateMatch =
        !filters.dateRange.length ||
        (moment(expense.date).isSameOrAfter(moment(filters.dateRange[0]), "day") &&
          moment(expense.date).isSameOrBefore(moment(filters.dateRange[1]), "day"));

      return isCategoryMatch && isDateMatch;
    }))
  }, [filters, expenses])
  return (
    <div className="expense-page">
      <div className="page_header">
        <h1>Rasxodlar</h1>
        <div className="header_actions">

          <Select
            placeholder="Kategoriya tanlang"
            allowClear
            onChange={handleCategoryFilterChange}
            style={{ width: 200 }}
          >
            <Select.Option value="">Barchasi</Select.Option>
            {categories.map((category, index) => (
              <Option key={index} value={category}>{category}</Option>
            ))}
          </Select>
          <DatePicker.RangePicker placeholder={["Dan", "Gacha"]} onChange={handleDateFilterChange} />
        </div>
      </div>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}
        style={{ marginBottom: "10px", marginTop: "10px" }}

      >
        Rasxod qo'shish
      </Button>
      <Table
        columns={columns}
        dataSource={filteredExpenses}
        rowKey="_id"
        loading={isLoading}
      />

      <Modal
        title="Rasxod qo'shish"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="amount" label="Miqdor" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="date" label="Sana" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Kategoriya"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Kategoriyani tanlang"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: 8,
                    }}
                  >
                    <Button
                      type="link"
                      onClick={() => setIsCategoryModalVisible(true)}
                    >
                      Yangi kategoriya qo'shish
                    </Button>
                  </div>
                </>
              )}
            >
              {categories.map((category, index) => (
                <Option key={index} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Tavsif">
            <Input />
          </Form.Item>
          <Form.Item name="paidTo" label="To'langan shaxs">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Qo'shish
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Rasxodlarni tahrirlash"
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="amount" label="Miqdor" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="date" label="Sana" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Kategoriya"
            rules={[{ required: true }]}
          >
            <Select placeholder="Kategoriyani tanlang">
              {categories.map((category, index) => (
                <Option key={index} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Tavsif">
            <Input />
          </Form.Item>
          <Form.Item name="paidTo" label="To'langan shaxs">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Yangilash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Yangi kategoriya qo'shish"
        visible={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        footer={null}
      >
        <Form
          form={categoryForm}
          onFinish={handleAddCategory}
          layout="vertical"
        >
          <Form.Item
            name="category"
            label="Kategoriya nomi"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Qo'shish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Expense;
