import cn from "classnames/bind"
import s from "./Game.module.scss"
import { Icon } from "../../../shared/icones/Icon"
import { useEffect, useMemo, useState } from "react"

const gradients = [
  "linear-gradient(45deg, #b83cceff 0%, #7687e6ff 50%, #3bd2d7ff 100%)",
  "linear-gradient(45deg, #38b4fe, #00c8ae, #c9ba5a)",
  "linear-gradient(45deg, #2932b6ff, #1384caff, #9fedd8ff)",
  "linear-gradient(45deg, #454ae1ff, #9641d7ff, #f247abff)",
  "linear-gradient(45deg, #df6840ff, #7010a8ff)",
]

function getRandomGradient() {
  const index = Math.floor(Math.random() * gradients.length)
  return gradients[index]
}

export const Game = ({ game, setSelectedGame }) => {
  const background = useMemo(() => getRandomGradient(), [])
  const roomName = game.room_name ?? game.name
  const isMaster = game.role === "master"
  const [hasValidImage, setHasValidImage] = useState(Boolean(game.imagePath))

  useEffect(() => {
    setHasValidImage(Boolean(game.imagePath))
  }, [game.imagePath])

  return (
    <div className={cn("col-12 col-md-6 col-xl-4 mb-3")}>
      <div className={cn(s.card, "shadow")}>
        <div
          className={cn(s.imgBox, s.emptyImage)}
          style={{ background }}
        >
          {hasValidImage && (
            <img
              className={cn(s.cardImgTop)}
              src={game.imagePath}
              alt=""
              aria-hidden="true"
              onError={() => setHasValidImage(false)}
            />
          )}
          {isMaster && (
            <div className={cn(s.editIcon)}>
              <button
                className={cn(s.btnEdit)}
                data-bs-toggle="modal"
                data-bs-target="#editGame"
                onClick={() => setSelectedGame(game)}
              >
                <Icon name="squarePen" />
              </button>
            </div>
          )}
          <div className={cn(s.roomCode)}>
            <small>{`CODE: ${game.code}`}</small>
          </div>
        </div>
        <div className={cn(s.cardBody)}>
          <h6 className={cn("text-truncate fs-responsive", s.roomName)}>
            {roomName}
          </h6>
        </div>
      </div>
    </div>
  )
}
