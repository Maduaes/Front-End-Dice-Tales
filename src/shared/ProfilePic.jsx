import { useEffect, useState } from "react"
import classNames from "classnames/bind"
import { Icon } from "./icones/Icon"
import styles from './ProfilePic.module.scss'
import { getProfilePic, getUser } from "../services/usersService"

const cx = classNames.bind(styles)

export const ProfilePic = ({ justIcon = false, size = '40px' }) => {
  const [username, setUsername] = useState('')
  const [profilePic, setProfilePic] = useState({ name: '', path: null })

  useEffect(() => {
    const fetchData = async () => {
      if(!justIcon) {
        const user = await getUser()
        const profile = await getProfilePic()
        setUsername(user.username)
        setProfilePic({ 
          name: profile.profilePicName,
          path: '/api' + profile.profilePicPath
        })
      }
    }
    fetchData()
  }, [justIcon])

  const getComponent = () => {
    return (
      <div className={cx('user-box', 'me-2')} 
      style={{height: size, width: size, minHeight: size, minWidth: size }}>
         { !justIcon ? (
          <img className={cx("img")} src={ profilePic.path } alt={ profilePic.name } />
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