import './Header.scss';
import { NavLink } from 'react-router-dom';

function Header() {

  const expand = () => {
    let menu = document.getElementById("mb-nav");
    menu.classList.toggle("expanded");
  };

  const username = 'arthurd123'

  return (
    <header>
      <nav className="navbar-expand-lg bg-gray py-2 mb-height">
        <div className="container">
          <div className="row">
            <div className="col-2">
              <div className="logo-box">
                <img
                  src="Logotipo_Dice_Tales.png"
                  alt="Logo - Dado em chamas em um livro aberto"
                  style={{ height: "72px" }}
                />
                <img
                  src="logo_fonte.png"
                  alt="Logo - Dice Tales"
                  style={{ height: "45px" }}
                  className='logo-fonte'
                />
              </div>
            </div>
            <div className="col-8 menu-box">
              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 menu-items container">
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link animated-title menu-txt-decor 
                        ${isActive ? "active-item" : ""}`
                      }
                      aria-current="page"
                      to="/"
                    >
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link animated-title menu-txt-decor 
                        ${isActive ? "active-item" : ""}`
                      }
                      aria-current="page"
                      to="/teste"
                    >
                      Games
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link animated-title menu-txt-decor 
                        ${isActive ? "active-item" : ""}`
                      }
                      aria-current="page"
                      to="/sheets"
                    >
                      Sheets
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link animated-title menu-txt-decor 
                        ${isActive ? "active-item" : ""}`
                      }
                      aria-current="page"
                      to="/community"
                    >
                      Community
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-2 d-flex justify-content-center">
              <a className="navbar-brand menu-user-decor user-area" href="#">
                <img
                  src=""
                  id="main-icon"
                  alt=""
                  style={{ marginLeft: '10%' }}
                />
                {username}
              </a>
              <div className="mb-menu" onclick={expand}>
                <div className="menu-icon"></div>
                <div className="menu-icon"></div>
                <div className="menu-icon"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="expanded-menu" id="mb-nav">
        <div className="menu-mb-text bg-gray atual">Home</div>
        <div className="menu-mb-text bg-gray">Games</div>
        <div className="menu-mb-text bg-gray">Sheets</div>
        <div className="menu-mb-text bg-gray">Community</div>
      </div>
    </header>
  );
}

export default Header;
