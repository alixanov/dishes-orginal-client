// components/Login.jsx
import React, { memo } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = memo(() => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Object.fromEntries(new FormData(e.target));

    try {
      const res = await axios.post("https://xitoy-idish-server.vercel.app/api/users/login", value);

      const token = res.data.token;
      const success = res.data.success;
      const role = res.data.role;
      const userLogin = res.data.login || value.login; // Получаем login из ответа или формы

      // Сохраняем данные в localStorage
      localStorage.setItem("access_token", token);
      localStorage.setItem("acsess", JSON.stringify(success));
      localStorage.setItem("role", role);
      localStorage.setItem("user_login", userLogin); // Сохраняем имя пользователя

      window.location.reload();
      if (role === "admin") {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("API xatosi:", error.response?.data || error.message);
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            placeholder="Login"
            autoComplete="off"
            name="login"
            required // Добавляем обязательность поля
          />
        </label>
        <label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            required // Добавляем обязательность поля
          />
        </label>
        <label>
          <input type="submit" value="Kirish" />
        </label>
      </form>
    </div>
  );
});

export default Login;