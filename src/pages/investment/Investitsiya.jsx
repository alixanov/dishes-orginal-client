import React from "react";
import { Card, Space, Divider } from "antd";
import { useGetWarehousesQuery } from "../../context/service/ombor.service";
import { useGetProductsByWarehouseQuery } from "../../context/service/product.service";
import { useGetUsdRateQuery } from "../../context/service/usd.service";
import { useGetSalesHistoryQuery } from "../../context/service/sotuv.service";
import { useGetAllDebtorsQuery } from "../../context/service/debt.service";
import { useGetProductsQuery } from "../../context/service/product.service";
import { useGetExpensesQuery } from "../../context/service/expense.service";
import { DollarOutlined, ShoppingCartOutlined, CreditCardOutlined, CalendarOutlined, RiseOutlined, HomeOutlined } from "@ant-design/icons";
import "./investment.css"; // Yangi fayl nomi

const cardGradients = [
     "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
     "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
     "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
     "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
     "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
];

// Komponent uchun ombor kartasi
const WarehouseCard = ({ ombor, usdRate, sales, index }) => {
     const { data: mahsulotlar = [] } = useGetProductsByWarehouseQuery(ombor._id);

     const calculateStats = (products, warehouseSales) => {
          const purchaseUSD = products.reduce((sum, product) => {
               const quantity = Number(product.quantity) || 0;
               const purchaseValue = Number(product.purchasePrice?.value) || 0;
               return sum + purchaseValue * quantity;
          }, 0);

          const purchaseUZS = purchaseUSD * usdRate;

          let profitUSD = 0;
          let profitUZS = 0;

          if (warehouseSales.length > 0) {
               profitUSD = warehouseSales.reduce((sum, sale) => {
                    const quantity = Number(sale.quantity) || 0;
                    const sellingPrice = Number(sale.sellingPrice) || 0;
                    const purchasePrice = Number(sale?.productId?.purchasePrice?.value) || 0;
                    return sum + (quantity * (sellingPrice - purchasePrice));
               }, 0);
               profitUZS = profitUSD * usdRate;
          } else {
               profitUSD = products.reduce((sum, product) => {
                    const quantity = Number(product.quantity) || 0;
                    const sellingPrice = Number(product.sellingPrice?.value) || 0;
                    const purchasePrice = Number(product.purchasePrice?.value) || 0;
                    return sum + (quantity * (sellingPrice - purchasePrice));
               }, 0);
               profitUZS = profitUSD * usdRate;
          }

          const totalQuantity = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

          const latestDate = products.length > 0
               ? new Date(Math.max(...products.map(p => new Date(p.createdAt || Date.now())))).toLocaleDateString()
               : new Date().toLocaleDateString();

          return { purchaseUZS, purchaseUSD, profitUZS, profitUSD, totalQuantity, latestDate };
     };

     const warehouseSales = sales.filter(sale => sale?.productId?.warehouse?._id === ombor._id);
     const stats = mahsulotlar.length > 0 || warehouseSales.length > 0 ? calculateStats(mahsulotlar, warehouseSales) : null;

     const cardStyle = {
          background: cardGradients[index % cardGradients.length],
          border: "none",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
     };

     return (
          <Card
               key={ombor._id}
               title={ombor.name}
               className="invest-warehouse-card"
               style={cardStyle}
               headStyle={{ borderBottom: "none" }} // Оставляем только минимальный headStyle
               extra={<Space />}
          >
               <p className="invest-warehouse-address"><HomeOutlined />{ombor.address}</p>
               {stats ? (
                    <div className="invest-warehouse-stats">
                         <div className="invest-stat-item">
                              <p><strong><CalendarOutlined /> Sana:</strong> <span className="invest-date">{stats.latestDate}</span></p>
                         </div>
                         <Divider style={{ margin: "10px 0", borderColor: "#e8e8e8" }} />
                         <div className="invest-stat-item">
                              <p><strong><DollarOutlined /> Xarajat:</strong></p>
                              <p><span className="invest-purchase">{stats.purchaseUZS.toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS</span></p>
                              <p><span className="invest-purchase">{stats.purchaseUSD.toFixed(2)} $</span></p>
                         </div>
                         <Divider style={{ margin: "10px 0", borderColor: "#e8e8e8" }} />
                         <div className="invest-stat-item">
                              <p><strong><RiseOutlined /> Foyda:</strong></p>
                              <p><span className="invest-profit">{stats.profitUZS.toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UZS</span></p>
                              <p><span className="invest-profit">{stats.profitUSD.toFixed(2)} $</span></p>
                         </div>
                         <Divider style={{ margin: "10px 0", borderColor: "#e8e8e8" }} />
                         <div className="invest-stat-item">
                              <p><strong><ShoppingCartOutlined /> Jami (mavjud):</strong> <span className="invest-quantity">{stats.totalQuantity} dona</span></p>
                         </div>
                    </div>
               ) : (
                    <p className="invest-no-data">Bu omborda mahsulotlar yo'q.</p>
               )}
          </Card>
     );
};

// Umumiy statistika uchun komponent
const SummaryCard = ({ expenses, debtors, products, sales, usdRate }) => {
     const totalExpensesUZS = expenses.reduce((total, item) => total + (Number(item.amount) || 0), 0);
     const totalExpensesUSD = totalExpensesUZS / usdRate;

     const totalDebtUZS = debtors.reduce((total, b) => {
          const quantity = Number(b.quantity) || 0;
          const sellingPrice = Number(b.sellingPrice) || 0;
          return total + quantity * sellingPrice;
     }, 0);
     const totalDebtUSD = totalDebtUZS / usdRate;

     const totalPurchaseUSD = products.reduce((total, item) => {
          const quantity = Number(item.quantity) || 0;
          const purchaseValue = Number(item.purchasePrice?.value) || 0;
          return total + purchaseValue * quantity;
     }, 0);
     const totalPurchaseUZS = totalPurchaseUSD * usdRate;

     const totalSalesProfitUSD = sales.reduce((total, b) => {
          const quantity = Number(b.quantity) || 0;
          const sellingPrice = Number(b.sellingPrice) || 0;
          const purchasePrice = Number(b?.productId?.purchasePrice?.value) || 0;
          return total + (quantity * (sellingPrice - purchasePrice));
     }, 0);
     const totalSalesProfitUZS = totalSalesProfitUSD * usdRate;

     return (
          <Card
               title="Umumiy statistika"
               className="invest-summary-card"
               headStyle={{ borderBottom: "none" }} // Оставляем только минимальный headStyle
          >
               <div className="invest-warehouse-stats">
                    <div className="invest-stat-item">
                         <p><strong><DollarOutlined /> Umumiy xarajat:</strong></p>
                         <p><span className="invest-purchase">{totalExpensesUZS.toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} so'm</span></p>
                         <p><span className="invest-purchase">{totalExpensesUSD.toFixed(2)} $</span></p>
                    </div>
                    <Divider style={{ margin: "10px 0", borderColor: "rgba(255, 255, 255, 0.2)" }} />
                    <div className="invest-stat-item">
                         <p><strong><CreditCardOutlined /> Umumiy nasiya:</strong></p>
                         <p><span className="invest-debt">{totalDebtUZS.toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} so'm</span></p>
                         <p><span className="invest-debt">{totalDebtUSD.toFixed(2)} $</span></p>
                    </div>
                    <Divider style={{ margin: "10px 0", borderColor: "rgba(255, 255, 255, 0.2)" }} />
                    <div className="invest-stat-item">
                         <p><strong><ShoppingCartOutlined /> Umumiy mahsulotlar tan narxi:</strong></p>
                         <p><span className="invest-purchase">{totalPurchaseUZS.toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} so'm</span></p>
                         <p><span className="invest-purchase">{totalPurchaseUSD.toFixed(2)} $</span></p>
                    </div>
                    <Divider style={{ margin: "10px 0", borderColor: "rgba(255, 255, 255, 0.2)" }} />
                    <div className="invest-stat-item">
                         <p><strong><RiseOutlined /> Sotuvning sof daromadi:</strong></p>
                         <p><span className="invest-profit">{totalSalesProfitUZS.toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} so'm</span></p>
                         <p><span className="invest-profit">{totalSalesProfitUSD.toFixed(2)} $</span></p>
                    </div>
               </div>
          </Card>
     );
};

// Asosiy komponent
export default function Investitsiya() {
     const { data: omborlar = [] } = useGetWarehousesQuery();
     const { data: usdRateData, isLoading: usdLoading } = useGetUsdRateQuery();
     const { data: sales = [], isLoading: salesLoading } = useGetSalesHistoryQuery();
     const { data: debtors = [], isLoading: debtorsLoading } = useGetAllDebtorsQuery();
     const { data: products = [], isLoading: productsLoading } = useGetProductsQuery();
     const { data: expenses = [], isLoading: expensesLoading } = useGetExpensesQuery();

     const usdRate = usdRateData?.rate || 12960;

     if (usdLoading || salesLoading || debtorsLoading || productsLoading || expensesLoading) {
          return <div className="invest-loading">Yuklanmoqda...</div>;
     }

     return (
          <div className="invest-container">
               <div className="invest-warehouse-cards">
                    <SummaryCard expenses={expenses} debtors={debtors} products={products} sales={sales} usdRate={usdRate} />
                    {omborlar.map((ombor, index) => (
                         <WarehouseCard key={ombor._id} ombor={ombor} usdRate={usdRate} sales={sales} index={index} />
                    ))}
               </div>
          </div>
     );
}