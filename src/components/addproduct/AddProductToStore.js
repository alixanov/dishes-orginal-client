// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Modal,
//   Form,
//   Input,
//   Row,
//   Col,
//   message,
//   Select,
//   AutoComplete,
//   Switch,
// } from "antd";
// import { PlusOutlined } from "@ant-design/icons";
// import {
//   useCreateProductMutation,
//   useGetAllProductsQuery,
// } from "../../context/service/product.service";
// import {
//   useAddProductToStoreMutation,
//   useCreateProductToStoreMutation,
// } from "../../context/service/store.service";

// const { Option } = Select;

// const AddProductToStore = ({ refetchProducts }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [form] = Form.useForm();
//   const [createProduct] = useCreateProductToStoreMutation();
//   const { data: allProducts } = useGetAllProductsQuery();
//   const [barcode, setBarcode] = useState("");
//   const [addProductToStore] = useAddProductToStoreMutation();
//   const [productNames, setProductNames] = useState([]);
//   const [models, setModels] = useState([]);
//   const [kimdan_kelgan, setKimdanKelgan] = useState([]);
//   const [purchaseSum, setPurchaseSum] = useState(true);
//   const [sellSum, setSellSum] = useState(true);
//   useEffect(() => {
//     if (isModalOpen) {
//       const generateBarcode = () => {
//         const code = Math.floor(100000 + Math.random() * 900000).toString();
//         setBarcode(code);
//       };
//       generateBarcode();
//     }
//   }, [isModalOpen]);

//   useEffect(() => {
//     if (allProducts) {
//       const uniqueProductNames = [
//         ...new Set(allProducts.map((product) => product.product_name)),
//       ];
//       setProductNames(uniqueProductNames.sort());

//       const uniqueModels = [
//         ...new Set(allProducts.map((product) => product.model)),
//       ];
//       setModels(uniqueModels);

//       const uniqueKimdanKelgan = [
//         ...new Set(allProducts.map((product) => product.kimdan_kelgan)),
//       ];
//       setKimdanKelgan(uniqueKimdanKelgan);
//     }
//   }, [allProducts]);

//   const showModal = () => {
//     setIsModalOpen(true);
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     form.resetFields();
//   };

//   const handleFinish = async (values) => {
//     try {
//       const productData = {
//         ...values,
//         barcode,
//         purchase_currency: purchaseSum ? "uzs" : "usd",
//         sell_currency: sellSum ? "uzs" : "usd",
//       };

//       const createdProduct = await createProduct(productData).unwrap();

//       message.success("Mahsulot muvaffaqiyatli qo'shildi!");
//       setIsModalOpen(false);
//       form.resetFields();
//       refetchProducts();
//     } catch (error) {
//       message.error("Xato yuz berdi. Iltimos qayta urinib ko'ring.");
//     }
//   };

//   return (
//     <div>
//       <Button
//         type="primary"
//         onClick={showModal}
//         style={{
//           backgroundColor: "#52c41a",
//           borderColor: "#52c41a",
//           marginBottom: "10px",
//         }}
//         icon={<PlusOutlined />}
//       >
//         Dokonga Mahsulot qo'shish +
//       </Button>

//       <Modal
//         title="Mahsulot yaratish va dokonga qo'shish"
//         open={isModalOpen}
//         onCancel={handleCancel}
//         footer={null}
//       >
//         <Form layout="vertical" form={form} onFinish={handleFinish}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 label="Mahsulot nomi1"
//                 name="product_name"
//                 rules={[{ required: true, message: "Majburiy maydon!" }]}
//               >
//                 <AutoComplete
//                   options={productNames.map((name) => ({
//                     value: name,
//                   }))}
//                   placeholder="Mahsulot nomi"
//                   filterOption={(inputValue, option) =>
//                     option.value
//                       .toLowerCase()
//                       .indexOf(inputValue.toLowerCase()) !== -1
//                   }
//                 >
//                   <Input placeholder="Mahsulot nomi" autoComplete="off" />
//                 </AutoComplete>
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 label="Model"
//                 name="model"
//                 rules={[{ required: true, message: "Majburiy maydon!" }]}
//               >
//                 <AutoComplete
//                   options={models.map((model) => ({
//                     value: model,
//                   }))}
//                   placeholder="Model"
//                   filterOption={(inputValue, option) =>
//                     option.value
//                       .toLowerCase()
//                       .indexOf(inputValue.toLowerCase()) !== -1
//                   }
//                 >
//                   <Input placeholder="Model" autoComplete="off" />
//                 </AutoComplete>
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 label="Miqdor"
//                 name="stock"
//                 rules={[{ required: true, message: "Majburiy maydon!" }]}
//               >
//                 <Input type="number" placeholder="Miqdor" autoComplete="off" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 label="O'lchov birligi"
//                 name="count_type"
//                 rules={[{ required: true, message: "Majburiy maydon!" }]}
//               >
//                 <Select placeholder="O'lchov birligi" autoComplete="off">
//                   <Option value="dona">Dona</Option>
//                   <Option value="komplekt">Komplekt</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row gutter={16} style={{ maxHeight: "65px" }}>
//             <Col span={12}>
//               <Form.Item
//                 label="Sotib olish narxi"
//                 name="purchase_price"
//                 rules={[{ required: true, message: "Majburiy maydon!" }]}
//               >
//                 <Input
//                   type="number"
//                   placeholder="Sotib olish narxi"
//                   autoComplete="off"
//                 />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 label="Sotish narxi"
//                 name="sell_price"
//                 rules={[{ required: true, message: "Majburiy maydon!" }]}
//               >
//                 <Input
//                   type="number"
//                   placeholder="Sotish narxi"
//                   autoComplete="off"
//                 />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row gutter={16} style={{ marginBottom: "12px" }}>
//             <Col style={{ display: "flex", gap: "6px" }} span={12}>
//               <p>USD</p>
//               <Switch
//                 value={purchaseSum}
//                 onChange={() => setPurchaseSum(!purchaseSum)}
//               />
//               <p>UZS</p>
//             </Col>
//             <Col style={{ display: "flex", gap: "6px" }} span={12}>
//               <p>USD</p>
//               <Switch value={sellSum} onChange={() => setSellSum(!sellSum)} />
//               <p>UZS</p>
//             </Col>
//           </Row>
//           <Row gutter={16}></Row>
//           <Row gutter={16}>
//             {/* <Col span={12}>
//               <Form.Item
//                 label="Shtrix kod"
//                 name="barcode"
//                 initialValue={barcode}
//               >
//                 <Input placeholder="Shtrix kod" autoComplete="off" disabled />
//               </Form.Item>
//             </Col> */}
//           </Row>

//           <Row gutter={16}>
//             <Col span={24}>
//               <Form.Item
//                 label="Kimdan kelgan"
//                 name="kimdan_kelgan"
//                 rules={[{ required: true, message: "Majburiy maydon!" }]}
//               >
//                 <AutoComplete
//                   options={kimdan_kelgan.map((kimdan) => ({
//                     value: kimdan,
//                   }))}
//                   placeholder="Kimdan kelgan"
//                   filterOption={(inputValue, option) =>
//                     option.value
//                       .toLowerCase()
//                       .indexOf(inputValue.toLowerCase()) !== -1
//                   }
//                 >
//                   <Input placeholder="Kimdan kelgan" autoComplete="off" />
//                 </AutoComplete>
//               </Form.Item>
//             </Col>
//           </Row>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" block>
//               Saqlash
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default AddProductToStore;
