import { useEffect, useState } from 'react'
import { Game } from '../games/components/Game'
import { getAllGames } from '../../services/gamesService'
import { ModalGame } from '../games/components/modais/ModalGame'

const GamesPage = () => {
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllGames()
      .then(setGames)
      .catch(() => setError('Unable to load your rooms. Please try again.'))
  }, [])

  return (
    <>
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <section className="p-4 rounded-4" style={{ backgroundColor: '#23222F', color: 'white' }}>
          <h1 className="mb-4">Games</h1>
          {error ? (
            <p role="alert">{error}</p>
          ) : games.length ? (
            <div className="row">
              {games.map((game) => <Game key={game.id} game={game} setSelectedGame={setSelectedGame} />)}
            </div>
          ) : (
            <p>You have no rooms yet.</p>
          )}
        </section>
      </main>
      <ModalGame
        type="2"
        dados={selectedGame}
        atualizaGames={(updatedGame, action) => setGames((previous) => action === 'delete'
          ? previous.filter((game) => game.id !== updatedGame.id)
          : previous.map((game) => game.id === updatedGame.id ? updatedGame : game))}
      />
    </>
  )
}

export default GamesPage
