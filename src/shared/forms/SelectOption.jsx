import styles from './Inputs.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export const SelectOption = ({
  label, listaOpcoes = [], descricaoPadrao, style = 'ipt-primary'
}) => {

  return (
    <div className="form-group">
      <label for={label + 'Select'} className={cx('label')}>{label}</label>
      <select className={cx("form-control", "input", style)}
      id={label + 'Select'}>
        <option value='0'>{descricaoPadrao}</option>
        { listaOpcoes.map((item) => (
          <option value={item.id}>{item.descricao}</option>
        ))}
      </select>
    </div>
  )
}