import s from './ModalGame.module.scss'
import cn from 'classnames/bind'
import Input from "@/shared/forms/Input"
import { SelectOption } from '../../../../shared/forms/SelectOption'
import { useState } from 'react'
import { Icon } from '../../../../shared/icones/Icon'

export const ModalGame = ({id}) => {
  const [listaSistemas, setListaSistemas] = useState([
    { id: 1, descricao: 'D&D' },
    { id: 2, descricao: 'Tormenta' },
    { id: 3, descricao: 'Ordem Paranormal' }
  ])

  const getBody = () => {
    if(id == 'newGame') {
      return (
        <div className='modal-body container'>
          <div className='row'>
            <Input label='Game Title' placeholder='Something awesome...' theme='ipt-second' 
            hasIcon='true' nameIcon='feather' className='col'/>
            <SelectOption label='RPG System' descricaoPadrao='Choose a System...' 
            listaOpcoes={listaSistemas} theme='ipt-second' className='col-5 ps-0'/>
          </div>
        </div>
      )
    }else {
      return (
        <div className="modal-body">
        </div>
      )
    }
  }

  return (
    <div className="modal fade" id={id} tabindex="-1" aria-labelledby={id + 'Label'} 
      aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className={cn("modal-content", s.modalGame)}>
          <div className="modal-header">
            <Icon name='dices' />
            <h1 className="modal-title fs-5 ps-2" id={id + 'Label'}>
              { (id == 'newGame') ? 'Create a New Game' : 'Join a Game' }
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" 
              aria-label="Close"></button>
          </div>
          { getBody() }
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}