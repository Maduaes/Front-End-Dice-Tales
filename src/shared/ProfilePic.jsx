import { useEffect, useState } from "react"
import classNames from "classnames/bind"
import api from "../services/api"
import { Icon } from "./icones/Icon"
import styles from './ProfilePic.module.scss'

const cx = classNames.bind(styles)

export const ProfilePic = ({justIcon = false}) => {
  const username = 'arthurd123'

  const [profilePic, setProfilePic] = useState()

  useEffect(() => {
    if(!justIcon) {
      api
      .get('/profilePic')
      .then((response) => { setProfilePic(response.data) })
      .catch(() => { setProfilePic(null) })
    }
  }, [justIcon])

  const getComponent = () => {
    return (
      <div className={cx('user-box', 'me-2')}>
         { profilePic ? (
          <img src={ profilePic } alt='User Profile Picture' />
        ) : (
          <Icon name='user' size='25' />
        )}
      </div>
    )
  }

  return (
    <>
      { justIcon ? getComponent() : 
      <a className={cx("navbar-brand", "menu-user-decor", "user-area")} href="#">
        { getComponent() }
        { username }
        <Icon name='chevronDown' />
      </a> }
    </>
  )
}