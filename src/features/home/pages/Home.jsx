import { Game } from '../../games/components/Game';
import { useEffect, useState } from 'react'
import { getGamesView } from '../../../services/gamesService';
import classNames from 'classnames/bind';
import styles from './Home.module.scss'
import { BtnModalGame } from '../../games/components/buttons/BtnModalGame';
import { Icon } from '../../../shared/icones/Icon';
import { SheetsContainer } from '../../sheets/components/SheetsContainerHome';
import { ModalGame } from '../../games/components/modais/modalGame';

const cx = classNames.bind(styles)

const Home = () => {

  const [gamesList, setGamesList] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
      const games = await getGamesView()
      console.log(games)
      setGamesList(games)
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

        <section className={cx('game-container', 'shadow col-12 col-lg-8')}>
          <header className={cx('container', 'header-games')}>
            <div className={cx('container', 'group-title-games')}>
              <div className={cx('row')}>
                <h2 className={cx('col', 'ps-3')}>Your Games</h2>
              </div>
            </div>
            <div className={cx('col-7', 'search')}>
              <input 
              type='search' 
              placeholder='Search for your games' />
              <Icon name='search' />
            </div>
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
          <header className={cx('container')}>
            <div className={cx('row', 'd-flex', 'justify-content-around', 'btn-div', 'gap-3')}>
              <BtnModalGame label='New Game' icon='dices' type='1' />
              <BtnModalGame label='Join a Game' icon='swords' type='2' />
            </div>
          </header>

          <SheetsContainer />
          
        </aside>
      </section>
    </main>
  );
};

export default Home;