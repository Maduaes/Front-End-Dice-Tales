import cn from 'classnames/bind'
import s from './ModalGame.module.scss'
import Input from "@/shared/forms/Input"
import { SelectOption } from '../../../../shared/forms/SelectOption'
import { useState } from 'react'
import { Icon } from '../../../../shared/icones/Icon'
import { createGame } from '../../../../services/gamesService'

export const ModalGame = ({type}) => {
  const [formCreate, setFormCreate] = useState({ name: '', system: '' })

  const newGame = (type == 1)
  const id = newGame ? 'newGame' : 'joinGame'

  const [listaSistemas, setListaSistemas] = useState([
    { id: 1, descricao: 'D&D' },
    { id: 2, descricao: 'Tormenta' },
    { id: 3, descricao: 'Ordem Paranormal' }
  ])

  const handleChange = (name, value) => {
    if(newGame) {
      setFormCreate({ ...formCreate, [name]: value })
    }
  }

  const handleClick = async () => {
    if(newGame) {
      const response = await createGame(formCreate.name)
      console.log(response)
    }
  }

  const getBody = () => {
    if(newGame) {
      return (
        <div className='modal-body container'>
          <div className='row'>
            <Input label='Game Title' placeholder='A tale waiting to be told...'
              name='title' value={formCreate.title} handleChange={handleChange}
              theme='ipt-second' hasIcon='true' nameIcon='feather' className='col'
            />
            <SelectOption label='RPG System' descricaoPadrao='Choose a System...'
              name='system' value={formCreate.system} handleChange={handleChange} 
              listaOpcoes={listaSistemas} theme='ipt-second' className='col-5 ps-0'
            />
          </div>
        </div>
      )
    }else {
      return (
        <div className="modal-body">
          <Input label='Key Code' placeholder='Enter a key code...' 
          theme='ipt-second' hasIcon='true' nameIcon='keyRound' />
        </div>
      )
    }
  }

  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={id + 'Label'} 
      aria-hidden="true">
      <div className={cn("modal-dialog modal-dialog-centered", {'modal-lg': newGame})}>
        <div className={cn("modal-content", s.modalGame)}>
          <div className="modal-header">
            <Icon name={newGame ? 'dices' : 'swords'} />
            <h1 className="modal-title fs-5 ps-2" id={id + 'Label'}>
              { newGame ? 'Create a New Game' : 'Join a Game' }
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" 
              aria-label="Close"></button>
          </div>
          { getBody() }
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Back
            </button>
            <button type="button" className="btn btn-primary-green" onClick={handleClick}>
              { newGame ? 'Create Game' : 'Enter the Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}