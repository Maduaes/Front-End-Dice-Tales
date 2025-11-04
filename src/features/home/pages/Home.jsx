import { Game } from '../../games/components/Game'
import { useEffect, useState } from 'react'
import { getRecentGames } from '../../../services/gamesService'
import cn from 'classnames/bind'
import s from './Home.module.scss'
import { BtnModalGame } from '../../games/components/buttons/BtnModalGame'
import { Icon } from '../../../shared/icones/Icon'
import { SheetsContainer } from '../../sheets/components/SheetsContainerHome'
import { ModalGame } from '../../games/components/modais/modalGame'

const Home = () => {
  const [gamesList, setGamesList] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)

  const atualizaGames = (response, actionUpdate) => {
    switch (actionUpdate) {
      case 'edit':
        setGamesList(prev =>
          prev.map(game =>
            game.id === response.id ? response : game
          )
        )
        break
      case 'delete':
        setGamesList(prev => prev.filter(game => game.id !== response.id))
        break
      default:
        setGamesList(prev => [...prev, response.game])
    }
  }

  const fetchData = async () => {
    try {
      const games = await getRecentGames()
      setGamesList(games)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const hasItems = list => list && list.length > 0

  return (
    <main className="container">
      <section className={cn(s.sectionRow, 'row mt-3 gap-2')}>
        <section className={cn(s.gameContainer, 'shadow col-12 col-lg-8')}>
          <header className={cn('container', s.headerGames)}>
            <div className={cn('container', s.groupTitleGames)}>
              <div className={cn('row')}>
                <h2 className={cn('col ps-3')}>Your Games</h2>
              </div>
            </div>
            <div className={cn('col-7', s.search)}>
              <input type="search" placeholder="Search for your games" />
              <Icon name="search" />
            </div>
          </header>

          <main className={cn('container pb-3')}>
            {hasItems(gamesList) ? (
              <div className="row ps-3 pe-3">
                {gamesList.map(game => (
                  <Game
                    key={game.id}
                    game={game}
                    setSelectedGame={setSelectedGame}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 container">
                <p className="text-center">
                  It looks like you don't have any games yet!
                </p>
              </div>
            )}
          </main>

          {gamesList.length > 9 && (
            <footer className={cn('row d-flex justify-content-center')}>
              <input
                className={cn(s.btnMore, 'col-4')}
                type="button"
                value="More"
              />
            </footer>
          )}
        </section>

        <aside className={cn(s.aside, 'col')}>
          <header className={cn('container')}>
            <div className={cn('row d-flex justify-content-around gap-3', s.btnDiv)}>
              <BtnModalGame
                label="New Game"
                icon="dices"
                type="1"
                atualizaGames={atualizaGames}
              />
              <BtnModalGame label="Join a Game" icon="swords" type="3" />
            </div>
          </header>

          <SheetsContainer />
        </aside>
      </section>

      <ModalGame 
        type="2" atualizaGames={atualizaGames} dados={selectedGame} />
    </main>
  )
}

export default Home
