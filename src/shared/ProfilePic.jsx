import { useEffect, useState } from "react"
import api from "../services/api"
import { Icon } from "./icones/Icon"

export const ProfilePic = ({justPic = false}) => {
  const username = 'arthurd123'

  const [component, setComponent] = useState()

  useEffect(() => {
    if(!justPic) {
      api
      .get('/profilePic')
      .then((response) => {
        if(response.data != null) {
          setComponent(
            <div className='user-box me-2'>
              <img className="me-2"
                src={response.data}
                alt='User Profile Picture'
              />
            </div> 
          )
        }else{
          setComponent(
            <div className='user-box me-2'>
              <Icon name='user' size='25' />
            </div> 
          )
        }
      })
      .catch(() => {
        setComponent(
          <div className='user-box me-2'>
            <Icon name='user' size='25' />
          </div> 
        )
      })
    }else{
      setComponent(
        <div className='user-box me-2'>
          <Icon name='user' size='25' />
        </div> 
      )
    }
  }, [])

  return (
    <>
      { justPic ? component : 
      <a className="navbar-brand menu-user-decor user-area" href="#">
        {component}
        {username}
        <Icon name='chevronDown' />
      </a> }
    </>
  )
}