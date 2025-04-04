import React, { useState, useEffect } from "react";
import {
     Button,
     Select,
     Typography,
     Modal,
     Form,
     Input,
     DatePicker,
     InputNumber,
     message,
     Card,
     Table,
     Space,
     Tag,
     Popconfirm,
     Tabs,
} from "antd";
import {
     PlusOutlined,
     EditOutlined,
     DeleteOutlined,
     PrinterOutlined,
} from "@ant-design/icons";
import { useGetProductsQuery } from "../../context/service/product.service";
import { useGetProductsPartnerQuery } from "../../context/service/partner.service"; // Добавляем для партнерских продуктов
import { useGetSalesHistoryQuery } from "../../context/service/sotuv.service";
import {
     useGetReportsQuery,
     useCreateReportMutation,
     useUpdateReportMutation,
     useDeleteReportMutation,
} from "../../context/service/report.service";
import { useGetActPartnersQuery, useCreateActPartnerMutation } from "../../context/service/act-partner.service";
import { useGetClientsQuery, useCreateClientMutation } from "../../context/service/client.service";
import moment from "moment";
import "./report-add.css";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function ReportAdd() {
     const { data: products = [] } = useGetProductsQuery();
     const { data: partnerProducts = [] } = useGetProductsPartnerQuery(); // Добавляем партнерские продукты
     const { data: sales = [] } = useGetSalesHistoryQuery();
     const { data: partnersFromApi = [], isLoading: partnersLoading } = useGetActPartnersQuery();
     const { data: clients = [], isLoading: clientsLoading } = useGetClientsQuery();
     const [createActPartner] = useCreateActPartnerMutation();
     const [createClient] = useCreateClientMutation();
     const [selectedPartner, setSelectedPartner] = useState(null);
     const [selectedClient, setSelectedClient] = useState(null);
     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
     const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
     const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
     const [form] = Form.useForm();
     const [partnerForm] = Form.useForm();
     const [clientForm] = Form.useForm();
     const [activeTab, setActiveTab] = useState("partners");

     const {
          data: reportsData = [],
          isLoading,
          isError,
          error,
     } = useGetReportsQuery(
          activeTab === "partners" ? selectedPartner?.partner_number : selectedClient?._id,
          { skip: !selectedPartner && !selectedClient }
     );

     const [createReport] = useCreateReportMutation();
     const [updateReport] = useUpdateReportMutation();
     const [deleteReport] = useDeleteReportMutation();

     // Формируем список партнеров как в Partner
     const allProducts = React.useMemo(() => [
          ...products.map((product) => ({
               ...product,
               source: 'product',
               partner_name: product.name_partner || '',
               partner_number: product.partner_number || '',
          })),
          ...partnerProducts.map((product) => ({
               ...product,
               source: 'partner',
               partner_name: product.name_partner || '',
               partner_number: product.partner_number || '',
          })),
          // Добавляем партнеров из partnersFromApi для полноты
          ...partnersFromApi.map((partner) => ({
               source: 'api',
               partner_name: partner.partner_name || '',
               partner_number: partner.partner_number || '',
          })),
     ], [products, partnerProducts, partnersFromApi]);

     const uniquePartners = React.useMemo(() => {
          const partnerMap = new Map(
               allProducts
                    .filter((p) => p.partner_name && p.partner_number)
                    .map((p) => [p.partner_number, { partner_name: p.partner_name, partner_number: p.partner_number }])
          );
          return Array.from(partnerMap.values()).sort((a, b) => a.partner_name.localeCompare(b.partner_name));
     }, [allProducts]);

     useEffect(() => {
          if (isError) {
               message.error(error?.data?.message || "Ma'lumotlarni yuklashda xatolik");
          }
     }, [isError, error]);


     const handlePartnerSelect = (value) => {
          const partner = uniquePartners.find((p) => p.partner_number === value);
          setSelectedPartner(partner || null);
          setSelectedClient(null);
     };

     const handleClientSelect = (value) => {
          const client = clients.find((c) => c._id === value);
          setSelectedClient(client || null);
          setSelectedPartner(null);
     };

     const handleAddData = () => {
          if (!selectedPartner && !selectedClient) {
               message.warning("Iltimos, avval yetkazib beruvchi yoki xaridorni tanlang!");
               return;
          }
          form.resetFields();
          form.setFieldsValue({
               type: "debt",
               currency: "USD",
               date: moment(),
          });
          setIsEditModalOpen(true);
     };

     const handleEditReport = (report) => {
          form.setFieldsValue({
               _id: report._id,
               type: report.type,
               amount: report.amount,
               currency: report.currency,
               date: moment(report.date),
               comment: report.comment,
          });
          setIsEditModalOpen(true);
     };

     const handleDeleteReport = async (reportId) => {
          try {
               await deleteReport(reportId).unwrap();
               message.success("Ma'lumot o'chirildi");
          } catch (err) {
               message.error(err.data?.message || "O'chirishda xatolik");
          }
     };

     const handleSubmit = async (values) => {
          try {
               const reportData = {
                    ...(selectedPartner && {
                         partnerId: selectedPartner.partner_number,
                         partnerName: selectedPartner.partner_name,
                    }),
                    ...(selectedClient && {
                         clientId: selectedClient._id,
                         clientName: selectedClient.name,
                    }),
                    type: values.type,
                    amount: values.amount,
                    currency: values.currency,
                    date: values.date.format("YYYY-MM-DD"),
                    comment: values.comment,
               };

               if (values._id) {
                    await updateReport({ id: values._id, ...reportData }).unwrap();
                    message.success("Ma'lumot yangilandi");
               } else {
                    await createReport(reportData).unwrap();
                    message.success("Ma'lumot qo'shildi");
               }

               form.resetFields();
               setIsEditModalOpen(false);
          } catch (err) {
               console.error("Ошибка при сохранении:", err);
               message.error(err.data?.message || "Saqlashda xatolik");
          }
     };

     const handleAddPartner = () => {
          partnerForm.resetFields();
          setIsAddPartnerModalOpen(true);
     };

     const handleAddPartnerSubmit = async (values) => {
          const newPartner = {
               partner_name: values.partner_name,
               partner_number: values.partner_number,
          };

          if (uniquePartners.some((partner) => partner.partner_number === newPartner.partner_number)) {
               message.error("Bu kontragent raqami allaqachon mavjud!");
               return;
          }

          try {
               await createActPartner(newPartner).unwrap();
               message.success("Yangi kontragent qo‘shildi!");
               setIsAddPartnerModalOpen(false);
               partnerForm.resetFields();
          } catch (err) {
               message.error(err?.data?.message || "Kontragent qo‘shishda xatolik!");
          }
     };

     const handleAddClient = () => {
          clientForm.resetFields();
          setIsAddClientModalOpen(true);
     };

     const handleAddClientSubmit = async (values) => {
          const newClient = {
               name: values.name,
               phone: values.phone,
               address: values.address || "",
          };

          if (clients.some((client) => client.phone === newClient.phone)) {
               message.error("Bu telefon raqami allaqachon mavjud!");
               return;
          }

          try {
               await createClient(newClient).unwrap();
               message.success("Yangi xaridor qo‘shildi!");
               setIsAddClientModalOpen(false);
               clientForm.resetFields();
          } catch (err) {
               message.error(err?.data?.message || "Xaridor qo‘shishda xatolik!");
          }
     };

     const generatePDF = () => {
          if (!reportsData.length) {
               message.warning("Chop etish uchun ma'lumotlar yo'q!");
               return;
          }

          const printWindow = window.open("", "", "width=600,height=600");

          const tableRows = reportsData
               .map((item) => {
                    const typeText = item.type === "debt" ? "Qarz" : item.type === "payment" ? "To'lov" : "Boshqa";
                    return `
          <tr style="border-bottom: 1px solid #e8e8e8;">
            <td style="padding: 8px; text-align: center;">${moment(item.date).format("DD.MM.YYYY")}</td>
            <td style="padding: 8px; text-align: center;">${typeText}</td>
            <td style="padding: 8px; text-align: center;">${item.amount.toLocaleString()} ${item.currency || "-"}</td>
            <td style="padding: 8px; text-align: center;">${item.comment || "-"}</td>
          </tr>
        `;
               })
               .join("");

          const content = `
      <div style="width: 210mm; height: 297mm; padding: 20mm; font-family: 'Times New Roman', serif; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 18px; font-weight: normal; margin: 0; color: #555;">Хисобварак-фактура</h2>
          <p style="font-size: 12px; color: #777; margin: 5px 0 0 0;">
            Яратилган сана: ${moment().format("DD.MM.YYYY HH:mm")}
          </p>
        </div>
        <div style="margin-bottom: 20px;">
          <p style="font-size: 14px; margin: 0;">
            <strong>${activeTab === "partners" ? "Контрагент" : "Харидор"}:</strong> 
            ${activeTab === "partners" ? selectedPartner?.partner_name || "Не указано" : selectedClient?.name || "Не указано"} 
            (${activeTab === "partners" ? selectedPartner?.partner_number || "Не указано" : selectedClient?.phone || "Не указано"})
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
              <th style="padding: 10px; text-align: center; font-weight: normal;">Сана</th>
              <th style="padding: 10px; text-align: center; font-weight: normal;">Тип</th>
              <th style="padding: 10px; text-align: center; font-weight: normal;">Сумма</th>
              <th style="padding: 10px; text-align: center; font-weight: normal;">Изох</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;

          printWindow.document.write(`
      <html>
        <head>
          <title>Хисобварак-фактура</title>
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
     };

     const columns = [
          {
               title: "Sana",
               dataIndex: "date",
               key: "date",
               render: (date) => (date ? moment(date).format("DD.MM.YYYY") : "-"),
               sorter: (a, b) => new Date(a.date || 0) - new Date(b.date || 0),
          },
          {
               title: "Tip",
               dataIndex: "type",
               key: "type",
               render: (type) => {
                    let color = "";
                    let text = "";
                    switch (type) {
                         case "debt":
                              color = "red";
                              text = "Qarz";
                              break;
                         case "payment":
                              color = "green";
                              text = "To'lov";
                              break;
                         default:
                              color = "blue";
                              text = "Boshqa";
                    }
                    return <Tag color={color}>{text}</Tag>;
               },
               filters: [
                    { text: "Qarz", value: "debt" },
                    { text: "To'lov", value: "payment" },
                    { text: "Boshqa", value: "other" },
               ],
               onFilter: (value, record) => record.type === value,
          },
          {
               title: "Summa",
               dataIndex: "amount",
               key: "amount",
               render: (amount, record) => (amount ? `${amount.toLocaleString()} ${record.currency || ""}` : "-"),
               sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
          },
          {
               title: "Izoh",
               dataIndex: "comment",
               key: "comment",
               render: (comment) => comment || "-",
               ellipsis: true,
          },
          {
               title: "Harakat",
               key: "actions",
               render: (_, record) => (
                    <Space size="middle">
                         <Button
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => handleEditReport(record)}
                         />
                         <Popconfirm
                              title="O'chirishni tasdiqlaysizmi?"
                              onConfirm={() => handleDeleteReport(record._id)}
                              okText="Ha"
                              cancelText="Yo'q"
                         >
                              <Button type="link" icon={<DeleteOutlined />} danger />
                         </Popconfirm>
                    </Space>
               ),
          },
     ];

     return (
          <div style={{ padding: "24px", background: "#f0f2f5" }}>
               <Title level={2} style={{ color: "#001529", marginBottom: "24px" }}>
                    Hisobotlar
                    {activeTab === "partners" && (
                         <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              style={{ marginTop: "7px", marginLeft: "16px" }}
                              onClick={handleAddPartner}
                         >
                              Yangi yetkazib beruvchi
                         </Button>
                    )}
                    {activeTab === "clients" && (
                         <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              style={{ marginTop: "7px", marginLeft: "16px" }}
                              onClick={handleAddClient}
                         >
                              Yangi xaridor
                         </Button>
                    )}
               </Title>

               <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Yetkazib beruvchi" key="partners">
                         <Card
                              title="Yetkazib beruvchi tanlash"
                              style={{ marginBottom: 24 }}
                              extra={
                                   selectedPartner && (
                                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddData}>
                                             Ma'lumot qo'shish
                                        </Button>
                                   )
                              }
                         >
                              <Select
                                   style={{ width: "100%" }}
                                   placeholder="Yetkazib beruvchini tanlang"
                                   onChange={handlePartnerSelect}
                                   value={selectedPartner?.partner_number || null}
                                   showSearch
                                   optionFilterProp="children"
                                   filterOption={(input, option) =>
                                        (option.children?.toString() || "").toLowerCase().includes(input.toLowerCase())
                                   }
                                   loading={partnersLoading}
                                   notFoundContent={
                                        partnersLoading
                                             ? "Yuklanmoqda..."
                                             : uniquePartners.length === 0
                                                  ? "Yetkazib beruvchilar topilmadi"
                                                  : "Yetkazib beruvchilar topilmadi"
                                   }
                              >
                                   {uniquePartners.map((partner) => (
                                        <Option key={partner.partner_number} value={partner.partner_number}>
                                             {partner.partner_name} ({partner.partner_number})
                                        </Option>
                                   ))}
                              </Select>
                         </Card>
                    </TabPane>

                    <TabPane tab="Xaridorlar" key="clients">
                         <Card
                              title="Xaridor tanlash"
                              style={{ marginBottom: 24 }}
                              extra={
                                   selectedClient && (
                                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddData}>
                                             Ma'lumot qo'shish
                                        </Button>
                                   )
                              }
                         >
                              <Select
                                   style={{ width: "100%" }}
                                   placeholder="Xaridor tanlang"
                                   onChange={handleClientSelect}
                                   value={selectedClient?._id || null}
                                   showSearch
                                   optionFilterProp="children"
                                   filterOption={(input, option) =>
                                        (option.children?.toString() || "").toLowerCase().includes(input.toLowerCase())
                                   }
                                   loading={clientsLoading}
                                   notFoundContent={clientsLoading ? "Yuklanmoqda..." : "Xaridorlar topilmadi"}
                              >
                                   {clients.map((client) => (
                                        <Option key={client._id} value={client._id}>
                                             {client.name} ({client.phone})
                                        </Option>
                                   ))}
                              </Select>
                         </Card>
                    </TabPane>
               </Tabs>

               {(selectedPartner || selectedClient) && (
                    <Card
                         title={`Ismi: ${selectedPartner?.partner_name || selectedClient?.name || ""}`}
                         extra={
                              <Button
                                   type="primary"
                                   icon={<PrinterOutlined />}
                                   onClick={generatePDF}
                                   disabled={reportsData.length === 0}
                              >
                                   Chop etish
                              </Button>
                         }
                    >
                         <Table
                              columns={columns}
                              dataSource={reportsData}
                              rowKey="_id"
                              loading={isLoading}
                              pagination={{ pageSize: 5 }}
                              size="middle"
                              scroll={{ x: true }}
                              locale={{ emptyText: "Ma'lumotlar mavjud emas" }}
                         />
                    </Card>
               )}

               <Modal
                    title={`${form.getFieldValue("_id") ? "Tahrirlash" : "Qo'shish"}`}
                    open={isEditModalOpen}
                    onCancel={() => {
                         setIsEditModalOpen(false);
                         form.resetFields();
                    }}
                    footer={null}
                    destroyOnClose
               >
                    <Form
                         form={form}
                         onFinish={handleSubmit}
                         layout="vertical"
                         initialValues={{
                              type: "debt",
                              currency: "USD",
                              date: moment(),
                         }}
                    >
                         <Form.Item name="_id" hidden>
                              <Input />
                         </Form.Item>
                         <Form.Item
                              name="type"
                              label="Operatsiya turi"
                              rules={[{ required: true, message: "Operatsiya turini tanlang" }]}
                         >
                              <Select>
                                   <Option value="debt">Qarz</Option>
                                   <Option value="payment">To'lov</Option>
                                   <Option value="other">Boshqa</Option>
                              </Select>
                         </Form.Item>
                         <Form.Item
                              name="amount"
                              label="Summa"
                              rules={[{ required: true, message: "Summani kiriting" }]}
                         >
                              <InputNumber
                                   style={{ width: "100%" }}
                                   min={0}
                                   step={0.01}
                                   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                   parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                              />
                         </Form.Item>
                         <Form.Item
                              name="currency"
                              label="Valyuta"
                              rules={[{ required: true, message: "Valyutani tanlang" }]}
                         >
                              <Select>
                                   <Option value="USD">USD</Option>
                                   <Option value="SUM">SUM</Option>
                              </Select>
                         </Form.Item>
                         <Form.Item
                              name="date"
                              label="Sana"
                              rules={[{ required: true, message: "Sanani tanlang" }]}
                         >
                              <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" />
                         </Form.Item>
                         <Form.Item name="comment" label="Izoh">
                              <Input.TextArea rows={3} />
                         </Form.Item>
                         <Form.Item>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                   <Button
                                        onClick={() => {
                                             setIsEditModalOpen(false);
                                             form.resetFields();
                                        }}
                                   >
                                        Bekor qilish
                                   </Button>
                                   <Button type="primary" htmlType="submit">
                                        Saqlash
                                   </Button>
                              </div>
                         </Form.Item>
                    </Form>
               </Modal>

               <Modal
                    title="Yangi kontragent qo'shish"
                    open={isAddPartnerModalOpen}
                    onCancel={() => {
                         setIsAddPartnerModalOpen(false);
                         partnerForm.resetFields();
                    }}
                    footer={null}
                    destroyOnClose
               >
                    <Form form={partnerForm} onFinish={handleAddPartnerSubmit} layout="vertical">
                         <Form.Item
                              name="partner_name"
                              label="Kontragent ismi"
                              rules={[{ required: true, message: "Kontragent ismini kiriting" }]}
                         >
                              <Input placeholder="Masalan: Shukurullo" />
                         </Form.Item>
                         <Form.Item
                              name="partner_number"
                              label="Kontragent raqami"
                              rules={[
                                   { required: true, message: "Kontragent raqamini kiriting" },
                                   { pattern: /^\d+$/, message: "Faqat raqamlar kiritilishi kerak" },
                              ]}
                         >
                              <Input placeholder="Masalan: 400089067" />
                         </Form.Item>
                         <Form.Item>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                   <Button
                                        onClick={() => {
                                             setIsAddPartnerModalOpen(false);
                                             partnerForm.resetFields();
                                        }}
                                   >
                                        Bekor qilish
                                   </Button>
                                   <Button type="primary" htmlType="submit">
                                        Saqlash
                                   </Button>
                              </div>
                         </Form.Item>
                    </Form>
               </Modal>

               <Modal
                    title="Yangi xaridor qo'shish"
                    open={isAddClientModalOpen}
                    onCancel={() => {
                         setIsAddClientModalOpen(false);
                         clientForm.resetFields();
                    }}
                    footer={null}
                    destroyOnClose
               >
                    <Form form={clientForm} onFinish={handleAddClientSubmit} layout="vertical">
                         <Form.Item
                              name="name"
                              label="Xaridor ismi"
                              rules={[{ required: true, message: "Xaridor ismini kiriting" }]}
                         >
                              <Input placeholder="Masalan: Ali" />
                         </Form.Item>
                         <Form.Item
                              name="phone"
                              label="Telefon raqami"
                              rules={[
                                   { required: true, message: "Telefon raqamini kiriting" },
                                   { pattern: /^\+?\d+$/, message: "Faqat raqamlar kiritilishi kerak" },
                              ]}
                         >
                              <Input placeholder="Masalan: +998901234567" />
                         </Form.Item>
                         <Form.Item name="address" label="Manzil">
                              <Input placeholder="Masalan: Toshkent shahar" />
                         </Form.Item>
                         <Form.Item>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                   <Button
                                        onClick={() => {
                                             setIsAddClientModalOpen(false);
                                             clientForm.resetFields();
                                        }}
                                   >
                                        Bekor qilish
                                   </Button>
                                   <Button type="primary" htmlType="submit">
                                        Saqlash
                                   </Button>
                              </div>
                         </Form.Item>
                    </Form>
               </Modal>
          </div>
     );
}