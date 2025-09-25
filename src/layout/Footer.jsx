import "./Footer.scss";
import facebook from "../assets/icons/social-media/facebook.png";
import instagram from "../assets/icons/social-media/instagram.png";
import twitter from "../assets/icons/social-media/twitter.png";
import github from "../assets/icons/social-media/github.png";

const Footer = () => {
  return (
    <footer>
      <div class="container mt-auto container-footer">
        <section class="container-footer-top">
          <div class="div-txt-logo">
            <img src="logo_fonte.png" alt="" className="logo-texto" />
          </div>
          <div class="texts-area row">
            <div class="col-4 description">
              <p class="text-light-purple">About Us</p>
              <span class="text-white">
                Dice Tales was built by a small team to make life easier for RPG
                players. If you'd like to help or add a new system, feel free to
                reach out!
              </span>
            </div>
            <div class="col mb-continue">
              <p class="text-ti-purple">Contact Us</p>
              <div class="ft-box gap-1">
                <address class="ft-sp-text">-- dicetales&#64;gmail.com</address>
                <address class="ft-sp-text">-- +55 (42) 9 6969-6969</address>
              </div>
            </div>
            <div class="col-5 mb-continue">
              <p class="text-ti-purple">Share your thoughts with us!</p>
              <div class="input-group" style={{ maxWidth: "100%" }}>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Your feedback here"
                />
                <button class="" type="button">
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
        <div class="purple-line"></div>
        <section class="icons-area">
          <div class="imgs">
            <img src={facebook} alt="Ícone do Facebook" />
            <img src={instagram} alt="Ícone do Instagram" />
            <img src={twitter} alt="Ícone do Twitter" />
            <img src={github} alt="Ícone do Github" />
          </div>
        </section>
        <span class="text-ti-purple center-sp">FOLLOW US</span>
      </div>
    </footer>
  );
}

export default Footer;
