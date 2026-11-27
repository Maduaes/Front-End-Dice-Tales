import { useEffect, useMemo, useState } from 'react'
import { createSheet, getAllSheets } from '../../../services/sheetsService'
import s from './RoomSheetsPanel.module.scss'

const RoomSheetsPanel = ({ room }) => {
  const [tab, setTab] = useState('owned')
  const [query, setQuery] = useState('')
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const loadSheets = async () => {
    if (!room?.id) return
    setLoading(true)
    try {
      setSheets(await getAllSheets())
      setError('')
    } catch {
      setError('Could not load sheets for this room.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSheets() }, [room?.id])

  const visibleSheets = useMemo(() => sheets.filter((sheet) => (
    Number(sheet.room?.id) === Number(room?.id)
      && (tab === 'owned' ? sheet.owner : !sheet.owner)
      && (sheet.name ?? '').toLowerCase().includes(query.toLowerCase())
  )), [sheets, room?.id, tab, query])

  const addSheet = async () => {
    if (!room?.id || creating) return
    setCreating(true)
    setError('')
    try {
      const created = await createSheet({
        name: 'New Character',
        sheet_type: 'player',
        game_system: room.game_system,
        room_id: room.id,
      })
      setSheets((current) => [...current, { ...created, owner: true, room: { id: room.id } }])
    } catch (creationError) {
      setError(creationError?.detail ?? 'Could not create the sheet.')
    } finally {
      setCreating(false)
    }
  }

  return <div className={s.panel}>
    <label className={s.search}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
      <input type="search" placeholder="Search by name..." aria-label="Search sheets by name" value={query} onChange={(event) => setQuery(event.target.value)} />
    </label>
    <div className={s.tabs} role="tablist" aria-label="Sheet ownership">
      <button type="button" role="tab" aria-selected={tab === 'owned'} onClick={() => setTab('owned')}>My Sheets</button>
      <button type="button" role="tab" aria-selected={tab === 'shared'} onClick={() => setTab('shared')}>Shared With Me</button>
    </div>
    <section className={s.listSection}>
      <header className={s.listHeading}><h3>Characters</h3>{tab === 'owned' && <button type="button" onClick={addSheet} disabled={creating}>＋ <span>{creating ? 'Creating...' : 'New Sheet'}</span></button>}</header>
      {error && <p className={s.message} role="alert">{error}</p>}
      {loading ? <p className={s.message}>Loading sheets...</p> : visibleSheets.length ? <ul className={s.list}>
        {visibleSheets.map((sheet) => <li key={sheet.id} className={s.card}>
          <div className={s.art}>{sheet.asset_image_url && <img src={sheet.asset_image_url} alt="" />}</div>
          <span className={s.name} title={sheet.name}>{sheet.name}</span>
        </li>)}
      </ul> : <p className={s.message}>{tab === 'owned' ? 'No sheets in this room yet.' : 'No sheets have been shared with you in this room.'}</p>}
    </section>
  </div>
}

export default RoomSheetsPanel
