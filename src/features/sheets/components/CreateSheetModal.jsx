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
// import ais from "./AiSheetModal.module.scss"
import { createSheet } from "../../../services/sheetsService"

const gameOptions = [{ id: 1, descricao: "D&D5e"}, { id: 2, descricao: "T20"}]
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]

export const CreateSheetModal = ({ type, atualizaGames, dados }) => {
  const [formGame, setFormGame] = useState({ id: null, name: '' })
  const [formSheet, setSheetData] = useState({ name: ''})
  const [formSystem, setGameData] = useState({ game: 'D&D5e' })
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
    setSheetData({ [name]: value })
  }

  const handleChangeOption = (name, value) => {
    setGameData({ [name]: value })
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
      const defaultDnDSheet = {
        schema_version: 1,

        char_class: null,
        level: 1,
        origin: null,
        race: null,
        subrace: null,
        alignment: null,
        inspiration: false,
        proficiency_bonus: 2,
        armor_class: null,
        initiative: null,
        movement_speed: null,
        total_hp: null,
        current_hp: null,
        temp_hp: null,
        hp_dice_sides: null,
        total_hp_dices: null,
        current_hp_dices: null,
        personality_traits: null,
        ideals: null,
        bonds: null,
        flaws: null,
        passive_perception: null,
        passive_perception_mod: 0,

        spell_save_dc: null,
        spell_attack_bonus: null,
        spellcasting_attribute: null,

        death_saving_throws: {
          success: 0,
          fails: 0
        },

        attributes: {
          str: { value: 10, mod: 0 },
          dex: { value: 10, mod: 0 },
          con: { value: 10, mod: 0 },
          int: { value: 10, mod: 0 },
          wis: { value: 10, mod: 0 },
          cha: { value: 10, mod: 0 }
        },

        saving_throws: {
          str: { default_value: 0, total_value: 0, is_proficient: false },
          dex: { default_value: 0, total_value: 0, is_proficient: false },
          con: { default_value: 0, total_value: 0, is_proficient: false },
          int: { default_value: 0, total_value: 0, is_proficient: false },
          wis: { default_value: 0, total_value: 0, is_proficient: false },
          cha: { default_value: 0, total_value: 0, is_proficient: false }
        },

        inventory: {
          money: {
            total_weight: 0,
            cp: 0,
            sp: 0,
            ep: 0,
            gp: 0,
            pp: 0
          },
          items: []
        },

        bio: {
          age: null,
          size: null,
          height: null,
          weight: null,
          appearance: null,
          allies: null,
          backstory: null,
          treasure: null
        },

        skills: {
          acrobatics: {
            atribute: "dex",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          animal_handing: {
            atribute: "wis",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          arcana: {
            atribute: "int",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          athletics: {
            atribute: "str",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          deception: {
            atribute: "cha",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          history: {
            atribute: "int",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          insight: {
            atribute: "wis",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          intimidation: {
            atribute: "cha",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          investigation: {
            atribute: "int",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          medicine: {
            atribute: "wis",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          nature: {
            atribute: "int",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          perception: {
            atribute: "wis",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          performance: {
            atribute: "cha",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          persuasion: {
            atribute: "cha",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          religion: {
            atribute: "int",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          sleight_of_hand: {
            atribute: "dex",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          stealth: {
            atribute: "dex",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          },
          survival: {
            atribute: "wis",
            proficiency_level: null,
            jack_of_all_trades_on: false,
            reliable_talent_on: false,
            other_mod: 0,
            total: null
          }
        },

        spell_slots: {
          level_1: { value: 0, mod: 0 },
          level_2: { value: 0, mod: 0 },
          level_3: { value: 0, mod: 0 },
          level_4: { value: 0, mod: 0 },
          level_5: { value: 0, mod: 0 },
          level_6: { value: 0, mod: 0 },
          level_7: { value: 0, mod: 0 },
          level_8: { value: 0, mod: 0 },
          level_9: { value: 0, mod: 0 }
        },

        customizable_features: [],

        tool_proficiencies: [],

        other_proficiencies: [],

        attacks: [],

        traits: [],

        spells: []
      }
      let response = await createSheet(
        {
          game_system: formSystem.game,
          sheet_type: "player",
          name: formSheet.name,
          content: defaultDnDSheet,
        }
      )

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
