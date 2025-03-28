import React from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: "white",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                boxShadow: "0px 0px 5px rgba(0,0,0,0.2)"
            }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>{payload[0].payload.name}</p>
                <p style={{ margin: 0 }}>Sotuv: {payload[0].value} ta</p>
            </div>
        );
    }
    return null;
};

const SalesBarChart = ({ sales, debtors, products }) => {
    const salesData = products.map((product) => {
        const totalSold = sales
            .filter((sale) => sale.productId?._id === product?._id)
            .reduce((sum, sale) => sum + sale.quantity, 0);
        const totalDebt = debtors
            .filter((sale) => sale.productId?._id === product?._id)
            .reduce((sum, sale) => sum + sale.quantity, 0);
        return {
            name: product.name,
            sold: totalSold + totalDebt,
        };
    });

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sold" fill="#1677ff" barSize={40} radius={[5, 5, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalesBarChart;
