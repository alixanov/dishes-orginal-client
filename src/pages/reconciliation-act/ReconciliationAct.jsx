import React, { useEffect, useState } from "react";
import {
    Button,
    DatePicker,
    Space,
    Typography,
    Table,
    message,
    Select,
    Popover,
    Tooltip,
} from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import {
    useGetClientsQuery,
    useGetClientHistoryQuery
} from "../../context/service/client.service";
import { useGetProductsQuery } from "../../context/service/product.service";
import { useGetSalesHistoryQuery } from "../../context/service/sotuv.service";
import {
    useGetDebtsByClientQuery,
    usePayDebtMutation
} from "../../context/service/debt.service";
import { useGetReportsQuery } from "../../context/service/report.service";
import moment from "moment";
import "./reconciliation-act.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ReconciliationAct() {
    const { data: clients = [] } = useGetClientsQuery();
    const { data: products = [] } = useGetProductsQuery();
    const { data: sales = [] } = useGetSalesHistoryQuery();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showPartnerSelect, setShowPartnerSelect] = useState(false);
    const [showClientSelect, setShowClientSelect] = useState(false);
    const [filteredPartnerProducts, setFilteredPartnerProducts] = useState([]);
    const [filteredClientData, setFilteredClientData] = useState([]);

    // Получаем имя пользователя (поставщика) из localStorage
    const supplierName = localStorage.getItem("user_login") || "BANKERSUZ GROUP MCHJ";

    const { data: clientHistory = [] } = useGetClientHistoryQuery(selectedClient?._id, {
        skip: !selectedClient,
    });
    const { data: debts = [] } = useGetDebtsByClientQuery(selectedClient?._id, {
        skip: !selectedClient,
    });
    const { data: reports = [] } = useGetReportsQuery(
        selectedPartner?.partner_number || selectedClient?._id,
        { skip: !selectedPartner && !selectedClient }
    );
    const [payDebt] = usePayDebtMutation();

    const combinedProducts = [
        ...products.map((product) => ({
            ...product,
            quantity: product.quantity || 1,
            createdAt: product.createdAt,
        })),
        ...sales.map((sale) => {
            const relatedProduct = products.find((p) => p.name === sale.productId.name);
            return {
                ...sale.productId,
                name_partner: relatedProduct?.name_partner || "Unknown",
                partner_number: relatedProduct?.partner_number || "Unknown",
                quantity: sale.quantity,
                createdAt: sale.createdAt,
            };
        }),
    ];

    const partnersReport = Object.values(
        combinedProducts.reduce((acc, product) => {
            const {
                name_partner,
                partner_number,
                purchasePrice,
                quantity,
                name,
                currency,
                createdAt
            } = product;

            if (!acc[partner_number]) {
                acc[partner_number] = {
                    partner_name: name_partner,
                    partner_number,
                    total_purchase: 0,
                    products: [],
                };
            }

            acc[partner_number].total_purchase += quantity * (purchasePrice?.value || 0);

            let existingProduct = acc[partner_number].products.find((p) => p.product_name === name);

            if (existingProduct) {
                existingProduct.total_quantity += quantity;
                existingProduct.total_price += quantity * (purchasePrice?.value || 0);
                existingProduct.createdAt = createdAt;
            } else {
                acc[partner_number].products.push({
                    product_name: name,
                    total_quantity: quantity,
                    purchase_price: purchasePrice?.value || 0,
                    currency,
                    total_price: quantity * (purchasePrice?.value || 0),
                    createdAt,
                });
            }

            return acc;
        }, {})
    );

    useEffect(() => {
        if (!selectedPartner) {
            setFilteredPartnerProducts([]);
            return;
        }

        const relatedReports = reports.filter((r) => r.partnerId === selectedPartner.partner_number);

        let filtered = selectedPartner.products.map((product) => {
            const report = relatedReports.find((r) => r.comment === product.product_name || r.date >= product.createdAt);
            const reportDate = report ? report.date : product.createdAt;
            return { ...product, reportDate, type: "product" };
        });

        const reportEntries = relatedReports.map((report) => ({
            product_name: report.comment || "Hisobot",
            total_quantity: 1,
            purchase_price: report.amount || 0,
            currency: report.currency || "USD",
            total_price: report.amount || 0,
            reportDate: report.date,
            type: report.type,
        }));

        filtered = [...filtered, ...reportEntries];

        if (startDate && endDate) {
            filtered = filtered.filter((item) => {
                if (!item.reportDate) return false;
                const dateToFilter = moment(item.reportDate).toDate();
                return (
                    dateToFilter >= moment(startDate).startOf("day").toDate() &&
                    dateToFilter <= moment(endDate).endOf("day").toDate()
                );
            });
        }

        setFilteredPartnerProducts(filtered);
    }, [selectedPartner, startDate, endDate, reports]);

    const combinedData = [
        ...(clientHistory?.map((sale) => ({ ...sale, type: "sale" })) || []),
        ...(debts?.map((debt) => ({ ...debt, type: "debt" })) || []),
        ...(reports
            .filter((r) => r.clientId === selectedClient?._id)
            .map((report) => ({
                ...report,
                productId: { name: "Hisobot" },
                quantity: 1,
                sellingPrice: report.amount,
                currency: report.currency,
                createdAt: report.date,
                type: report.type,
            })) || []),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    useEffect(() => {
        if (!selectedClient) {
            setFilteredClientData([]);
            return;
        }

        let filtered = combinedData;

        if (startDate && endDate) {
            filtered = combinedData.filter((item) => {
                if (!item.createdAt) return false;
                const createdAt = moment(item.createdAt).toDate();
                return (
                    createdAt >= moment(startDate).startOf("day").toDate() &&
                    createdAt <= moment(endDate).endOf("day").toDate()
                );
            });
        }

        setFilteredClientData(filtered);
    }, [selectedClient, startDate, endDate, combinedData]);

    const generatePDF = (number) => {
        const printWindow = window.open("", "", "width=600,height=600");
        const partner = partnersReport?.find((p) => p.partner_number === number);
        if (!partner) return;

        const tableRows = filteredPartnerProducts
            .map((item, index) => {
                const reportDate = item.reportDate
                    ? moment(item.reportDate).format("DD.MM.YYYY")
                    : "-";
                const typeText = item.type === "debt" ? "Qarz" : item.type === "payment" ? "To'lov" : item.type === "other" ? "Boshqa" : "Mahsulot";
                return `
          <tr>
            <td>${index + 1}</td>
            <td>${item.product_name}</td>
            <td>${item.total_quantity}</td>
            <td>${item.purchase_price}</td>
            <td>${item.currency}</td>
            <td>${item.total_price}</td>
            <td>${typeText}</td>
            <td>${reportDate}</td>
          </tr>
        `;
            })
            .join("");

        const content = `
      <div style="width:210mm; height:297mm; padding:20px; font-family:Arial, sans-serif; color:#001529;">
        <h2 style="text-align:center; margin-bottom:20px;">
          ${moment().format("DD.MM.YYYY")} даги Солиштирма далолатномаси
        </h2>
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
          <div>
            <b>Етказиб берувчи:</b><br/>
            <p>${supplierName}</p>
          </div>
          <div>
            <b>Сотиб олувчи:</b><br/>
            <p>${partner?.partner_name || "Noma'lum"}</p>
          </div>
        </div>
        <table border="1" style="border-collapse:collapse; width:100%; text-align:center;">
          <thead style="background:#001529; color:white;">
            <tr>
              <th>No</th>
              <th>Махсулот номи</th>
              <th>Миқдор</th>
              <th>Нарх</th>
              <th>Валюта</th>
              <th>Умумий сумма</th>
              <th>Тип</th>
              <th>Сана</th>
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

    const generateClientPDF = (clientId) => {
        const printWindow = window.open("", "", "width=600,height=600");
        const client = clients.find((c) => c._id === clientId);
        if (!client) return;

        // Фильтруем только отчеты для выбранного клиента
        const clientReports = reports.filter((r) => r.clientId === clientId);

        if (!clientReports.length) {
            message.warning("Chop etish uchun ma'lumotlar yo'q!");
            printWindow.close();
            return;
        }

        const tableRows = clientReports
            .map((item, index) => {
                const typeText = item.type === "debt" ? "Qarz" : item.type === "payment" ? "To'lov" : "Boshqa";
                return `
          <tr style="border-bottom: 1px solid #e8e8e8;">
            <td style="padding: 8px; text-align: center;">${index + 1}</td>
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
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <p style="font-size: 14px; margin: 0;">
              <strong>Етказиб берувчи:</strong> ${supplierName}
            </p>
          </div>
          <div>
            <p style="font-size: 14px; margin: 0;">
              <strong>Харидор:</strong> ${client.name || "Не указано"} (${client.phone || "Не указано"})
            </p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
              <th style="padding: 10px; text-align: center; font-weight: normal;">No</th>
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

    const handlePayDebt = async (debtId, amount, currency) => {
        try {
            await payDebt({
                id: debtId,
                amount: amount,
                currency,
            }).unwrap();
            message.success("Qarz muvaffaqiyatli to'landi");
        } catch (error) {
            message.error("Qarz to'lashda xatolik yuz berdi");
        }
    };

    const partnerColumns = [
        { title: "No", key: "index", render: (_, __, index) => index + 1 },
        { title: "Mahsulot nomi", dataIndex: "product_name", key: "product_name" },
        { title: "Miqdor", dataIndex: "total_quantity", key: "total_quantity", align: "center" },
        { title: "Narx", dataIndex: "purchase_price", key: "purchase_price", align: "center" },
        { title: "Valyuta", dataIndex: "currency", key: "currency" },
        { title: "Umumiy summa", dataIndex: "total_price", key: "total_price", align: "center" },
        {
            title: "Tip",
            dataIndex: "type",
            key: "type",
            render: (type) => {
                let text = "";
                switch (type) {
                    case "debt":
                        text = "Qarz";
                        break;
                    case "payment":
                        text = "To'lov";
                        break;
                    case "other":
                        text = "Boshqa";
                        break;
                    default:
                        text = "Mahsulot";
                }
                return text;
            },
        },
        {
            title: "Sana",
            dataIndex: "reportDate",
            key: "reportDate",
            render: (text) => (text ? moment(text).format("DD.MM.YYYY") : "-"),
            sorter: (a, b) => {
                if (!a.reportDate || !b.reportDate) return 0;
                return moment(a.reportDate).unix() - moment(b.reportDate).unix();
            },
        },
    ];

    const clientColumns = [
        { title: "No", key: "index", render: (_, __, index) => index + 1 },
        { title: "Tovar nomi", dataIndex: ["productId", "name"], key: "productId.name" },
        { title: "Soni", dataIndex: "quantity", key: "quantity", align: "center" },
        { title: "Sotish narxi", dataIndex: "sellingPrice", key: "sellingPrice", align: "center" },
        { title: "Valyuta", dataIndex: "currency", key: "currency" },
        { title: "Chegirma(%)", dataIndex: "discount", key: "discount", align: "center" },
        {
            title: "Umumiy summa",
            key: "total",
            align: "center",
            render: (_, record) =>
                record.sellingPrice && record.quantity
                    ? (record.sellingPrice * record.quantity).toLocaleString()
                    : record.amount || "-",
        },
        { title: "Qoldiq qarz", dataIndex: "remainingAmount", key: "amount", align: "center" },
        {
            title: "Holati",
            dataIndex: "type",
            key: "type",
            render: (_, record) =>
                record.type === "debt" ? (record.status === "paid" ? "To'langan" : "To'lanmagan") : record.type === "sale" ? "Sotilgan" : record.type,
        },
        {
            title: "Sana",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => (text ? moment(text).format("DD.MM.YYYY") : "-"),
            sorter: (a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return moment(a.createdAt).unix() - moment(b.createdAt).unix();
            },
        },
        {
            title: "Amallar",
            render: (_, record) =>
                record.type === "debt" && (
                    <div className="table_actions">
                        {record.status === "pending" && (
                            <Tooltip
                                title={
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const amount = Number(e.target[0].value);
                                            const currency = e.target[1].value;
                                            handlePayDebt(record._id, amount, currency);
                                        }}
                                        className="modal_form"
                                    >
                                        <input type="number" step={0.001} required placeholder="To'lov summasi" />
                                        <select required>
                                            <option value="" disabled selected>
                                                Valyutani tanlang
                                            </option>
                                            <option value="USD">USD</option>
                                            <option value="SUM">SUM</option>
                                        </select>
                                        <button type="submit">Tasdiqlash</button>
                                    </form>
                                }
                                trigger="click"
                            >
                                <Button type="primary">To'lash</Button>
                            </Tooltip>
                        )}
                        <Popover
                            content={
                                <div>
                                    {record.paymentHistory?.map((payment, index) => (
                                        <p key={index}>
                                            {moment(payment.date).format("DD.MM.YYYY")}: {payment.amount} {payment.currency}
                                        </p>
                                    ))}
                                </div>
                            }
                            title="To'lov tarixi"
                        >
                            <Button style={{ marginLeft: 8 }}>To'lov tarixi</Button>
                        </Popover>
                    </div>
                ),
        },
    ];

    return (
        <div style={{ padding: "24px", background: "#f0f2f5" }}>
            <Title level={2} style={{ color: "#001529", marginBottom: "24px" }}>
                Solishtirma dalolatnomasi
            </Title>

            <Space style={{ marginBottom: "24px" }}>
                <Button
                    type="primary"
                    onClick={() => {
                        setShowPartnerSelect(true);
                        setShowClientSelect(false);
                        setSelectedClient(null);
                        setStartDate(null);
                        setEndDate(null);
                    }}
                >
                    Yetkazib beruvchi
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        setShowClientSelect(true);
                        setShowPartnerSelect(false);
                        setSelectedPartner(null);
                        setStartDate(null);
                        setEndDate(null);
                    }}
                >
                    Xaridorlar
                </Button>
            </Space>

            {showPartnerSelect && (
                <div style={{ marginBottom: "24px" }}>
                    <Select
                        style={{ width: 300 }}
                        placeholder="Xamkor tanlang"
                        onChange={(value) => {
                            setSelectedPartner(partnersReport.find((p) => p.partner_number === value));
                            setSelectedClient(null);
                            setStartDate(null);
                            setEndDate(null);
                        }}
                        value={selectedPartner?.partner_number || null}
                    >
                        {partnersReport.map((partner) => (
                            <Option key={partner.partner_number} value={partner.partner_number}>
                                {partner.partner_name} ({partner.partner_number})
                            </Option>
                        ))}
                    </Select>
                </div>
            )}

            {showClientSelect && (
                <div style={{ marginBottom: "24px" }}>
                    <Select
                        style={{ width: 300 }}
                        placeholder="Xaridor tanlang"
                        onChange={(value) => {
                            setSelectedClient(clients.find((c) => c._id === value));
                            setSelectedPartner(null);
                            setStartDate(null);
                            setEndDate(null);
                        }}
                        value={selectedClient?._id || null}
                    >
                        {clients.map((client) => (
                            <Option key={client._id} value={client._id}>
                                {client.name} ({client.phone})
                            </Option>
                        ))}
                    </Select>
                </div>
            )}

            {(selectedPartner || selectedClient) && (
                <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: "24px" }}>
                    <Space>
                        <Text strong>Boshlanish sanasi:</Text>
                        <DatePicker
                            value={startDate ? moment(startDate) : null}
                            onChange={(date) => setStartDate(date ? date.toDate() : null)}
                            format="DD-MM-YYYY"
                        />
                        <Text strong>Tugash sanasi:</Text>
                        <DatePicker
                            value={endDate ? moment(endDate) : null}
                            onChange={(date) => setEndDate(date ? date.toDate() : null)}
                            format="DD-MM-YYYY"
                        />
                    </Space>
                </Space>
            )}

            {selectedPartner && (
                <div>
                    <Space style={{ marginBottom: "16px" }}>
                        <Title level={4} style={{ color: "#001529" }}>
                            {selectedPartner.partner_name} ({selectedPartner.partner_number})
                        </Title>
                        <Button
                            type="primary"
                            icon={<PrinterOutlined />}
                            onClick={() => generatePDF(selectedPartner.partner_number)}
                        >
                            Chop etish
                        </Button>
                    </Space>
                    <Table
                        className="partner-table"
                        columns={partnerColumns}
                        dataSource={filteredPartnerProducts}
                        rowKey={(record, index) => index}
                        pagination={false}
                        bordered
                    />
                </div>
            )}

            {selectedClient && (
                <div>
                    <Space style={{ marginBottom: "16px" }}>
                        <Title level={4} style={{ color: "#001529" }}>
                            {selectedClient.name} ({selectedClient.phone})
                        </Title>
                        <Button
                            type="primary"
                            icon={<PrinterOutlined />}
                            onClick={() => generateClientPDF(selectedClient._id)}
                        >
                            Chop etish
                        </Button>
                    </Space>
                    <Table
                        className="client-table"
                        columns={clientColumns}
                        dataSource={filteredClientData}
                        rowKey="_id"
                        pagination={false}
                        bordered
                    />
                </div>
            )}
        </div>
    );
}