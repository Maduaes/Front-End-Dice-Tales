import cn from 'classnames/bind'
import s from '../../games/components/modais/ModalGame.module.scss'
import Input from "@/shared/forms/Input"
import { useState, useEffect } from 'react'
import pencilModalIcon from '@/assets/pencil_modal_icon.png'
import { Icon } from '../../../shared/icones/Icon'
import { SelectOption } from "@/shared/forms/SelectOption"
import { createSheet } from "../../../services/sheetsService"

const gameOptions = [{ id: 1, descricao: "D&D5e"}, { id: 2, descricao: "T20"}]
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]

export const CreateSheetModal = ({ onSheetCreated }) => {
  const [formSheet, setSheetData] = useState({ name: ''})
  const [formSystem, setGameData] = useState({ game: 'D&D5e' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const closeModal = () => {
    const modal = document.getElementById("createSheetModal")
    const closeButton = modal?.querySelector('[aria-label="Close"]')
    closeButton?.click()
  }

  const handleModalClose = () => {
    setIsSubmitting(false)
  }

  const handleChange = (name, value) => {
    setSheetData({ [name]: value })
  }

  const handleChangeOption = (name, value) => {
    setGameData({ [name]: value })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      let response = await createSheet(
        {
          game_system: formSystem.game,
          sheet_type: "player",
          name: formSheet.name
        }
      )

      if (response) {
        onSheetCreated?.(response)
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
                value={formSystem.game}
                handleChange={handleChangeOption}
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

          <div className={cn("modal-footer")}>
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
                className={cn("btn", "btn-primary-green")}
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
