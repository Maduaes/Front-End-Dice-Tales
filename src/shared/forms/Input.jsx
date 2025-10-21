import className from 'classnames/bind'
import styles from './Inputs.module.scss'

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
  margin,
  style = 'ipt-primary'
}) => {

  return (
    <div className={styles.div}>
        <label style={{marginTop: margin}} className={erro ? cx('label erro') : cx('label')}>{label} 
          <input className={cx('input', style)} type={type} 
            placeholder={placeholder} name={name} value={value} 
            onChange={(e) => handleChange(e.target.name, e.target.value)} />
        </label>
        { erro && <div> {mensagemErro} </div> }
    </div>
  )
}

export default Input