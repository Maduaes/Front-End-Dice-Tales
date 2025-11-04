import { useEffect, useState } from "react"
import cn from "classnames/bind"
import { Icon } from "./icones/Icon"
import s from './ProfilePic.module.scss'
import { getProfilePic, getUser } from "../services/usersService"


export const ProfilePic = ({ justIcon = false, size = '40px' }) => {
  const [dataUser, setDataUser] = useState({
    username: '',
    profilePic: {
      name: '',
      path: null
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if(!justIcon) {
        const user = await getUser()
        const profile = await getProfilePic()
        setDataUser({
          username: user.username,
          profilePic: profile ? { 
            name: profile.profilePicName,
            path: profile.profilePicPath ? '/api' + profile.profilePicPath : null
          } : { name: '', path: null } 
        })
      }
    }
    fetchData()
  }, [justIcon])

  const getComponent = () => {
    return (
      <div className={cn(s.userBox, 'me-2')} 
      style={{height: size, width: size, minHeight: size, minWidth: size }}>
         { (!justIcon && dataUser.profilePic.path !== null) ? (
          <img className={cn(s.img)} src={ dataUser.profilePic.path } alt={ dataUser.profilePic.name } />
        ) : (
          <Icon name='user' size='25' />
        )}
      </div>
    )
  }

  return (
    <>
      { justIcon ? getComponent() : 
      <a className={cn("navbar-brand", "menu-user-decor", s.userArea)} href="#">
        { getComponent() }
        { dataUser.username }
        <Icon name='chevronDown' />
      </a> }
    </>
  )
}