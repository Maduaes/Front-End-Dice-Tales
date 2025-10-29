import cn from 'classnames/bind'
import s from './ModalGame.module.scss'
import Input from "@/shared/forms/Input"
import { SelectOption } from '../../../../shared/forms/SelectOption'
import { useState } from 'react'
import { Icon } from '../../../../shared/icones/Icon'
import { createGame } from '../../../../services/gamesService'

export const ModalGame = ({ type, atualizaGames }) => {
  const [formGame, setFormGame] = useState({ name: '', system: 0 })
  const [formJoin, setFormJoin] = useState({ code: '' })

  let newGame = (type == 1)
  let editGame = (type == 2)
  let joinGame = (type == 3)
  let deleteGame = (type == 4)
  
  let id
  if(newGame) id = 'newGame'
  if(editGame) id = 'editGame'
  if(joinGame) id = 'joinGame'
  if(deleteGame) id = 'deleteGame'

  const [listaSistemas, setListaSistemas] = useState([
    { id: 1, descricao: 'D&D' }
  ])

  const handleChange = (name, value) => {
    if(newGame || editGame) {
      setFormGame({ ...formGame, [name]: value })
    }
    if(joinGame){
      setFormJoin({ ...formJoin, [name]: value })
    }
  }

  const handleSubmit = async () => {
    if(newGame || editGame) {
      const response = newGame 
        ? await createGame(formGame.name) 
        : await editGame(formGame.name)
      if(response) {
        document.getElementById('btn-game-modal')?.click()
        atualizaGames(response)
      }
    }
    if(joinGame) {
      const response = await joinGame(formJoin.code)
      closeModal()
      atualizaGames(response)
    }
  }

  const openDeleteModal = () => {
    closeModal()
    document.getElementById('btn-delete-modal')?.click()
  }

  const closeModal = () => {
    document.getElementById('btn-game-modal')?.click()
  }

  const getBody = () => {
    if(newGame || editGame) {
      return (
        <div className='modal-body container'>
          <div className='row'>
            <Input label='Game Title' placeholder='A tale waiting to be told...'
              name='name' value={formGame.name} handleChange={handleChange}
              theme='ipt-second' hasIcon='true' nameIcon='feather' className='col'
            />
            { newGame && 
              <SelectOption label='RPG System' descricaoPadrao='Choose a System...'
                name='system' value={formGame.system} handleChange={handleChange} 
                listaOpcoes={listaSistemas} theme='ipt-second' className='col-5 ps-0'
              />
            }
          </div>
        </div>
      )
    }
    if(deleteGame) {
      return(
        <div className='modal-body container'>
          <div className='row'>
            <p className='text-center'>This Action will delete your game and all sheets you had inside it!</p>
            <p className='text-center'>Are you sure?</p>
          </div>
        </div>
      )
    }
    if(joinGame) {
      return (
        <div className="modal-body">
          <Input label='Key Code' placeholder='Enter a key code...' 
          name='code' value={formJoin.code} handleChange={handleChange}
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
            <Icon name={ (newGame || editGame) ? 'dices' : 'swords'} />
            <h1 className="modal-title fs-5 ps-2" id={id + 'Label'}>
              { newGame ? 'Create a New Game' : joinGame ? 'Join a Game' : 'Edit your Game' }
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" id='btn-game-modal'
              aria-label="Close"></button>
          </div>
          { getBody() }
          <div className={cn("modal-footer", {'justify-content-between': editGame})}>
            { editGame && 
              <button className={cn(s.deleteGame)} 
                      onClick={openDeleteModal} 
                      data-bs-toggle="modal" 
                      data-bs-target='#deleteGame'
                      id="btn-delete-modal">
                <Icon name='trash2' />
              </button>
            }
            <div className={cn("d-flex gap-2", s.divBotoes)}>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Back
              </button>
              <button type="button" className="btn btn-primary-green" onClick={handleSubmit}>
                { newGame ? 'Create Game' : joinGame ? 'Enter the Game' : 'Edit Game' }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}