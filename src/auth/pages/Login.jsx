import Input from "../components/Input"
import styles from "./Login.module.scss"
import login_art from "../../assets/login_art.png"
import { useState } from "react"
import { ProfilePic } from "../../shared/ProfilePic"

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

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
          <h1>LOGIN</h1>
          <form className={styles.form}>
            <Input 
              label="Username or Email" 
              placeholder="Who are you?"
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Is it really you?"
            />

            <div className={styles.forgot}>
              <a className={styles.a} href="#">Forgot Password?</a>
            </div>

            <button type="submit" className={styles.loginButton}>Login</button>

            <b className={styles.divider}>OR</b>

            <p className={styles.p}>
              Create a <strong>new account!</strong>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Login;