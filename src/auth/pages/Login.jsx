import Input from "../components/Input"
import styles from "./Login.module.scss"
import login_art from "../../assets/login_art.png"
import { useState } from "react"
import { ProfilePic } from "../../shared/ProfilePic"
import { login } from "../services/authService"
import Redirection from "../components/Redirection"

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' })

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  function validateLogin() {
    if(form.username != '' && form.password != '') {
        login(form.username, form.password)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.box}>

        <div className={styles.leftSide}>
          <img src={login_art} alt="Login Art" className={styles.loginArt} />
        </div>
        <div className={styles.rightSide}>
          <div className={styles.iconContainer}>
            <ProfilePic justIcon='true' size='50px'/>
          </div>
          <h1 className={styles.h1}>LOGIN</h1>
          <form className={styles.form} onSubmit={validateLogin()} >
            <Input
              label="Username or Email" 
              placeholder="Who are you?"
              name='username'
              value={form.username}
              handleChange={handleChange}
              margin={0}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Is it really you?"
              name='password'
              value={form.password}
              handleChange={handleChange}
              margin={10}
            />

            <div className={styles.forgot}>
              <a className={styles.a} href="#">Forgot Password?</a>
            </div>

            <button type="submit" className={styles.loginButton}>Login</button>

            <b className={styles.divider}>OR</b>

            <p className={styles.p}>
              Create a <Redirection text='new account' route='register' />
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Login;