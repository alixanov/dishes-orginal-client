import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  TeamOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  MoneyCollectOutlined, // Rasxodlar uchun yangi ikona
  ScheduleOutlined,
  UserSwitchOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import Admin from "../Adminlar/Adminlar";
import Ombor from "../Ombor/Ombor";
import Product from "../Product/Product";
import Kassa from "../Kassa/Kassa";
import { FaChartLine } from "react-icons/fa6";

import Client from "../Client/Client";
import Debtors from "../Debt/Debtors";
import Sales from "../Sotuv-tarix/Sotuv";
import Brak from "../Brak/Brak";
import Expense from "../Rasxod/Expense";
import { LuTicketPercent } from "react-icons/lu";
import Promo from "../promo/Promo";
// import Hisobot from "../hisobot/hisobot";
import Statistika from "../statistika/statistika";
import Investitsiya from "../investment/Investitsiya";
import Partner from "../partner/Partner";
import ReconciliationAct from "../reconciliation-act/ReconciliationAct"
import ReportAdd from "../report-add/ReportAdd";

const { Header, Sider, Content } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const renderContent = () => {
    switch (selectedPage) {
      case "admin":
        return <Admin />;
      case "statistika":
        return <Statistika />;
      case "ombor":
        return <Ombor />;
      case "product":
        return <Product />;
      case "partner":
        return <Partner />;
      case "kassa":
        return <Kassa />;
      case "client":
        return <Client />;
      case "debtors":
        return <Debtors />;
      case "promo":
        return <Promo />;
      case "sales":
        return <Sales />;
      case "brak":
        return <Brak />;
      case "expense":
        return <Expense />;

      case "report":
        return <ReconciliationAct />;
      case "report-add":
        return <ReportAdd />;
      
      case "home":
    
      default:
        return <Investitsiya />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["home"]}
          selectedKeys={[selectedPage]}
          onClick={(e) => setSelectedPage(e.key)}
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>
            Bosh sahifa
          </Menu.Item>
          <Menu.Item key="statistika" icon={<FaChartLine />}>
            Statistika
          </Menu.Item>
          <Menu.Item key="admin" icon={<UserOutlined />}>
            Adminlar
          </Menu.Item>
          <Menu.Item key="ombor" icon={<AppstoreOutlined />}>
            Omborlar
          </Menu.Item>
      
          <Menu.Item key="kassa" icon={<DollarOutlined />}>
            Kassa
          </Menu.Item>
          <Menu.Item key="product" icon={<ShoppingOutlined />}>
            Mahsulotlar
          </Menu.Item>
          <Menu.Item key="partner" icon={<UserSwitchOutlined />}>
            Kontragent
          </Menu.Item>
        
          <Menu.Item key="client" icon={<TeamOutlined />}>
            Xaridorlar
          </Menu.Item>
          <Menu.Item key="debtors" icon={<CreditCardOutlined />}>
            Qarzdorlar
          </Menu.Item>
          <Menu.Item key="promo" icon={<LuTicketPercent />}>
            Promokodlar
          </Menu.Item>
          <Menu.Item key="sales" icon={<BarChartOutlined />}>
            Sotilgan Mahsulotlar
          </Menu.Item>
          <Menu.Item key="brak" icon={<ExclamationCircleOutlined />}>
            Brak Mahsulotlar
          </Menu.Item>
          
          <Menu.Item key="expense" icon={<MoneyCollectOutlined />}>
            {" "}
            {/* Rasxodlar uchun yangi ikona */}
            Rasxodlar
          </Menu.Item>

          <Menu.Item key="report" icon={< ScheduleOutlined  />}>
            Act sverka
          </Menu.Item>
          <Menu.Item key="report-add" icon={<UserAddOutlined />}>
            Act +
          </Menu.Item>

        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <Button type="primary" onClick={toggle} style={{ marginBottom: 16 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            padding: 6,
            minHeight: 280,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
