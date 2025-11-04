import { Icon } from '../icones/Icon'
import s from './Inputs.module.scss'
import cn from 'classnames'

export const SelectOption = ({
  label = '', listaOpcoes = [], descricaoPadrao, theme = 'ipt-primary', className
}) => {
  const id = `${label.replace(' ', '')}Select`

  return (
    <div className={cn('form-group', className)}>
      <label htmlFor={id} className={s.label}>{label}</label>
      <div className={cn(s.input, theme)}>
        <select className='form-control'
          id={id}>
          <option value='0' >{descricaoPadrao}</option>
          { listaOpcoes.map((item) => (
            <option key={item.id}>{item.descricao}</option>
          ))}
        </select>
        <Icon name='chevronDown' />
      </div>
    </div>
  )
}