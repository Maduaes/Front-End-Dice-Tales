import styles from './ModalGame.module.scss'
import classNames from 'classnames/bind'
import Input from "@/shared/forms/Input"

const cx = classNames.bind(styles)

export const ModalGame = ({id}) => {
  const getBody = () => {
    if(id == 'newGame') {
      return (
        <div className="modal-body">
          <Input label='Game Title' placeholder='Something awesome...' />
        </div>
      )
    }else {
      return (
        <div className="modal-body">
        </div>
      )
    }
  }

  return (
    <div className="modal fade" id={id} tabindex="-1" aria-labelledby={id + 'Label'} 
      aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className={cx("modal-content", "modalGame")}>
          <div className="modal-header">
            <h1 className="modal-title fs-5" id={id + 'Label'}>
              { (id == 'newGame') ? 'Create a New Game' : 'Join a Game' }
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" 
              aria-label="Close"></button>
          </div>
          { getBody() }
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}