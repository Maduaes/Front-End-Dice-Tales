import { useState } from "react";
import axios from "axios";
import Input from "../components/Input";
import classNames from "classnames/bind";
import styles from "./Register.module.scss";

const cx = classNames.bind(styles);

export const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:3000/api/users", {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      alert("User created successfully!");
      console.log("Response:", data);
    } catch (err) {
      if (err.response) {
        alert(`Error: ${err.response.data.error || err.response.data.message}`);
      } else {
        alert("Something went wrong while connecting to the server.");
      }
      console.error(err);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.box}>
        <div className={styles.leftSide}></div>

        <div className={cx("container", "rightSide")}>
          <div className={styles.iconContainer}></div>
          <h1 className="text-center">SIGN UP</h1>

          <form className={cx("row", "form")} onSubmit={handleSubmit}>
            <div className="col-6 ps-5">
              <Input
                label="Email"
                name="email"
                placeholder="What is your email?"
                value={formData.email}
                handleChange={handleChange}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="For your security"
                value={formData.password}
                handleChange={handleChange}
              />
            </div>

            <div className="col-6 pe-5">
              <Input
                label="Username"
                name="username"
                placeholder="How are you called?"
                value={formData.username}
                handleChange={handleChange}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="For more security!"
                value={formData.confirmPassword}
                handleChange={handleChange}
              />
            </div>

            <button type="submit" className={styles.btnLogin}>
              Create Account
            </button>

            <b className={styles.divider}>OR</b>

            <p className={styles.p}>
              <strong>login</strong>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};
