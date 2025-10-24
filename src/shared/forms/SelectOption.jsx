import { Icon } from '../icones/Icon'
import s from './Inputs.module.scss'
import cn from 'classnames'

export const SelectOption = ({
  label, listaOpcoes = [], descricaoPadrao, theme = 'ipt-primary', className
}) => {

  return (
    <div className={cn('form-group', className)}>
      <label for={label + 'Select'} className={s.label}>{label}</label>
      <div className={cn(s.input, theme)}>
        <select className='form-control'
          id={label + 'Select'}>
          <option value='0' >{descricaoPadrao}</option>
          { listaOpcoes.map((item) => (
            <option value={item.id}>{item.descricao}</option>
          ))}
        </select>
        <Icon name='chevronDown' />
      </div>
    </div>
  )
}