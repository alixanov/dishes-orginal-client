import React, { useState, useEffect } from 'react';
import { useGetSalesHistoryQuery } from '../../context/service/sotuv.service';
import { useGetAllDebtorsQuery } from '../../context/service/debt.service';
import { useGetProductsQuery } from '../../context/service/product.service';
import { DatePicker } from 'antd';
import moment from 'moment';
import { useGetExpensesQuery } from '../../context/service/expense.service';
import './hisobot.css'
import SalesBarChart from './salesBarChart';
import SalesLineChart from './salesLineChart';
const { RangePicker } = DatePicker;

const Hisobot = () => {
    const { data: sales = [], isLoading: salesLoading } = useGetSalesHistoryQuery();
    const { data: debtors = [], isLoading: debtorsLoading } = useGetAllDebtorsQuery();
    const { data: products = [], isLoading: productsLoading } = useGetProductsQuery();
    const { data: expenses = [], isLoading } = useGetExpensesQuery();

    const [selectedDateRange, setSelectedDateRange] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [filteredDebtors, setFilteredDebtors] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    useEffect(() => {
        if (!selectedDateRange) {
            setFilteredSales(sales);
            setFilteredDebtors(debtors);
            setFilteredProducts(products);
            setFilteredExpenses(expenses);
        } else {
            filterData(selectedDateRange);
        }
    }, [sales, debtors, products, expenses, selectedDateRange]);

    const handleDateChange = (dates, datestring) => {
        if (!dates || !dates.length) {
            setSelectedDateRange(null);
        } else {
            setSelectedDateRange(datestring);
        }
    };


    const filterData = (dates) => {
        if (!dates || dates.length < 2) {
            setFilteredSales(sales);
            setFilteredDebtors(debtors);
            setFilteredProducts(products);
            setFilteredExpenses(expenses);
            return;
        }

        const [startDate, endDate] = dates.map(date => moment(date));

        setFilteredSales(sales.filter(item => isInRange(item.createdAt, startDate, endDate)));
        setFilteredDebtors(debtors.filter(item => isInRange(item.createdAt, startDate, endDate)));
        setFilteredExpenses(expenses.filter(item => isInRange(item.date, startDate, endDate)));
        // setFilteredProducts(products.filter(item => isInRange(item.createdAt, startDate, endDate)));
    };

    const isInRange = (date, start, end) => {
        const createdAt = moment(date);
        return createdAt.isBetween(start, end, 'day', '[]');
    };

    return (
        <div className='page'>
            <div className="page_header">
                <RangePicker placeholder={["Dan", "Gacha"]} onChange={handleDateChange} />
            </div>
            <div className="hisobot_cards">
                <div className="hisobot_card">
                    <b>
                        {filteredSales.reduce((total, b) => {
                            const quantity = b.quantity || 0;
                            const sellingPrice = b.sellingPrice || 0;
                            const purchasePrice = b?.productId?.purchasePrice?.value || 0;

                            return total + (quantity * sellingPrice) - (purchasePrice * quantity);
                        }, 0).toLocaleString() + " so'm"}
                    </b>
                    <p>Sotuvning sof daromadi</p>
                </div>
                <div className="hisobot_card">
                    <b>{filteredProducts.reduce((total, item) => total + item.quantity * item.purchasePrice?.value, 0).toLocaleString() + " so'm"}</b>
                    <p>Umumiy mahsulotlar tan narxi</p>
                </div>
                <div className="hisobot_card">
                    <b>
                        {
                            filteredDebtors.reduce((total, b) => {
                                const quantity = b.quantity || 0;
                                const sellingPrice = b.sellingPrice || 0;
                                return total + quantity * sellingPrice;
                            }, 0).toLocaleString() + " so'm"
                        }

                    </b>
                    <p>Umumiy nasiya</p>
                </div>
                <div className="hisobot_card">
                    <b>
                        {filteredExpenses.reduce((total, item) => total + item.amount, 0).toLocaleString() + " so'm"}
                    </b>
                    <p>Umumiy harajat</p>
                </div>
            </div>
            {/* <h1>Mahsulotlarni sotilishi</h1>
            <SalesBarChart sales={filteredSales} debtors={filteredDebtors} products={filteredProducts} />
            <h1>Sotuvlar</h1>
            <SalesLineChart sales={filteredSales} /> */}

        </div>
    );
};

export default Hisobot;
