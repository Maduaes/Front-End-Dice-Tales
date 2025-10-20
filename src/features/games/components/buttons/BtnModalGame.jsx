import classNames from "classnames/bind";
import styles from "./BtnModalGame.module.scss"
import { Icon } from "../../../../shared/icones/Icon";
import { ModalGame } from "../modais/modalGame";

const cx = classNames.bind(styles)

export const BtnModalGame = ({label, icon = '', id}) => {

  return (
    <>
      <button className={cx("btn-game", "col fs-responsive")}
      data-bs-toggle="modal" data-bs-target={'#' + id} >
        {(icon != '') && <Icon name={icon} />}
          {label}
      </button>
      <ModalGame id={id}/>
    </>
  )
}