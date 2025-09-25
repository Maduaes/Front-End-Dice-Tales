import "./Footer.scss";
import facebook from "../assets/icons/social-media/facebook.png";
import instagram from "../assets/icons/social-media/instagram.png";
import twitter from "../assets/icons/social-media/twitter.png";
import github from "../assets/icons/social-media/github.png";

const Footer = () => {
  return (
    <footer>
      <div className="container mt-auto container-footer">
        <section className="container-footer-top">
          <div className="div-txt-logo">
            <img src="logo_fonte.png" alt="" className="logo-texto" />
          </div>
          <div className="texts-area row">
            <div className="col-4 description">
              <p className="text-light-purple">About Us</p>
              <span className="text-white">
                Dice Tales was built by a small team to make life easier for RPG
                players. If you'd like to help or add a new system, feel free to
                reach out!
              </span>
            </div>
            <div className="col mb-continue">
              <p className="text-ti-purple">Contact Us</p>
              <div className="ft-box gap-1">
                <address className="ft-sp-text">-- dicetales&#64;gmail.com</address>
                <address className="ft-sp-text">-- +55 (42) 9 6969-6969</address>
              </div>
            </div>
            <div className="col-5 mb-continue">
              <p className="text-ti-purple">Share your thoughts with us!</p>
              <div className="input-group" style={{ maxWidth: "100%" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your feedback here"
                />
                <button className="" type="button">
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="purple-line"></div>
        <section className="icons-area">
          <div className="imgs">
            <img src={facebook} alt="Ícone do Facebook" />
            <img src={instagram} alt="Ícone do Instagram" />
            <img src={twitter} alt="Ícone do Twitter" />
            <img src={github} alt="Ícone do Github" />
          </div>
        </section>
        <span className="text-ti-purple center-sp">FOLLOW US</span>
      </div>
    </footer>
  );
}

export default Footer;
