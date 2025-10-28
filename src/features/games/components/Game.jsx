import cn from "classnames/bind";
import s from "./Game.module.scss"
import { Icon } from "../../../shared/icones/Icon";
import { useMemo, useState } from "react";
import { ModalGame } from "./modais/modalGame";

const gradients = [
  "linear-gradient(45deg, #b83cceff 0%, #7687e6ff 50%, #3bd2d7ff 100%)",
  "linear-gradient(45deg, #38b4fe, #00c8ae, #c9ba5a)", 
  "linear-gradient(45deg, #2932b6ff, #1384caff, #9fedd8ff)",                                                                           
  "linear-gradient(45deg, #454ae1ff, #9641d7ff, #f247abff)",
  "linear-gradient(45deg, #df6840ff, #7010a8ff)"                                                                                                                     
]

function getRandomGradient() {
  const index = Math.floor(Math.random() * gradients.length)
  return gradients[index]
}

export const Game = ({game, atualizaGames}) => { 
  const [hover, setHover] = useState(false) // usar pra validar se o usuario tem acesso a edição depois
  const background = useMemo(() => getRandomGradient(), [])

  return (
    <div className={cn("col-12 col-md-6 col-xl-4 mb-3")} >
      <div className={cn(s.card, "shadow")}>
        <div className={cn(s.imgBox, s.emptyImage)} 
             style={{ background }}
             onMouseEnter={() => setHover(true)} 
             onMouseLeave={() => setHover(false)}
        >
          { (game.imagePath !== null) && 
            <img
              className={cn(s.cardImgTop)}
              src={game.imagePath}
              alt="Imagem do Jogo"
            />
          }
          <div className={cn(s.editIcon)}>
            <button className={cn(s.btnEdit)}
                    data-bs-toggle="modal" 
                    data-bs-target={'#editGame'}>
              <Icon name='squarePen' />
            </button>
            <ModalGame type='2' atualizaGames={atualizaGames}/>
          </div> 
        </div>
        <div className={cn(s.cardBody)}>
          <h6 className={cn("text-truncate fs-responsive")}>{game.name}</h6>
        </div>
      </div>
    </div>  
  )
}
