import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getGameByCode } from "../../../services/gamesService"

export const Tabletop = () => {
  const { code } = useParams()
  const [game, setGame] = useState()

  useEffect(() => {
    const getGame = async () => {
      const response = await getGameByCode(code)
      if(response) setGame(response)
    }
    getGame()
  }, [code,])

  return(
    <main>
      <div>
        <h2>Welcome to <strong>{game.name}</strong>!</h2>
      </div>
    </main>
  )
}