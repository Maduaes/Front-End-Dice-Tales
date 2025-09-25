import './Input.module.scss'
import styles from './Input.module.scss'


const Input = ({
  label, 
  type = 'text', 
  placeholder
}) => {

  return (
    <div className={styles.div}>
        <label className={styles.label}>{label}</label>
        <input className={styles.input} type={type} placeholder={placeholder} />
    </div>
  )
}

export default Input