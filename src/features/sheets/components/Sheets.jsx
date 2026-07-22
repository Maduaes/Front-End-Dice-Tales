import styles from './Sheets.module.scss'
import classNames from 'classnames/bind';

const cx = classNames.bind(styles)

export const Sheets = ({sheet, userType}) => {
  if(userType == 'player')
    console.log(userType) // não sei ainda
  if(userType == 'gameMaster')
    console.log(userType)

  return (
    <div className={cx('sheets-group', 'list-group')}>
      <a className={cx('sheets', 'mb-2')}>
        <div className={cx('sheetAsset')}>
          <img src={sheet.asset_image_url} alt="" />
        </div>
        <div className={cx('sheetName')}>
          {sheet.name}
        </div>
        <div className={cx('sheetSystem')}>
          {sheet.game_system}
        </div>
      </a>
    </div>
  )
}