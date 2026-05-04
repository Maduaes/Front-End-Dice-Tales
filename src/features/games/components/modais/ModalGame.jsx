import cn from 'classnames/bind'
import s from './ModalGame.module.scss'
import Input from "@/shared/forms/Input"
import { useState, useEffect } from 'react'
import pencilModalIcon from '@/assets/pencil_modal_icon.png'
import { Icon } from '../../../../shared/icones/Icon'
import {
  createGame,
  editGame,
  joinGame,
  deleteGame,
  uploadGameCover,
} from '../../../../services/gamesService'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]

export const ModalGame = ({ type, atualizaGames, dados }) => {
  const [formGame, setFormGame] = useState({ id: null, name: '' })
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
    if (isNewGame || isEditGame) {
      setFormGame({ ...formGame, [name]: value })
    }
    if (isJoinGame) {
      const nextValue = name === 'code'
        ? value.toUpperCase().replace(/\s/g, '').slice(0, 6)
        : value
      setFormJoin({ ...formJoin, [name]: nextValue })
    }
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
    if (isNewGame || isEditGame) {
      return (
        <div className="modal-body container">
          <div className="row g-3">
            <Input
              label="Room Name"
              placeholder="A room waiting for its story..."
              name="name"
              value={formGame.name}
              handleChange={handleChange}
              theme="ipt-second"
              hasIcon={true}
              nameIcon="feather"
              className="col-12"
            />
            {isEditGame && (
              <div className={cn("col-12", s.coverField)}>
                <label className={s.coverLabel} htmlFor={`${id}CoverUpload`}>
                  Cover Image
                </label>
                <div className={cn(s.coverInput, "ipt-second")}>
                  <input
                    id={`${id}CoverUpload`}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleCoverChange}
                    className={s.coverNativeInput}
                  />
                  <label className={s.coverButton} htmlFor={`${id}CoverUpload`}>
                    Choose file
                  </label>
                  <span
                    className={cn(s.coverValue, {
                      [s.coverValuePlaceholder]: !coverFile && !dados?.imagePath,
                    })}
                  >
                    {coverFile
                      ? coverFile.name
                      : dados?.imagePath
                        ? 'Current cover already defined.'
                        : 'No file selected'}
                  </span>
                  <img
                    src={pencilModalIcon}
                    alt=""
                    aria-hidden="true"
                    className={s.coverIcon}
                  />
                </div>
                <small className={s.coverHint}>
                  PNG, JPG or WEBP up to 10MB.
                </small>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (isDeleteGame) {
      return (
        <div className="modal-body container">
          <div className="row">
            <h3>{dados?.room_name ?? dados?.name}</h3>
            <p className="text-center">
              This action will delete your room.
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
            label="Room Code"
            placeholder="Enter the 6-character code..."
            name="code"
            value={formJoin.code}
            handleChange={handleChange}
            theme="ipt-second"
            hasIcon={true}
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
      <div className={cn("modal-dialog modal-dialog-centered")}>
        <div className={cn("modal-content", s.modalGame)}>
          <div className="modal-header">
            <Icon name={(isNewGame || isEditGame) ? 'dices' : 'swords'} />
            <h1 className="modal-title fs-5 ps-2" id={id + 'Label'}>
              {isNewGame
                ? 'Create a New Room'
                : isJoinGame
                ? 'Join a Room'
                : 'Edit your Room'}
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
                {isEditGame && isSubmitting
                  ? 'Saving...'
                  : isNewGame
                    ? 'Create Room'
                    : isJoinGame
                      ? 'Enter Room'
                      : 'Save Room'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
