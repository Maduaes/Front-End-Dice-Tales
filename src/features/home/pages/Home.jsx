import { Game } from '../../games/components/Game'
import { useEffect, useMemo, useState } from 'react'
import { getRecentGames } from '../../../services/gamesService'
import cn from 'classnames/bind'
import s from './Home.module.scss'
import { BtnModalGame } from '../../games/components/buttons/BtnModalGame'
import { Icon } from '../../../shared/icones/Icon'
import { SheetsContainer } from '../../sheets/components/SheetsContainerHome'
import { ModalGame } from '../../games/components/modais/ModalGame'
import { useNavigate } from 'react-router-dom'

const RECENT_ROOMS_LIMIT = 9

const Home = () => {
  const [gamesList, setGamesList] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()
  const filteredGames = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase()
    return query
      ? gamesList.filter((game) => (game.room_name ?? game.name ?? '').toLocaleLowerCase().includes(query))
      : gamesList
  }, [gamesList, searchText])

  const atualizaGames = (response, actionUpdate) => {
    if (!response && actionUpdate !== 'delete') {
      return
    }

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
        setGamesList((prev) => {
          const nextList = prev.filter((game) => game.id !== response.id)
          return [response, ...nextList]
        })
    }
  }

  const fetchData = async () => {
    try {
      const games = await getRecentGames()
      setGamesList(Array.isArray(games) ? games : [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const hasItems = list => list && list.length > 0

  return (
    <main className={cn("container", s.homePage)}>
      <section className={cn(s.sectionRow, 'row mt-3 gap-2')}>
        <section className={cn(s.gameContainer, 'shadow col-12 col-lg-8')}>
          <header className={cn('container', s.headerGames)}>
            <div className={cn('container', s.groupTitleGames)}>
              <div className={cn('row')}>
                <h2 className={cn('col ps-3')}>Your Rooms</h2>
              </div>
            </div>
            <div className={cn('col-7', s.search)}>
              <input
                type="search"
                placeholder="Search for your rooms"
                aria-label="Search for your rooms"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
              <Icon name="search" />
            </div>
          </header>

          <main className={cn('container pb-3')}>
            {hasItems(filteredGames) ? (
              <div className="row ps-3 pe-3">
                {filteredGames.map(game => (
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
                  {gamesList.length > 0 && searchText.trim()
                    ? 'No rooms match your search.'
                    : "It looks like you don't have any rooms yet!"}
                </p>
              </div>
            )}
          </main>

          {gamesList.length >= RECENT_ROOMS_LIMIT && (
            <footer className={cn('row d-flex justify-content-center')}>
              <input
                className={cn(s.btnMore, 'col-4')}
                type="button"
                value="More"
                onClick={() => navigate('/games')}
              />
            </footer>
          )}
        </section>

        <aside className={cn(s.aside, 'col')}>
          <header className={cn('container')}>
            <div className={cn('row d-flex justify-content-around gap-3', s.btnDiv)}>
              <BtnModalGame
                label="New Room"
                icon="dices"
                type="1"
                atualizaGames={atualizaGames}
              />
              <BtnModalGame
                label="Join a Room"
                icon="swords"
                type="3"
                atualizaGames={atualizaGames}
              />
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
