import './Redirection.module.scss'
import className from 'classnames/bind'
import styles from './Redirection.module.scss'
import { useNavigate } from 'react-router-dom';
const cx = className.bind(styles)



const Redirection = ({
  text,
  route
}) => {
    const func = () => {
        const navigate = useNavigate()
        navigate(`/${route}`, {replace: true} )
    }
  return (
    <strong className={styles.p} onClick={func} style={{ cursor: 'pointer' }}>
        {text}
    </strong>
  )
}

export default Redirection