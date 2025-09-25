import { Game } from '../games/Game';
import './Home.scss'
import { useState } from 'react'

const Home = () => {

  const [sheet, setSheet] = useState({})

  return (
    <main className="container">
  <section className="row mt-3 gap-3">

    <Game className="col-8" />
    {/* <app-games className="col-8"></app-games> */}
    <section className="game-container shadow col-8">
      <header className="container">
        <div className="row header-container">
          <div className="col-4 container group-title-games">
            <div className="row">
              <h2 className="col-4">Your Games</h2>
            </div>
          </div>
          <input className="col-7 search" type="search" placeholder="Search for your games" />
        </div>
      </header>

      {/* <app-spinner *ngIf="loading"></app-spinner> */}
      
      <div className="row d-flex justify-content-center">
        <input  className="btn-more col-4" type="button" value="More" />
      </div>
    </section>
    <aside className="aside col">
      <div className="container">
        <div className="row d-flex justify-content-around btn-div">
          {/* <app-btn-games [backgroundColor]="'#7758D1'"
          ></app-btn-games> */}
        </div>
      </div>

      <section className="sheets-container">
        <nav className="container nav-sheets-container">
          <div className="nav nav-tabs row nav-tabs-sheets" id="nav-tab">
            <button className="col nav-link btn-tab active" data-bs-toggle="tab" data-bs-target="#nav-player" type="button">Player</button>
            <button className="col nav-link btn-tab" data-bs-toggle="tab" data-bs-target="#nav-game" type="button">Game Master</button>
          </div>
        </nav>

        <div className="d-flex justify-content-center">
          <div className="col-8 text-center div-text-sheets">Most Recent Sheets</div>
        </div>

        <div className="tab-content" id="nav-tabContent">
          {/* <app-spinner *ngIf="loading"></app-spinner> */}
          <div className="tab-pane active" id="nav-player">
            <div className="sheets-group list-group">
              <div className="sheets list-group-item mb-2 d-flex flex-row">
                <div className="box-sheet"></div>
                { sheet.sheet_name }
              </div>
            </div>
          </div>
          {/* <app-spinner *ngIf="loading"></app-spinner> */}
          <div className="tab-pane fade" id="nav-game">
            <div className="sheets-group list-group">
              <div className="sheets list-group-item mb-2"></div>
              <a className="sheets list-group-item">
                { sheet.sheet_name }
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* <app-sheets></app-sheets> */}
    </aside>
  </section>
</main>
  );
}

export default Home;
