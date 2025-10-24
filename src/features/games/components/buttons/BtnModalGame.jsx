import cn from "classnames";
import s from "./BtnModalGame.module.scss"
import { Icon } from "../../../../shared/icones/Icon";
import { ModalGame } from "../modais/modalGame";


export const BtnModalGame = ({label, icon = '', type}) => {
  const id = (type == 1) ? 'newGame' : 'joinGame'

  return (
    <>
      <button className={cn(s.btnGame, 'col fs-responsive')}
      data-bs-toggle="modal" data-bs-target={'#' + id} >
        {(icon != '') && <Icon name={icon} />}
        {label}
      </button>
      <ModalGame type={type}/>
    </>
  )
}