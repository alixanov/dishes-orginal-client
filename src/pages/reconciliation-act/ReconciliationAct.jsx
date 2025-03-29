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
import { useGetReportsQuery } from "../../context/service/report.service"; // Добавляем импорт
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
    
    const { data: clientHistory = [] } = useGetClientHistoryQuery(selectedClient?._id, {
        skip: !selectedClient,
    });
    const { data: debts = [] } = useGetDebtsByClientQuery(selectedClient?._id, {
        skip: !selectedClient,
    });
    const { data: reports = [] } = useGetReportsQuery(selectedPartner?.partner_number, {
        skip: !selectedPartner
    }); // Добавляем получение данных из ReportAdd
    const [payDebt] = usePayDebtMutation();

    // Комбинирование продуктов и продаж для Xamkorlar с учетом ReportAdd
    const combinedProducts = [
        ...products.map(product => ({
            ...product,
            quantity: product.quantity || 1,
            createdAt: product.createdAt
        })),
        ...sales.map((sale) => {
            const relatedProduct = products.find((p) => p.name === sale.productId.name);
            return {
                ...sale.productId,
                name_partner: relatedProduct?.name_partner || "Unknown",
                partner_number: relatedProduct?.partner_number || "Unknown",
                quantity: sale.quantity,
                createdAt: sale.createdAt
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
                    reportDates: new Map() // Добавляем для хранения дат из ReportAdd
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
                    createdAt
                });
            }

            return acc;
        }, {})
    );

    // Интеграция дат из ReportAdd
    useEffect(() => {
        if (selectedPartner && reports.length > 0) {
            const partnerData = partnersReport.find(p => p.partner_number === selectedPartner.partner_number);
            if (partnerData) {
                reports.forEach(report => {
                    partnerData.reportDates.set(report._id, report.date);
                });
            }
        }
    }, [selectedPartner, reports]);

    // Функция генерации PDF для Xamkorlar с датой из ReportAdd
    const generatePDF = (number) => {
        const printWindow = window.open("", "", "width=600,height=600");
        const partner = partnersReport?.find((p) => p.partner_number === number);

        const tableRows = filteredPartnerProducts
            .map((item, index) => {
                const reportDate = partner.reportDates.size > 0 
                    ? moment([...partner.reportDates.values()][0]).format("DD.MM.YYYY") 
                    : (item.createdAt ? moment(item.createdAt).format("DD.MM.YYYY") : "-");
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.product_name}</td>
                        <td>${item.total_quantity}</td>
                        <td>${item.purchase_price}</td>
                        <td>${item.currency}</td>
                        <td>${item.total_price}</td>
                        <td>${reportDate}</td>
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

    // Остальная часть generateClientPDF остается без изменений
    const generateClientPDF = (clientId) => {
        const printWindow = window.open("", "", "width=600,height=600");
        const client = clients.find((c) => c._id === clientId);

        const tableRows = filteredClientData
            .map(
                (item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.productId?.name || "-"}</td>
                        <td>${item.quantity || "-"}</td>
                        <td>${item.sellingPrice || "-"}</td>
                        <td>${item.currency || "-"}</td>
                        <td>${item.discount || "-"}</td>
                        <td>${item.sellingPrice && item.quantity ? item.sellingPrice * item.quantity : "-"}</td>
                        <td>${item.remainingAmount || "-"}</td>
                        <td>${item.type === "debt" ? (item.status === "paid" ? "To'langan" : "To'lanmagan") : "Sotilgan"}</td>
                        <td>${moment(item.createdAt).format("DD.MM.YYYY")}</td>
                    </tr>
                `
            )
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
                        <p>${client?.name || "Noma'lum"}</p>
                        <b>Telefon raqami:</b><br/>
                        <p>${client?.phone || "Noma'lum"}</p>
                    </div>
                </div>
                <table border="1" style="border-collapse:collapse; width:100%; text-align:center;">
                    <thead style="background:#001529; color:white;">
                        <tr>
                            <th>No</th>
                            <th>Tovar nomi</th>
                            <th>Soni</th>
                            <th>Sotish narxi</th>
                            <th>Valyuta</th>
                            <th>Chegirma(%)</th>
                            <th>Umumiy summa</th>
                            <th>Qoldiq qarz</th>
                            <th>Holati</th>
                            <th>Sana</th>
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

    // Логика фильтрации для Xamkorlar с учетом ReportAdd
    useEffect(() => {
        if (!selectedPartner) {
            setFilteredPartnerProducts([]);
            return;
        }

        let filtered = selectedPartner.products.map(product => {
            const reportDate = reports.length > 0 
                ? reports[0].date // Берем первую дату из ReportAdd (можно изменить логику)
                : product.createdAt;
            return {
                ...product,
                createdAt: reportDate // Переопределяем дату
            };
        });

        if (startDate && endDate) {
            filtered = filtered.filter((product) => {
                if (!product.createdAt) return false;
                const createdAt = moment(product.createdAt).toDate();
                return createdAt >= moment(startDate).startOf("day").toDate() &&
                    createdAt <= moment(endDate).endOf("day").toDate();
            });
        }

        setFilteredPartnerProducts(filtered);
    }, [selectedPartner, startDate, endDate, reports]);

    // Логика фильтрации для Xaridorlar остается без изменений
    const combinedData = [
        ...(clientHistory?.map((sale) => ({ ...sale, type: "sale" })) || []),
        ...(debts?.map((debt) => ({ ...debt, type: "debt" })) || []),
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
                return createdAt >= moment(startDate).startOf("day").toDate() &&
                    createdAt <= moment(endDate).endOf("day").toDate();
            });
        }

        setFilteredClientData(filtered);
    }, [selectedClient, startDate, endDate, combinedData]);

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
            title: "Sana",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => text ? moment(text).format("DD.MM.YYYY") : "-",
            sorter: (a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return moment(a.createdAt).unix() - moment(b.createdAt).unix();
            }
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
            render: (_, record) => {
                return record.sellingPrice && record.quantity ? record.sellingPrice * record.quantity : "-";
            },
        },
        { title: "Qoldiq qarz", dataIndex: "remainingAmount", key: "amount", align: "center" },
        {
            title: "Holati",
            dataIndex: "type",
            key: "type",
            render: (_, record) =>
                record.type === "debt" ? (record.status === "paid" ? "To'langan" : "To'lanmagan") : "Sotilgan",
        },
        {
            title: "Sana",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => text ? moment(text).format("DD.MM.YYYY") : "-",
            sorter: (a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return moment(a.createdAt).unix() - moment(b.createdAt).unix();
            }
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
                Xisob varaq fakturasi
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
                    Kontragent
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
                    />
                </div>
            )}
        </div>
    );
}