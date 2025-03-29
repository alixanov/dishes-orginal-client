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
} from "antd";
import {
     PlusOutlined,
     EditOutlined,
     EyeOutlined,
     DeleteOutlined,
     PrinterOutlined,
} from "@ant-design/icons";
import { useGetProductsQuery } from "../../context/service/product.service";
import { useGetSalesHistoryQuery } from "../../context/service/sotuv.service";
import {
     useGetReportsQuery,
     useCreateReportMutation,
     useUpdateReportMutation,
     useDeleteReportMutation,
} from "../../context/service/report.service";
import moment from "moment";
import "./report-add.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ReportAdd() {
     const { data: products = [] } = useGetProductsQuery();
     const { data: sales = [] } = useGetSalesHistoryQuery();
     const [selectedPartner, setSelectedPartner] = useState(null);
     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
     const [isViewModalOpen, setIsViewModalOpen] = useState(false);
     const [form] = Form.useForm();

     // RTK Query hooks
     const {
          data: reportsData = [],
          isLoading,
          isError,
          error,
          refetch
     } = useGetReportsQuery(selectedPartner?.partner_number, {
          skip: !selectedPartner
     });

     const [createReport] = useCreateReportMutation();
     const [updateReport] = useUpdateReportMutation();
     const [deleteReport] = useDeleteReportMutation();

     // Combine products and sales to get all partners data
     const partnersReport = React.useMemo(() => {
          return Object.values(
               [...products, ...sales.map(sale => sale.productId)].reduce((acc, product) => {
                    const { name_partner, partner_number } = product;
                    if (partner_number && !acc[partner_number]) {
                         acc[partner_number] = {
                              partner_name: name_partner || "Unknown",
                              partner_number: partner_number
                         };
                    }
                    return acc;
               }, {})
          ).filter(partner => partner.partner_number && partner.partner_name);
     }, [products, sales]);

     // Error handling
     useEffect(() => {
          if (isError) {
               message.error(error?.data?.message || 'Ошибка при загрузке данных');
          }
     }, [isError, error]);

     const handlePartnerSelect = (value) => {
          const partner = partnersReport.find(p => p.partner_number === value);
          setSelectedPartner(partner);
     };

     const handleAddData = () => {
          form.resetFields();
          form.setFieldsValue({
               type: 'debt',
               currency: 'USD',
               date: moment(),
          });
          setIsEditModalOpen(true);
     };

     const handleViewData = () => {
          setIsViewModalOpen(true);
     };

     const handleEditReport = (report) => {
          form.setFieldsValue({
               ...report,
               date: moment(report.date),
          });
          setIsEditModalOpen(true);
     };

     const handleDeleteReport = async (reportId) => {
          try {
               await deleteReport(reportId).unwrap();
               message.success('Данные успешно удалены');
          } catch (err) {
               message.error(err.data?.message || 'Ошибка при удалении данных');
          }
     };

     const handleSubmit = async (values) => {
          try {
               const reportData = {
                    partnerId: selectedPartner.partner_number,
                    partnerName: selectedPartner.partner_name,
                    ...values,
                    date: values.date.format('YYYY-MM-DD'),
               };

               if (values._id) {
                    await updateReport({ id: values._id, ...reportData }).unwrap();
                    message.success('Данные обновлены');
               } else {
                    await createReport(reportData).unwrap();
                    message.success('Данные успешно добавлены');
               }

               form.resetFields();
               setIsEditModalOpen(false);
          } catch (err) {
               message.error(err.data?.message || 'Произошла ошибка');
          }
     };

     // Функция генерации PDF для ReportAdd
     const generatePDF = () => {
          const printWindow = window.open("", "", "width=600,height=600");

          const tableRows = reportsData
               .map((item, index) => {
                    const typeText = item.type === 'debt' ? 'Долг' : item.type === 'payment' ? 'Оплата' : 'Другое';
                    return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${moment(item.date).format("DD.MM.YYYY")}</td>
                        <td>${typeText}</td>
                        <td>${item.amount.toLocaleString()}</td>
                        <td>${item.currency || '-'}</td>
                        <td>${item.comment || '-'}</td>
                    </tr>
                `;
               })
               .join("");

          const content = `
            <div style="width:210mm; height:297mm; padding:20px; font-family:Arial, sans-serif; color:#001529;">
                <h2 style="text-align:center; margin-bottom:20px;">
                    ${moment().format("DD.MM.YYYY")} даги Хисобварак-фактура
                </h2>
                <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                    <div>
                        <b>Етказиб берувчи:</b><br/>
                        <p>"BANKERSUZ GROUP" MCHJ</p>
                        <b>Манзил:</b><br/>
                        <p>ГОРОД ТАШКEНТ УЛИЦА НАВОИЙ 16-А</p>
                    </div>
                    <div>
                        <b>Сотиб олувчи:</b><br/>
                        <p>${selectedPartner?.partner_name || "Noma'lum"}</p>
                        <b>Номер телефон:</b><br/>
                        <p>${selectedPartner?.partner_number || "Noma'lum"}</p>
                    </div>
                </div>
                <table border="1" style="border-collapse:collapse; width:100%; text-align:center;">
                    <thead style="background:#001529; color:white;">
                        <tr>
                            <th>No</th>
                            <th>Дата</th>
                            <th>Тип</th>
                            <th>Сумма</th>
                            <th>Валюта</th>
                            <th>Комментарий</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;

          printWindow.document.write(`
            <html>
                <head><title>Хисобварак-фактура</title></head>
                <body>${content}</body>
            </html>
        `);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
     };

     const columns = [
          {
               title: 'Sana',
               dataIndex: 'date',
               key: 'date',
               render: date => date ? moment(date).format('DD.MM.YYYY') : '-',
               sorter: (a, b) => new Date(a.date || 0) - new Date(b.date || 0),
          },
          {
               title: 'Tip',
               dataIndex: 'type',
               key: 'type',
               render: type => {
                    let color = '';
                    let text = '';
                    switch (type) {
                         case 'debt':
                              color = 'red';
                              text = 'Qarza';
                              break;
                         case 'payment':
                              color = 'green';
                              text = 'Tolov';
                              break;
                         default:
                              color = 'blue';
                              text = 'Boshqa';
                    }
                    return <Tag color={color}>{text}</Tag>;
               },
               filters: [
                    { text: 'Qarz', value: 'debt' },
                    { text: 'Tolov', value: 'payment' },
                    { text: 'Boshqa', value: 'other' },
               ],
               onFilter: (value, record) => record.type === value,
          },
          {
               title: 'Summa',
               dataIndex: 'amount',
               key: 'amount',
               render: (amount, record) => amount ? `${amount.toLocaleString()} ${record.currency || ''}` : '-',
               sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
          },
          {
               title: 'Izoh',
               dataIndex: 'comment',
               key: 'comment',
               render: comment => comment || '-',
               ellipsis: true,
          },
          {
               title: 'Harakat',
               key: 'actions',
               render: (_, record) => (
                    <Space size="middle">
                         <Button
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => handleEditReport(record)}
                         />
                         <Popconfirm
                              title="Haqiqatan ham bu yozuvni oʻchirib tashlamoqchimisiz?"
                              onConfirm={() => handleDeleteReport(record._id)}
                              okText="Ha"
                              cancelText="Yoq"
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
                    Ma'lumotlarini boshqarish
               </Title>

               <Card
                    title="Kontragentni tanlang"
                    style={{ marginBottom: 24 }}
                    extra={
                         selectedPartner && (
                              <Space>
                                   <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddData}
                                   >
                                        Malumot qoshish
                                   </Button>
                                   {/* <Button icon={<EyeOutlined />} onClick={handleViewData}>
                                        Просмотр данных
                                   </Button> */}
                              </Space>
                         )
                    }
               >
                    <Select
                         style={{ width: "100%" }}
                         placeholder="Выберите контрагента"
                         onChange={handlePartnerSelect}
                         value={selectedPartner?.partner_number || null}
                         showSearch
                         optionFilterProp="children"
                         filterOption={(input, option) =>
                              (option.children?.toString() || "").toLowerCase().includes(input.toLowerCase())
                         }
                    >
                         {partnersReport.map((partner) => (
                              <Option key={partner.partner_number} value={partner.partner_number}>
                                   {partner.partner_name} ({partner.partner_number})
                              </Option>
                         ))}
                    </Select>
               </Card>

               {selectedPartner && (
                    <Card
                         title={`Ismi: ${selectedPartner.partner_name}`}
                         extra={
                              <Button
                                   type="primary"
                                   icon={<PrinterOutlined />}
                                   onClick={generatePDF}
                                   disabled={reportsData.length === 0} // Отключаем кнопку, если нет данных
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
                              locale={{
                                   emptyText: "Нет данных для отображения",
                              }}
                         />
                    </Card>
               )}

               {/* Edit/Add Modal */}
               <Modal
                    title={`${form.getFieldValue("_id") ? "Редактирование" : "Добавление"} данных`}
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
                                   <Option value="debt">Qarz (bizga qarzdor)</Option>
                                   <Option value="payment">Tolov (bizga tolashgan)</Option>
                                   <Option value="other">Boshqa</Option>
                              </Select>
                         </Form.Item>

                         <Form.Item
                              name="amount"
                              label="Summa"
                              rules={[
                                   {
                                        required: true,
                                        message: "Summani kiriting",
                                   },
                              ]}
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
                                   <Option value="SUM">UZS</Option>
                              </Select>
                         </Form.Item>

                         <Form.Item
                              name="date"
                              label="Дата"
                              rules={[{ required: true, message: "Vaqtning tanlang" }]}
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

               {/* View Modal */}
               <Modal
                    title={`Данные контрагента: ${selectedPartner?.partner_name || ""}`}
                    open={isViewModalOpen}
                    onCancel={() => setIsViewModalOpen(false)}
                    footer={null}
                    width={800}
               >
                    <div style={{ marginBottom: 16 }}>
                         <Text strong>Код контрагента: </Text>
                         <Text>{selectedPartner?.partner_number}</Text>
                    </div>

                    <Table
                         columns={columns}
                         dataSource={reportsData}
                         rowKey="_id"
                         loading={isLoading}
                         pagination={{ pageSize: 5 }}
                         size="middle"
                         scroll={{ x: true }}
                    />

                    <div style={{ marginTop: 16, textAlign: "right" }}>
                         <Button
                              type="primary"
                              onClick={() => {
                                   setIsViewModalOpen(false);
                                   handleAddData();
                              }}
                              icon={<PlusOutlined />}
                         >
                              Добавить запись
                         </Button>
                    </div>
               </Modal>
          </div>
     );
}