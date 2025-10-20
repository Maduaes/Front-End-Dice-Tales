import './Input.module.scss'
import className from 'classnames/bind'
import styles from './Input.module.scss'

const cx = className.bind(styles)


const Input = ({
  label, 
  placeholder,
  type = 'text', 
  name,
  value,
  handleChange,
  erro = false,
  mensagemErro,
  margin
}) => {

  return (
    <div className={styles.div}>
        <label style={{marginTop: margin}} className={erro ? cx('label erro') : cx('label')}>{label} 
          <input className={styles.input} type={type} 
            placeholder={placeholder} name={name} value={value} 
            onChange={(e) => handleChange(e.target.name, e.target.value)} />
        </label>
        { erro && <div> {mensagemErro} </div> }
    </div>
  )
}

export default Input