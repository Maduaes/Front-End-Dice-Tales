import cn from 'classnames/bind'
import s from './ModalGame.module.scss'
import Input from "@/shared/forms/Input"
import { SelectOption } from '../../../../shared/forms/SelectOption'
import { useState, useEffect } from 'react'
import { Icon } from '../../../../shared/icones/Icon'
import { createGame, editGame, joinGame, deleteGame } from '../../../../services/gamesService'

export const ModalGame = ({ type, atualizaGames, dados }) => {
  const [formGame, setFormGame] = useState({ id: null, name: '', system: 0 })
  const [formJoin, setFormJoin] = useState({ code: '' })

  const isNewGame = type == 1
  const isEditGame = type == 2
  const isJoinGame = type == 3
  const isDeleteGame = type == 4

  const id =
    isNewGame ? 'newGame' :
    isEditGame ? 'editGame' :
    isJoinGame ? 'joinGame' :
    isDeleteGame ? 'deleteGame' : ''

  const [listaSistemas, setListaSistemas] = useState([
    { id: 1, descricao: 'D&D' },
  ])

  useEffect(() => {
     if(isEditGame && dados) {
      setFormGame({
        id: dados.id,
        name: dados.name || '',
        system: 0,
      })
    }else {
      setFormGame({ 
        id: null,
        name: '',
        system: 0 
      })
    }
  }, [dados, isEditGame])

  const handleDeleteClick = async () => {
    await deleteGame(formGame.id)
    .then(() => {
      atualizaGames({ id: formGame.id }, 'delete')
    })
    .catch(() => {
      alert('Erro!')
    })
  }

  const handleChange = (name, value) => {
    if (isNewGame || isEditGame) {
      setFormGame({ ...formGame, [name]: value })
    }
    if (isJoinGame) {
      setFormJoin({ ...formJoin, [name]: value })
    }
  }

  const handleSubmit = async () => {
    if (isNewGame || isEditGame) {
      const response = isNewGame
        ? await createGame(formGame.name)
        : await editGame(formGame.id, formGame.name)
      if (response) {
        atualizaGames(response, isEditGame ? 'edit' : '')
      }
    }
    if (isJoinGame) {
      const response = await joinGame(formJoin.code)
      if(response) {
        atualizaGames(response, '')
      }
    }
  }

  const getBody = () => {
    if (isNewGame || isEditGame) {
      return (
        <div className="modal-body container">
          <div className="row">
            <Input
              label="Game Title"
              placeholder="A tale waiting to be told..."
              name="name"
              value={formGame.name}
              handleChange={handleChange}
              theme="ipt-second"
              hasIcon="true"
              nameIcon="feather"
              className="col"
            />
            {isNewGame && (
              <SelectOption
                label="RPG System"
                descricaoPadrao="Choose a System..."
                name="system"
                value={formGame.system}
                handleChange={handleChange}
                listaOpcoes={listaSistemas}
                theme="ipt-second"
                className="col-5 ps-0"
              />
            )}
          </div>
        </div>
      )
    }

    if (isDeleteGame) {
      return (
        <div className="modal-body container">
          <div className="row">
            <h3>{dados?.name}</h3>
            <p className="text-center">
              This Action will delete your game and all sheets you had inside it!
            </p>
            <p className="text-center">Are you sure?</p>
          </div>
        </div>
      )
    }

    if (isJoinGame) {
      return (
        <div className="modal-body">
          <Input
            label="Key Code"
            placeholder="Enter a key code..."
            name="code"
            value={formJoin.code}
            handleChange={handleChange}
            theme="ipt-second"
            hasIcon="true"
            nameIcon="keyRound"
          />
        </div>
      )
    }
  }

  return (
    <div
      className="modal fade"
      id={id}
      tabIndex="-1"
      aria-labelledby={id + 'Label'}
      aria-hidden="true"
    >
      <div className={cn("modal-dialog modal-dialog-centered", { 'modal-lg': isNewGame })}>
        <div className={cn("modal-content", s.modalGame)}>
          <div className="modal-header">
            <Icon name={(isNewGame || isEditGame) ? 'dices' : 'swords'} />
            <h1 className="modal-title fs-5 ps-2" id={id + 'Label'}>
              {isNewGame
                ? 'Create a New Game'
                : isJoinGame
                ? 'Join a Game'
                : 'Edit your Game'}
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          {getBody()}

          <div className={cn("modal-footer", { 'justify-content-between': isEditGame })}>
            {isEditGame && (
              <button
                className={cn(s.deleteGame)}
                onClick={handleDeleteClick}
                data-bs-dismiss="modal"
              >
                <Icon name="trash2" />
              </button>
            )}
            <div className={cn("d-flex gap-2", s.divBotoes)}>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary-green"
                onClick={handleSubmit}
                data-bs-dismiss="modal"
              >
                {isNewGame
                  ? 'Create Game'
                  : isJoinGame
                  ? 'Enter the Game'
                  : 'Edit Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
