import moment from 'moment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
                <p style={{ margin: 0 }}>{payload[0].payload.date}</p>
                <p style={{ margin: 0, fontWeight: "bold" }}>Sof foyda: {payload[0].value.toLocaleString()} so'm</p>
            </div>
        );
    }
    return null;
};
const SalesLineChart = ({ sales }) => {
    const formattedData = sales.map(sale => ({
        date: new Date(sale.createdAt).toLocaleDateString(),
        revenue: (sale.quantity * sale.sellingPrice) - (sale.quantity * sale.productId.purchasePrice.value),
    })).reverse();

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" textRendering={(text) => moment(text).format("DD.MM")} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SalesLineChart;
