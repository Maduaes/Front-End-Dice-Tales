import Input from "../components/Input";
import classNames from "classnames/bind";
import styles from "./Register.module.scss";

const cx = classNames.bind(styles)

export const Register = () => {
  return (
    <main className={styles.main}>
      <div className={styles.box}>

        <div className={styles.leftSide}>
          {/* <img src={login_art} alt="Login Art" className={styles.loginArt} /> */}
        </div>
        <div className={cx('container', 'rightSide')}>
          <div className={styles.iconContainer}>
            {/* <img alt="User Profile Picture" /> */}
          </div>
          <h1 className="text-center">SIGN UP</h1>
          <form className={cx("row", "form")} >
            <div className="col-6 ps-5">
              <Input
                label="Email" 
                placeholder="What is your email?"
              />

              <Input 
                label="Password" 
                type="password"
                placeholder="For your security"
              />
            </div>
            <div className="col-6 pe-5">
              <Input
                label="Username"
                placeholder="How are you called?"
              />
              
              <Input
                label="Confirm Password"
                type="password"
                placeholder="For more security!"
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
  )
}