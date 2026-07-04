import { useEffect, useMemo, useState } from "react"
import cn from "classnames/bind"
import { AiSheetModal } from "../components/AiSheetModal"
import { Icon } from "../../../shared/icones/Icon"
import { getAllSheets } from "../../../services/sheetsService"
import defaultCharacterArt from "../../../assets/default_character_art.webp"
import s from "./SheetsPage.module.scss"

const cx = cn.bind(s)

const normalizeSystemName = (system) => system || "Unknown System"
const getRoomName = (sheet) => sheet.room?.room_name ?? "No room"
const avatarColors = ["blue", "purple", "gold"]

const SheetsPage = () => {
  const [sheets, setSheets] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("All rooms")
  const [selectedSystem, setSelectedSystem] = useState("All systems")
  const [showOwner, setShowOwner] = useState(true)
  const [showViewer, setShowViewer] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setIsLoading(true)
        setErrorMessage("")
        const response = await getAllSheets()
        setSheets(response)
      } catch (error) {
        setErrorMessage("It was not possible to load your sheets right now.")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSheets()
  }, [])

  const gameSystems = useMemo(() => {
    const systems = sheets
      .map((sheet) => normalizeSystemName(sheet.game_system))
      .filter(Boolean)

    return ["All systems", ...new Set(systems)]
  }, [sheets])

  const rooms = useMemo(() => {
    const roomNames = sheets.map(getRoomName).filter(Boolean)

    return ["All rooms", ...new Set(roomNames)]
  }, [sheets])

  const filteredSheets = useMemo(() => {
    return sheets.filter((sheet) => {
      const sheetName = sheet.name ?? ""
      const sheetSystem = normalizeSystemName(sheet.game_system)
      const roomName = getRoomName(sheet)
      const matchesSearch = sheetName
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
      const matchesOwner = showOwner && sheet.owner
      const matchesViewer = showViewer && !sheet.owner
      const matchesSystem =
        selectedSystem === "All systems" || sheetSystem === selectedSystem
      const matchesRoom =
        selectedRoom === "All rooms" || roomName === selectedRoom

      return (
        matchesSearch
        && (matchesOwner || matchesViewer)
        && matchesSystem
        && matchesRoom
      )
    })
  }, [sheets, searchTerm, selectedRoom, selectedSystem, showOwner, showViewer])

  return (
    <main className={cx("container", s.sheetsPage)}>
      <section className={cx("shadow", s.panel)}>
        <header className={cx(s.panelHeader)}>
          <div className={cx(s.titleRibbon)}>
            <span className={cx(s.ribbonExtension)}></span>
            <h1>Your Sheets</h1>
          </div>

          <label className={cx(s.searchBox)} aria-label="Search sheets">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search sheet by name"
            />
            <Icon name="search" size={27} color="#61D9BA" />
          </label>
        </header>

        <section className={cx(s.controlsRow)}>
          <div className={cx(s.actionsGroup)}>
            <button
              type="button"
              className={cx(s.createButton)}
            >
              <span className={cx(s.plusIcon)}>+</span>
              Create New Sheet
            </button>

            <button
              type="button"
              className={cx(s.createButton)}
              data-bs-toggle="modal"
              data-bs-target="#createAiSheetModal"
            >
              {/* <span className={cx(s.plusIcon)}>+</span> */}
              Create Character With AI
            </button>
          </div>

          <div className={cx(s.filters)}>
            <label className={cx(s.checkFilter)}>
              <input
                type="checkbox"
                checked={showOwner}
                onChange={(event) => setShowOwner(event.target.checked)}
              />
              <span>Owner</span>
            </label>

            <div className={cx(s.selectWrap)}>
              <select
                value={selectedRoom}
                onChange={(event) => setSelectedRoom(event.target.value)}
                aria-label="Select room"
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <label className={cx(s.checkFilter)}>
              <input
                type="checkbox"
                checked={showViewer}
                onChange={(event) => setShowViewer(event.target.checked)}
              />
              <span>Shared</span>
            </label>

            <div className={cx(s.selectWrap)}>
              <select
                value={selectedSystem}
                onChange={(event) => setSelectedSystem(event.target.value)}
                aria-label="Select RPG system"
              >
                {gameSystems.map((system) => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {isLoading ? (
          <p className={cx(s.stateMessage)}>Loading your sheets...</p>
        ) : errorMessage ? (
          <p className={cx(s.stateMessage)}>{errorMessage}</p>
        ) : filteredSheets.length === 0 ? (
          <p className={cx(s.stateMessage)}>No sheets match these filters.</p>
        ) : (
          <section className={cx(s.cardsGrid)}>
            {filteredSheets.map((sheet) => (
              <article key={sheet.id} className={cx(s.sheetCard)}>
                <div className={cx(s.assetBox)}>
                  {sheet.asset_image_url ? (
                    <img src={sheet.asset_image_url} alt="" />
                  ) : (
                    <img src={defaultCharacterArt} alt="" />
                  )}
                </div>

                <div className={cx(s.cardInfo)}>
                  <div className={cx(s.cardTopline)}>
                    <h2>{sheet.name}</h2>
                    <span className={cx(s.rolePill)}>
                      {sheet.owner ? "Owner" : "Shared"}
                    </span>
                  </div>

                  <div className={cx(s.roomPill)}>
                    <span className={cx(s.playIcon)}></span>
                    {getRoomName(sheet)}
                  </div>

                  <div className={cx(s.cardFooter)}>
                    <div>
                      <span className={cx(s.allowedLabel)}>Allowed Players:</span>
                      <div className={cx(s.playersRow)}>
                        {(sheet.user_profilepics ?? []).map((profilepic, index) => {
                          const fallbackColor = avatarColors[index % avatarColors.length]

                          return (
                            <span
                              key={`${sheet.id}-player-${index}`}
                              className={cx(s.playerAvatar, s[fallbackColor])}
                            >
                              {profilepic ? (
                                <img src={profilepic} alt="" />
                              ) : (
                                <Icon name="user" size={16} color="white" />
                              )}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <span className={cx(s.systemName)}>
                      {normalizeSystemName(sheet.game_system)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      <AiSheetModal />
    </main>
  )
}

export default SheetsPage
