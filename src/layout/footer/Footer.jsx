import "./Footer.scss";
import { Icon } from "../../shared/icones/Icon";

const Footer = () => {
  return (
    <footer className="footer-layout">
      <div className="container mt-auto container-footer">
        <section className="container-footer-top">
          <div className="div-txt-logo">
            <img src="logo_fonte.png" alt="Logo Dice Tales" className="logo-texto" />
          </div>
          <div className="texts-area row">
            <div className="col-12 col-md-4 description mb-3 mt-4 mt-md-0 mb-md-0">
              <p className="text-light-purple text-center text-md-start mb-0 mb-md-2">About Us</p>
              <span className="text-white">
                Dice Tales was built by a small team to make life easier for RPG
                players. If you'd like to help or add a new system, feel free to
                reach out!
              </span>
            </div>

            <div className="col-12 col-md-3 mb-3 mb-md-0">
              <p className="text-ti-purple text-center text-md-start mb-0 mb-md-2">Contact Us</p>
              <div className="ft-box gap-1">
                <address className="ft-sp-text text-center text-md-start">
                  <Icon name='mail' className='me-1' /> 
                  dicetales&#64;gmail.com
                </address>
                <address className="ft-sp-text text-center text-md-start">
                  <Icon name='phone' className='me-1' /> 
                  +55 (42) 9 6969-6969
                </address>
              </div>
            </div>

            <div className="col-12 col-md-5 mb-3 mb-md-0">
              <p className="text-ti-purple text-center text-md-start mb-2 mb-md-2">Share your thoughts with us!</p>
              <div className="input-group" style={{ maxWidth: '100%' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your feedback here"
                />
                <button className="button" type="button">
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="purple-line d-none d-md-block"></div>
        <section className="icons-area">
          <div className="imgs">
            <Icon name='instagram' size='25' />
            <Icon name='x' size='25' />
            <Icon name='github' size='25' />
          </div>
        </section>
        <span className="text-ti-purple center-sp">FOLLOW US</span>
      </div>
    </footer>
  );
}

export default Footer