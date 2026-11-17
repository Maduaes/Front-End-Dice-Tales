import { useState } from "react";
import Input from "../../shared/forms/Input";
import classNames from "classnames/bind";
import styles from "./Register.module.scss";
import { createUser } from "../../services/usersService";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Redirection from "../components/Redirection";

const cx = classNames.bind(styles);

export const Register = () => {
  const navigate = useNavigate()
  const [formRegister, setFormRegister] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (name, value) => {
    setFormRegister({ ...formRegister, [name]: value })
  }

  const password = formRegister.password.trim()
  const passwordRequirements = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "At most 50 characters", valid: password.length <= 50 },
    { label: "At least one uppercase letter", valid: /\p{Lu}/u.test(password) },
    { label: "At least one lowercase letter", valid: /\p{Ll}/u.test(password) },
    { label: "At least one number", valid: /\p{N}/u.test(password) },
  ]
  const passwordsMatch = formRegister.confirmPassword.length > 0 &&
    formRegister.password === formRegister.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formRegister.password !== formRegister.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    try {
      await createUser(
        formRegister.email,
        formRegister.username,
        formRegister.password
      )

      await login(formRegister.email, formRegister.password)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      alert(detail ? `Error: ${detail}` : 'Something went wrong while connecting to the server.')
      console.error(err);
    }
  }

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
                value={formRegister.email}
                handleChange={handleChange}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="For your security"
                value={formRegister.password}
                handleChange={handleChange}
              />
              {formRegister.password.length > 0 && (
                <ul className={styles.passwordRequirements} aria-live="polite">
                  {passwordRequirements.map(({ label, valid }) => (
                    <li key={label} className={valid ? styles.requirementMet : styles.requirementPending}>
                      <span aria-hidden="true">{valid ? "✓" : "○"}</span> {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-6 pe-5">
              <Input
                label="Username"
                name="username"
                placeholder="How are you called?"
                value={formRegister.username}
                handleChange={handleChange}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="For more security!"
                value={formRegister.confirmPassword}
                handleChange={handleChange}
              />
              {formRegister.confirmPassword.length > 0 && (
                <p className={`${styles.passwordMatch} ${passwordsMatch ? styles.requirementMet : styles.requirementPending}`} aria-live="polite">
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <button type="submit" className={styles.btnLogin}>
              Create Account
            </button>

            <b className={styles.divider}>OR</b>

            <p className={styles.p}>
              <Redirection  text='login' route='login' />
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
