import { useEffect } from 'react';
import styles from './Sheets.module.scss'
import classNames from 'classnames/bind';

const cx = classNames.bind(styles)

export const Sheets = ({sheet, userType}) => {
  const name_game_sheets = 'Sei lá'

  return (
    <div className={cx('sheets-group', 'list-group')}>
      <div className={cx('sheets', 'list-group-item', 'd-flex flex-row')}>
        <div className={cx('img-box', 'me-3')}>
          <img src="" alt="" />
        </div>
        <div className={cx('text-box')}>
          <h6>
            {sheet.name_sheet}
          </h6>
          <p>
            {name_game_sheets}
          </p>
        </div>
      </div>
    </div>
  )
}