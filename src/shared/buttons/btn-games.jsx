import classNames from "classnames/bind";
import styles from "./btn-games.module.scss"
import { Icon } from "../icones/Icon";

const cx = classNames.bind(styles)

export const BtnGames = ({label, icon = '', onClick}) => {  
  return (
    // <div class="row d-flex justify-content-around btn-div">
    <button className={cx("btn-game", "col fs-responsive")}
    onClick={onClick}>
      {(icon != '') && <Icon name={icon} />}
        {label}
    </button>
    // </div>
  )
}