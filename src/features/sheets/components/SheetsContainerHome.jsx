import { useEffect, useState } from 'react';
import styles from './Sheets.module.scss'
import classNames from 'classnames/bind';
import { getRecentSheets } from '../../../services/sheetsService';
import { Sheets } from './Sheets';

const cx = classNames.bind(styles)

export const SheetsContainer = () => {
  const [sheetsList, setSheetsList] = useState([]) 

  useEffect(() => {
    const fetchData = async () => {
      try {
      const sheets = await getRecentSheets()
      setSheetsList(sheets)
      } catch (error) {
        console.error(error)
      }
    }  
    fetchData()
  }, [])

  return (
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
  )
}