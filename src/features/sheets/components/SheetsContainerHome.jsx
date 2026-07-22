import { useEffect, useState } from 'react';
import styles from './Sheets.module.scss'
import classNames from 'classnames/bind';
import { getRecentSheets } from '../../../services/sheetsService';
import { Sheets } from './Sheets';

const cx = classNames.bind(styles)

export const SheetsContainer = () => {
  const [sheetsList, setSheetsList] = useState([])
  const [sheetsListShared, setSheetsListShared] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheets = await getRecentSheets()
        setSheetsList(Array.isArray(sheets.owned) ? sheets.owned : [])
        setSheetsListShared(Array.isArray(sheets.shared) ? sheets.shared : [])
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
          <button className='col nav-link btn-tab active'
            data-bs-toggle='tab' data-bs-target='#nav-player' type='button'>
              Owner
          </button>
          <button className='col nav-link btn-tab'
            data-bs-toggle='tab' data-bs-target='#nav-game' type='button'>
              Shared To Me
          </button>
        </div>
      </nav>

      <div className={cx('d-flex', 'justify-content-center')}>
        <div className={cx('col-8', 'text-center', 'div-text-sheets')}>
          Most Recent Sheets
        </div>
      </div>

      {sheetsList.length === 0 ? (
        <div className='p-3 text-center'>
          It looks like you don't have any sheets yet.
        </div>
      ) : (
        <main className='tab-content' id='nav-tabContent'>
          <div className='tab-pane active' id='nav-player'>
            <div className="sheets-group list-group" >
              {sheetsList.map((sheet) => (
                <Sheets key={sheet.id} sheet={sheet} userType='player' />
              ))}
            </div>
          </div>
          <div className='tab-pane fade' id='nav-game'>
            <div className="sheets-group list-group" >
              {sheetsListShared.length === 0 ? (
                <div className='p-3 text-center'>
                  It looks like you don't have any shared sheets yet.
                </div>
              ) : sheetsListShared.map((sheet) => (
                <Sheets key={sheet.id} sheet={sheet} userType='gameMaster' />
              ))}
            </div>
          </div>
        </main>
      )}
    </section>
  )
}
