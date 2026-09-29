import cn from "classnames/bind"
import s from "./Game.module.scss"
import { Icon } from "../../../shared/icones/Icon"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()
  const background = useMemo(() => getRandomGradient(), [])
  const roomName = game.room_name ?? game.name
  const isMaster = game.role === "master"
  const [hasValidImage, setHasValidImage] = useState(Boolean(game.imagePath))
  const [copied, setCopied] = useState(false)
  const copiedTimeout = useRef(null)

  useEffect(() => {
    setHasValidImage(Boolean(game.imagePath))
  }, [game.imagePath])

  useEffect(() => {
    return () => {
      if (copiedTimeout.current) {
        clearTimeout(copiedTimeout.current)
      }
    }
  }, [])

  const openRoom = () => {
    navigate(`/rooms/${game.id}`)
  }

  const copyRoomCode = async (event) => {
    event.stopPropagation()
    const code = game.code ?? ""

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code)
      } else {
        const input = document.createElement("textarea")
        input.value = code
        input.setAttribute("readonly", "")
        input.style.position = "absolute"
        input.style.left = "-9999px"
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        document.body.removeChild(input)
      }

      setCopied(true)
      if (copiedTimeout.current) {
        clearTimeout(copiedTimeout.current)
      }
      copiedTimeout.current = setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openRoom()
    }
  }

  return (
    <div className={cn("col-12 col-md-6 col-xl-4 mb-3")}>
      <div
        className={cn(s.card, "shadow")}
        role="button"
        tabIndex={0}
        onClick={openRoom}
        onKeyDown={handleCardKeyDown}
      >
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
                type="button"
                className={cn(s.btnEdit)}
                data-bs-toggle="modal"
                data-bs-target="#editGame"
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedGame(game)
                }}
              >
                <Icon name="squarePen" />
              </button>
            </div>
          )}
          <div className={cn(s.roomCodeGroup)}>
            <div className={cn(s.roomCode)}>
              <small>{`CODE: ${game.code}`}</small>
            </div>
            <button
              type="button"
              className={cn(s.copyCodeButton, copied && s.copyCodeButtonCopied)}
              aria-label={copied ? "Room code copied" : `Copy room code ${game.code}`}
              title={copied ? "Copied" : "Copy room code"}
              onClick={copyRoomCode}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <svg
                width="20"
                height="27"
                viewBox="-3 0 25 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M4.16667 16.875H3.33334C2.89131 16.875 2.46739 16.6379 2.15483 16.216C1.84227 15.794 1.66667 15.2217 1.66667 14.625V4.5C1.66667 3.90326 1.84227 3.33097 2.15483 2.90901C2.46739 2.48705 2.89131 2.25 3.33334 2.25H10.8333C11.2754 2.25 11.6993 2.48705 12.0118 2.90901C12.3244 3.33097 12.5 3.90326 12.5 4.5V5.625M9.16667 10.125H16.6667C17.5871 10.125 18.3333 11.1324 18.3333 12.375V22.5C18.3333 23.7426 17.5871 24.75 16.6667 24.75H9.16667C8.2462 24.75 7.5 23.7426 7.5 22.5V12.375C7.5 11.1324 8.2462 10.125 9.16667 10.125Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {copied && (
                <span className={cn(s.copyTooltip)} role="status">
                  Copied!
                </span>
              )}
            </button>
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
