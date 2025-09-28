import classNames from "classnames/bind";
import styles from "./Game.module.scss"

const cx = classNames.bind(styles)

const gradients = [
  "linear-gradient(45deg, #b83cceff 0%, #7687e6ff 50%, #3bd2d7ff 100%)",
  "linear-gradient(45deg, #38b4fe, #00c8ae, #c9ba5a)", 
  "linear-gradient(45deg, #2932b6ff, #1384caff, #9fedd8ff)",                                                                           
  "linear-gradient(45deg, #454ae1ff, #9641d7ff, #f247abff)",
  "linear-gradient(45deg, #df6840ff, #7010a8ff)"                                                                                                                     
]

function getRandomGradient() {
  const index = Math.floor(Math.random() * gradients.length)
  return gradients[index]
}

export const Game = ({game}) => {  
  const style = {
    background: getRandomGradient()
  }

  return (
    <div className={cx("col-12 col-md-6 col-xl-4 mb-3")}>
      <div className={cx("card", "shadow")}>
        <div className={cx("imgBox", "emptyImage")} style={style}>
          <img
            className={cx("cardImgTop")}
            // src={game.image_path}
            aria-label="Imagem do Jogo"
          />
        </div>
        <div className={cx("cardBody")}>
          <h6 className={cx("text-truncate fs-responsive")}>{game.name_game}</h6>
        </div>
      </div>
    </div>  
  )
}
