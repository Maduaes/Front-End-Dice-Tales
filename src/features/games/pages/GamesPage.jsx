import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames/bind'
import { useNavigate } from 'react-router-dom'
import { getAllGames } from '../../../services/gamesService'
import { Icon } from '../../../shared/icones/Icon'
import { BtnModalGame } from '../components/buttons/BtnModalGame'
import { ModalGame } from '../components/modais/ModalGame'
import s from './GamesPage.module.scss'

const fallbackGradients = [
  'linear-gradient(45deg, #b83cceff 0%, #7687e6ff 50%, #3bd2d7ff 100%)',
  'linear-gradient(45deg, #38b4fe, #00c8ae, #c9ba5a)',
  'linear-gradient(45deg, #2932b6ff, #1384caff, #9fedd8ff)',
  'linear-gradient(45deg, #454ae1ff, #9641d7ff, #f247abff)',
  'linear-gradient(45deg, #df6840ff, #7010a8ff)',
]

const GamesPage = () => {
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedSystem, setSelectedSystem] = useState('All systems')
  const [selectedRole, setSelectedRole] = useState('All roles')
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)
  const copiedTimeout = useRef(null)
  const fallbackGradientById = useRef(new Map())
  const navigate = useNavigate()

  const getFallbackGradient = (roomId) => {
    if (!fallbackGradientById.current.has(roomId)) {
      const randomGradient = fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)]
      fallbackGradientById.current.set(roomId, randomGradient)
    }
    return fallbackGradientById.current.get(roomId)
  }

  const loadGames = useCallback(async () => {
    try {
      setError('')
      const rooms = await getAllGames()
      setGames(Array.isArray(rooms) ? rooms : [])
    } catch {
      setError('Unable to load your rooms. Please try again.')
    }
  }, [])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  useEffect(() => () => clearTimeout(copiedTimeout.current), [])

  const copyRoomCode = async (event, game) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(game.code ?? '')
      setCopiedCode(game.id)
      clearTimeout(copiedTimeout.current)
      copiedTimeout.current = setTimeout(() => setCopiedCode(null), 1200)
    } catch {
      setCopiedCode(null)
    }
  }

  const filteredGames = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase()
    return games.filter((game) => {
      const matchesSearch = (game.room_name ?? game.name ?? '').toLocaleLowerCase().includes(query)
      const matchesSystem = selectedSystem === 'All systems' || (game.game_system ?? 'Unknown system') === selectedSystem
      const matchesRole = selectedRole === 'All roles' || game.role === selectedRole
      return matchesSearch && matchesSystem && matchesRole
    })
  }, [games, searchText, selectedSystem, selectedRole])

  const gameSystems = useMemo(() => [
    'All systems',
    ...new Set(games.map((game) => game.game_system ?? 'Unknown system')),
  ], [games])

  const updateGames = (room, action) => {
    if (!room) return
    setGames((current) => {
      if (action === 'delete') return current.filter((game) => game.id !== room.id)
      if (action === 'edit') {
        return current.map((game) => game.id === room.id
          ? { ...game, ...room, members_profilepics: room.members_profilepics ?? game.members_profilepics }
          : game)
      }
      return [room, ...current.filter((game) => game.id !== room.id)]
    })
  }

  return (
    <main className={cn('container', s.gamesPage)}>
      <section className={s.roomsPanel} aria-labelledby="your-games-title">
          <header className={s.panelHeader}>
            <div className={s.titleRibbon}>
              <span className={s.ribbonExtension}></span>
              <h1 id="your-games-title">Your Games</h1>
            </div>
          </header>

          <section className={s.controlsRow} aria-label="Room actions and filters">
            <div className={s.actionsGroup}>
              <BtnModalGame label="New Room" icon="dices" type="1" atualizaGames={updateGames} />
              <BtnModalGame label="Join a Room" icon="swords" type="3" atualizaGames={updateGames} />
            </div>
            <div className={s.filterColumn}>
              <label className={s.searchBox} aria-label="Search games">
                <span className="visually-hidden">Search your rooms</span>
                <input
                  type="search"
                  placeholder="Search game by name..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <Icon name="search" size={27} color="#363547" />
              </label>
              <div className={s.filters}>
                <label className={s.filterLabel}>
                  <span>Role</span>
                  <span className={s.selectWrap}>
                    <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} aria-label="Filter rooms by role">
                      <option value="All roles">All roles</option>
                      <option value="master">Dungeon Master</option>
                      <option value="player">Player</option>
                    </select>
                  </span>
                </label>
                <label className={s.filterLabel}>
                  <span>Game system</span>
                  <span className={s.selectWrap}>
                    <select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)} aria-label="Filter rooms by game system">
                      {gameSystems.map((system) => <option key={system} value={system}>{system}</option>)}
                    </select>
                  </span>
                </label>
              </div>
            </div>
          </section>

          {error ? (
            <p className={s.message} role="alert">{error}</p>
          ) : filteredGames.length ? (
            <div className={s.roomList}>
              {filteredGames.map((game) => (
                <article className={s.roomCard} key={game.id}>
                  <div
                    className={cn(s.cover, !game.imagePath && s.coverFallback)}
                    style={!game.imagePath ? { background: getFallbackGradient(game.id) } : undefined}
                    aria-label={`Cover for ${game.room_name ?? game.name}`}
                  >
                    {game.imagePath && <img src={game.imagePath} alt="" />}
                    <span className={s.coverCode}>CODE: {game.code}</span>
                    <button
                      type="button"
                      className={cn(s.copyCodeButton, copiedCode === game.id && s.copyCodeButtonCopied)}
                      aria-label={copiedCode === game.id ? 'Room code copied' : `Copy room code ${game.code}`}
                      title={copiedCode === game.id ? 'Copied' : 'Copy room code'}
                      onClick={(event) => copyRoomCode(event, game)}
                    >
                      <Icon name="copy" size={16} />
                      {copiedCode === game.id && <span className={s.copyTooltip} role="status">Copied!</span>}
                    </button>
                  </div>
                  <div className={s.roomDetails}>
                    <div className={s.roomTitleRow}>
                      <h2 title={game.room_name ?? game.name}>{game.room_name ?? game.name}</h2>
                      <span className={cn(s.roleBadge, game.role === 'master' ? s.masterBadge : s.playerBadge)}>
                        {game.role === 'master' ? 'DM' : 'Player'}
                      </span>
                    </div>
                    <div className={s.roomActions}>
                      <button type="button" className={s.actionButton} onClick={() => navigate(`/rooms/${game.public_id}`)}>
                        <Icon name="play" size={14} /> Start Game
                      </button>
                      {game.role === 'master' && (
                        <button
                          type="button"
                          className={s.actionButton}
                          data-bs-toggle="modal"
                          data-bs-target="#editGame"
                          onClick={() => setSelectedGame(game)}
                        >
                          <Icon name="squarePen" size={14} /> Edit
                        </button>
                      )}
                    </div>
                    <div className={s.roomMeta}>
                      <div className={s.players}>
                        <span className={s.playersLabel}>Players:</span>
                        <div className={s.avatarList} aria-label={`${game.members_profilepics?.length ?? 0} players`}>
                          {(game.members_profilepics ?? []).map((avatar, index) => (
                            <span className={s.avatar} key={`${avatar ?? 'player'}-${index}`} title={`Player ${index + 1}`}>
                              {avatar ? <img src={avatar} alt="" /> : <Icon name="user" size={14} />}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={s.system}>{game.game_system ?? 'D&D5e'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className={s.message}>
              {games.length && searchText.trim() ? 'No rooms match your search.' : "It looks like you don't have any rooms yet!"}
            </p>
          )}
      </section>
      <ModalGame type="2" dados={selectedGame} atualizaGames={updateGames} />
    </main>
  )
}

export default GamesPage
