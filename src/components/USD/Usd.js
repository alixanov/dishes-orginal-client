// Usd.jsx (remains largely the same, just ensuring it provides the rate)
import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button, message } from "antd";
import {
  useGetUsdRateQuery,
  useUpdateUsdRateMutation,
} from "../../context/service/usd.service";

export default function Usd() {
  const { data: usdRateData, isLoading: isUsdRateLoading } = useGetUsdRateQuery();
  const [updateUsdRate] = useUpdateUsdRateMutation();
  const [usdRate, setUsdRate] = useState(usdRateData?.rate || 1);

  useEffect(() => {
    if (usdRateData) {
      setUsdRate(usdRateData.rate);
    }
  }, [usdRateData]);

  const handleUsdRateChange = async () => {
    try {
      await updateUsdRate(usdRate).unwrap();
      message.success("USD kursi muvaffaqiyatli yangilandi!");
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  return (
    <div className="admin-buttons">
      <Row>
        <Col span={20}>
          <Input
            placeholder="Bugungi USD kursini kiriting"
            value={usdRate}
            onChange={(e) => setUsdRate(e.target.value)}
            type="number"
          />
        </Col>
        <Col span={4}>
          <Button
            style={{ marginLeft: 20 }}
            type="primary"
            onClick={handleUsdRateChange}
          >
            Saqlash
          </Button>
        </Col>
      </Row>
    </div>
  );
}