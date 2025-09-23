import './Home.scss'
import gameImage from '../../assets/icons/social-media/instagram.png'

function Home() {
  const game = {
    game_image: gameImage,
    game_title: 'Herança de Trevas'
  }

  const sheet = {
    sheet_name: 'Leblanc'
  }

  return (
    <main class="container">
  <section class="row mt-3 gap-3">
    {/* <app-games class="col-8"></app-games> */}
    <section class="game-container shadow col-8">
      <header class="container">
        <div class="row header-container">
          <div class="col-4 container group-title-games">
            <div class="row">
              <h2 class="col-4">Your Games</h2>
            </div>
          </div>
          <input class="col-7 search" type="search" placeholder="Search for your games" />
        </div>
      </header>

      {/* <app-spinner *ngIf="loading"></app-spinner> */}
      <div class="container card-main">
        <div class="row">
          <div class="col-4 mb-3">
            <div class="card card-game shadow">
              <div class="img-box empty-image">
                <img class="card-img-top"
                src={game.game_image} aria-label="Imagem do Jogo" />
              </div>
              <div class="card-body">
                <h6 class="card-title">{game.game_title}</h6>
              </div>
            </div>
          </div>
          {/* <div class="p-4 container">
            <p>It looks like you don't have any games yet!</p>
             <div><app-btn-games [backgroundColor]="'white'" [disabledIcon]="true"
            ></app-btn-games></div>
          </div> */}
        </div>
      </div>
      <div class="row d-flex justify-content-center">
        <input  class="btn-more col-4" type="button" value="More" />
      </div>
    </section>
    <aside class="aside col">
      <div class="container">
        <div class="row d-flex justify-content-around btn-div">
          {/* <app-btn-games [backgroundColor]="'#7758D1'"
          ></app-btn-games> */}
        </div>
      </div>

      <section class="sheets-container">
        <nav class="container nav-sheets-container">
          <div class="nav nav-tabs row nav-tabs-sheets" id="nav-tab">
            <button class="col nav-link btn-tab active" data-bs-toggle="tab" data-bs-target="#nav-player" type="button">Player</button>
            <button class="col nav-link btn-tab" data-bs-toggle="tab" data-bs-target="#nav-game" type="button">Game Master</button>
          </div>
        </nav>

        <div class="d-flex justify-content-center">
          <div class="col-8 text-center div-text-sheets">Most Recent Sheets</div>
        </div>

        <div class="tab-content" id="nav-tabContent">
          {/* <app-spinner *ngIf="loading"></app-spinner> */}
          <div class="tab-pane active" id="nav-player">
            <div class="sheets-group list-group">
              <div class="sheets list-group-item mb-2 d-flex flex-row">
                <div class="box-sheet"></div>
                { sheet.sheet_name }
              </div>
            </div>
          </div>
          {/* <app-spinner *ngIf="loading"></app-spinner> */}
          <div class="tab-pane fade" id="nav-game">
            <div class="sheets-group list-group">
              <div class="sheets list-group-item mb-2"></div>
              <a class="sheets list-group-item">
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
