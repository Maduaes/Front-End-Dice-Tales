import cn from 'classnames/bind'
import s from '../../games/components/modais/ModalGame.module.scss'
import Input from "@/shared/forms/Input"
import { useState, useEffect } from 'react'
import pencilModalIcon from '@/assets/pencil_modal_icon.png'
import { Icon } from '../../../shared/icones/Icon'
// import {
//   createGame,
//   editGame,
//   joinGame,
//   deleteGame,
//   uploadGameCover,
// } from '../../../../services/gamesService'
import { SelectOption } from "@/shared/forms/SelectOption"
import ais from "./AiSheetModal.module.scss"

const gameOptions = [{ id: 1, descricao: "D&D 5e" }]
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]

export const CreateSheetModal = ({ type, atualizaGames, dados }) => {
  const [formGame, setFormGame] = useState({ id: null, name: '' })
  const [formSheet, setSheetName] = useState({ name: '' })
  const [formJoin, setFormJoin] = useState({ code: '' })
  const [coverFile, setCoverFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isNewGame = type == 1
  const isEditGame = type == 2
  const isJoinGame = type == 3
  const isDeleteGame = type == 4

  const id =
    isNewGame ? 'newGame' :
    isEditGame ? 'editGame' :
    isJoinGame ? 'joinGame' :
    isDeleteGame ? 'deleteGame' : ''

  const closeModal = () => {
    const modal = document.getElementById(id)
    const closeButton = modal?.querySelector('[aria-label="Close"]')
    closeButton?.click()
  }

  const handleModalClose = () => {
    setCoverFile(null)
    setIsSubmitting(false)
  }

  useEffect(() => {
     if(isEditGame && dados) {
      setFormGame({
        id: dados.id,
        name: dados.room_name ?? dados.name ?? '',
      })
    }else {
      setFormGame({
        id: null,
        name: '',
      })
    }
    setCoverFile(null)
  }, [dados, isEditGame])

  const handleDeleteClick = async () => {
    try {
      await deleteGame(formGame.id)
      atualizaGames?.({ id: formGame.id }, 'delete')
      closeModal()
    } catch {
      alert('Erro ao remover a sala!')
    }
  }

  const handleChange = (name, value) => {
    setSheetName({ [name]: value })
  }

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setCoverFile(null)
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = ''
      alert('Use apenas arquivos PNG, JPG ou WEBP.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      event.target.value = ''
      alert('A imagem deve ter no maximo 10MB.')
      return
    }

    setCoverFile(file)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      let response = null

      if (isNewGame || isEditGame) {
        response = isNewGame
          ? await createGame(formGame.name)
          : await editGame(formGame.id, formGame.name)

        if (isEditGame && coverFile) {
          response = await uploadGameCover(formGame.id, coverFile)
        }

        if (response) {
          atualizaGames?.(response, isEditGame ? 'edit' : '')
        }
      }
      if (isJoinGame) {
        response = await joinGame(formJoin.code)
        if(response) {
          atualizaGames?.(response, '')
        }
      }

      if (response) {
        closeModal()
      }
    } catch (error) {
      const detail = error.response?.data?.detail
      alert(detail ?? 'Nao foi possivel concluir a acao.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBody = () => {

      return (
        <div className="modal-body container">
          <div className="row g-3">
            <Input
              label="Character Name"
              placeholder="Who is your character?"
              name="name"
              value={formSheet.name}
              handleChange={handleChange}
              theme="ipt-second"
              hasIcon={true}
              nameIcon="feather"
              className="col-12"
            />
            <SelectOption
                label="Game"
                name="game"
                value="teste"
                handleChange={handleChange}
                listaOpcoes={gameOptions}
                theme="ipt-second"
                className="col-12"
            />
          </div>
        </div>
      )
    
  }

  return (
    <div
      className="modal fade"
      id="createSheetModal"
      tabIndex="-1"
      aria-labelledby="newSheet"
      aria-hidden="true"
    >
      <div className={cn("modal-dialog modal-dialog-centered")}>
        <div className={cn("modal-content", s.modalGame)}>
          <div className="modal-header">
            <Icon name="dices" />
            <h1 className="modal-title fs-5 ps-2" id="newSheet">
              Create new sheet
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleModalClose}
            ></button>
          </div>

          {getBody()}

          <div className={cn("modal-footer", { 'justify-content-between': isEditGame })}>
            {isEditGame && (
              <button
                className={cn(s.deleteGame)}
                onClick={handleDeleteClick}
              >
                <Icon name="trash2" />
              </button>
            )}
            <div className={cn("d-flex gap-2", s.divBotoes)}>
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={handleModalClose}
              >
                Back
              </button>
              <button
                type="button"
                className={cn("btn", "btn-primary-green", {
                  [s.savingButton]: isEditGame,
                })}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
