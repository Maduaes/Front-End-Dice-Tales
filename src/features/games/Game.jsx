import { useState } from "react"
import classNames from "classnames/bind";
import styles from "./Game.module.scss"

const cx = classNames.bind(styles)

export const Game = () => {
  const [game, setGame] = useState({})

  return (
    <div className={cx("container", "cardMain")}>
      <div className="row">
        <div className="col-4 mb-3">
          <div className={cx("card", "cardGame", "shadow")}>
            <div className={cx("imgBox", "emptyImage")}>
              <img
                className={cx("cardImgTop")}
                src={game.game_image}
                aria-label="Imagem do Jogo"
              />
            </div>
            <div className={cx("cardBody")}>
              <h6 className={cx("cardTitle")}>{game.game_title}</h6>
            </div>
          </div>
        </div>
        {/* <div className="p-4 container">
          <p>It looks like you don't have any games yet!</p>
            <div><app-btn-games [backgroundColor]="'white'" [disabledIcon]="true"
          ></app-btn-games></div>
        </div> */}
      </div>
    </div>
  )
}
