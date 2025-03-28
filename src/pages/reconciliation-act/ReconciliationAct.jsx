import React, { useEffect, useState } from 'react';
import { Card, Col, Row, DatePicker, Button, Space, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useGetProductsPartnerQuery } from '../../context/service/partner.service';
import { useGetClientsQuery } from '../../context/service/client.service';
import { useGetProductsQuery } from '../../context/service/product.service';
import { useGetSalesHistoryQuery } from '../../context/service/sotuv.service';
import moment from 'moment';
import './reconciliation-act.css'; // Подключим стили

const { Title, Text } = Typography;

export default function ReconciliationAct() {
     const { data: clients = [] } = useGetClientsQuery();
     const { data: products = [] } = useGetProductsQuery();
     const { data: sales = [] } = useGetSalesHistoryQuery();
     const [startDate, setStartDate] = useState(null);
     const [endDate, setEndDate] = useState(null);
     const [filteredProducts, setFilteredProducts] = useState([]);

     // Функция генерации PDF
     const generatePDF = (number) => {
          const printWindow = window.open('', '', 'width=600,height=600');
          const partner = partnersReport?.find((p) => p.partner_number === number);

          const tableRows = partner?.products
               .map(
                    (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.product_name}</td>
            <td>${item.total_quantity}</td>
            <td>${item.purchase_price}</td>
            <td>${item.currency}</td>
            <td>${item.total_price}</td>
          </tr>
        `
               )
               .join('');

          const content = `
      <div style="width:210mm; height:297mm; padding:20px; font-family:Arial, sans-serif; color:#001529;">
        <h2 style="text-align:center; margin-bottom:20px;">
          ${moment().format('DD.MM.YYYY')} даги Хисобварак-фактура
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
            <p>${partner?.partner_name || 'Noma\'lum'}</p>
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

     // Логика фильтрации
     useEffect(() => {
          if (!startDate || !endDate) {
               setFilteredProducts(products);
               return;
          }

          const filtered = products.filter((product) => {
               const createdAt = moment(product.createdAt, 'DD-MM-YYYY').toDate();
               return (!startDate || createdAt >= startDate) && (!endDate || createdAt <= endDate);
          });

          setFilteredProducts(filtered);
     }, [startDate, endDate, products]);

     // Комбинирование продуктов и продаж
     const combinedProducts = [
          ...products,
          ...sales.map((sale) => {
               const relatedProduct = products.find((p) => p.name === sale.productId.name);
               return {
                    ...sale.productId,
                    name_partner: relatedProduct?.name_partner || 'Unknown',
                    partner_number: relatedProduct?.partner_number || 'Unknown',
                    quantity: sale.quantity,
               };
          }),
     ];

     const partnersReport = Object.values(
          combinedProducts.reduce((acc, product) => {
               const { name_partner, partner_number, purchasePrice, quantity, name, currency } = product;

               if (!acc[partner_number]) {
                    acc[partner_number] = {
                         partner_name: name_partner,
                         partner_number,
                         total_purchase: 0,
                         products: [],
                    };
               }

               acc[partner_number].total_purchase += quantity * purchasePrice.value;

               let existingProduct = acc[partner_number].products.find((p) => p.product_name === name);

               if (existingProduct) {
                    existingProduct.total_quantity += quantity;
                    existingProduct.total_price += quantity * purchasePrice.value;
               } else {
                    acc[partner_number].products.push({
                         product_name: name,
                         total_quantity: quantity,
                         purchase_price: purchasePrice.value,
                         currency,
                         total_price: quantity * purchasePrice.value,
                    });
               }

               return acc;
          }, {})
     );

     return (
          <div style={{ padding: '24px', background: '#f0f2f5' }}>
               <Title level={2} style={{ color: '#001529', marginBottom: '24px' }}>
                    Xisob varaq fakturasi
               </Title>
               <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '24px' }}>
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
               <Row gutter={[16, 16]}>
                    {partnersReport.map((item) => (
                         <Col xs={24} sm={12} md={8} lg={6} key={item.partner_number}>
                              <Card
                                   title={item.partner_name}
                                   extra={
                                        <Button
                                             type="primary"
                                             icon={<PrinterOutlined />}
                                             onClick={() => generatePDF(item.partner_number)}
                                             style={{ background: '#001529', borderColor: '#001529' }}
                                        />
                                   }
                                   bordered={false}
                                   style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              >
                                   <Text>{item.partner_number}</Text>
                              </Card>
                         </Col>
                    ))}
               </Row>
          </div>
     );
}