import { Game } from '../games/Game';
import { useEffect, useState } from 'react'
import { getGamesView } from '../../services/gamesService';
import classNames from 'classnames/bind';
import styles from './Home.module.scss'
import { getRecentSheets } from '../../services/sheetsService';
import { Sheets } from '../sheets/Sheets';

const cx = classNames.bind(styles)

const Home = () => {

  const [sheetsList, setSheetsList] = useState([])
  const [gamesList, setGamesList] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
      const games = await getGamesView()
      const sheets = await getRecentSheets()
      setGamesList(games)
      setSheetsList(sheets)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  const hasItems = (list) => list && list.length > 0

  return (
    <main className='container main'>
      <section className={cx('section-row', 'row', 'mt-3', 'gap-2')}>

        <section className={cx('game-container', 'shadow', 'col-8', 'container')}>
          <header className={cx('container', 'header-games', 'row')}>
            <div className={cx('col-4', 'container', 'group-title-games')}>
              <div className={cx('row')}>
                <h2 className={cx('col-4')}>Your Games</h2>
              </div>
            </div>
            <input className={cx('col-7', 'search')} 
              type='search' 
              placeholder='Search for your games' />
          </header>

          <main className={cx('container', 'pb-3')}>
            { hasItems(gamesList) ? (
              <div className='row ps-3 pe-3'>
                { gamesList.map((game) => ( <Game key={game.id} game={game} /> )) }
              </div>
            ) : (
              <div className='p-4 container'>
                <p>It looks like you don't have any games yet!</p>
                <div></div>
              </div>
            )} 
          </main>

          { gamesList.length > 9 && (
            <footer className={cx('row', 'd-flex', 'justify-content-center')}>
              <input className={cx('btn-more', 'col-4')} type='button' value='More' />
            </footer>
          )}
        </section>

        <aside className={cx('aside', 'col')}>
          <div className={cx('container')}>
            <div className={cx('row', 'd-flex', 'justify-content-around', 'btn-div')}>
              {/* Botões do aside */}
            </div>
          </div>

          <section className={cx('sheets-container')}>
            <nav className={cx('container', 'nav-sheets-container')}>
              <div className='nav nav-tabs row nav-tabs-sheets' id='nav-tab'>
                <button className='col nav-link btn-tab active' data-bs-toggle='tab' data-bs-target='#nav-player' type='button'>Player</button>
                <button className='col nav-link btn-tab' data-bs-toggle='tab' data-bs-target='#nav-game' type='button'>Game Master</button>
              </div>
            </nav>

            <div className={cx('d-flex', 'justify-content-center')}>
              <div className={cx('col-8', 'text-center', 'div-text-sheets')}>Most Recent Sheets</div>
            </div>

            <div className='tab-content' id='nav-tabContent'>
              <div className='tab-pane active' id='nav-player'>
                {sheetsList.map((sheet) => (
                  <Sheets key={sheet.id} sheet={sheet} userType='player' />
                ))}
              </div>
              <div className='tab-pane fade' id='nav-game'>
                {sheetsList.map((sheet) => (
                  <Sheets key={sheet.id} sheet={sheet} userType='gameMaster' />
                ))}
              </div>
            </div>

          </section>
        </aside>
      </section>
    </main>
  );
};

export default Home;