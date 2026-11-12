import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames/bind'
import { useParams } from 'react-router-dom'
import { getGameById } from '../../../services/gamesService'
import { getUser } from '../../../services/usersService'
import { getRoomAssets, getRoomTabletop, uploadRoomAsset } from '../../../services/roomAssetsService'
import { Icon } from '../../../shared/icones/Icon'
import diceD4 from '../../../assets/dice-d4.png'
import diceD6 from '../../../assets/dice-d6.png'
import diceD8 from '../../../assets/dice-d8.png'
import diceD10 from '../../../assets/dice-d10.png'
import diceD12 from '../../../assets/dice-d12.png'
import diceD20 from '../../../assets/dice-d20.png'
import diceD20Chat from '../../../assets/dice-d20-chat.png'
import diceD100 from '../../../assets/dice-d100.png'
import s from './RoomPage.module.scss'

const cx = cn.bind(s)

const zoomStep = 10
const minZoom = 1
const maxZoom = 200
const chatMinWidth = 240
const chatMinHeight = 300
const chatMenuSafeArea = 20
const diceMenuWidth = 520
const diceMenuHeight = 230
const diceMenuSafeArea = 12
const gridCellSize = 70
const defaultTokenSize = 70
const diceOptions = [
  { sides: 4, label: 'D4', image: diceD4 },
  { sides: 6, label: 'D6', image: diceD6 },
  { sides: 8, label: 'D8', image: diceD8 },
  { sides: 10, label: 'D10', image: diceD10 },
  { sides: 12, label: 'D12', image: diceD12 },
  { sides: 20, label: 'D20', image: diceD20 },
  { sides: 100, label: 'D100', image: diceD100 },
]
const tabletopLayers = [
  { value: 'players', label: 'Visible for Players' },
  { value: 'map', label: 'Map' },
  { value: 'master', label: 'Only Master' },
]
const mapScaleUnits = [
  { label: 'Meters', value: 'meters' },
  { label: 'Feet', value: 'feet' },
  { label: 'Kilometers', value: 'kilometers' },
  { label: 'Miles', value: 'miles' },
]
const getLayerAssets = (assets, layer) => assets
  .filter((asset) => asset.layer === layer)
  .sort((first, second) => (Number(first.layer_order) - Number(second.layer_order)) || (Number(first.id) - Number(second.id)))
const tabletopAssetFields = (asset) => ({
  id: asset.id,
  layer: asset.layer,
  layer_order: Number(asset.layer_order) || 0,
  position_x: asset.position_x,
  position_y: asset.position_y,
  width: asset.width,
  height: asset.height,
  visible: asset.visible,
})
const clearTabletopFields = (asset) => ({
  ...asset,
  layer: null,
  layer_order: 0,
  position_x: null,
  position_y: null,
  width: null,
  height: null,
  visible: null,
})
const drawingPath = (points, padding = 0) => points.map((point, index) => `${index ? 'L' : 'M'} ${Number(point.x) + padding} ${Number(point.y) + padding}`).join(' ')

const buildWebSocketUrl = (roomCode) => {
  const apiUrl = import.meta.env.VITE_API_URL

  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    const url = new URL(apiUrl)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.pathname = `/ws/tabletop/${roomCode}`
    url.search = ''
    return url.toString()
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/tabletop/${roomCode}`
}

const icons = {
  chat: (
    <svg width="25" height="25" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.2083 16.0417H24.7917M10.2083 21.875H18.9583M10.2083 10.2083H21.875M32.0833 24.7917C32.0833 25.5652 31.776 26.3071 31.2291 26.8541C30.6821 27.401 29.9402 27.7083 29.1667 27.7083H9.9575C9.18401 27.7085 8.44227 28.0159 7.89541 28.5629L4.68416 31.7742C4.53936 31.9189 4.35488 32.0175 4.15404 32.0575C3.95321 32.0974 3.74504 32.0769 3.55586 31.9986C3.36668 31.9202 3.20498 31.7875 3.09121 31.6173C2.97743 31.447 2.91669 31.2468 2.91666 31.0421V7.29167C2.91666 6.51812 3.22395 5.77625 3.77094 5.22927C4.31792 4.68229 5.05978 4.375 5.83333 4.375H29.1667C29.9402 4.375 30.6821 4.68229 31.2291 5.22927C31.776 5.77625 32.0833 6.51812 32.0833 7.29167V24.7917Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  cursor: (
    <svg width="27" height="27" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.9767 20.9766L31.6667 31.6666M6.14666 5.06159C5.99489 4.99764 5.8275 4.98037 5.66587 5.01201C5.50424 5.04364 5.35571 5.12274 5.23926 5.2392C5.1228 5.35565 5.0437 5.50418 5.01207 5.66581C4.98043 5.82744 4.9977 5.99483 5.06166 6.1466L15.895 32.8116C15.9617 32.9729 16.0772 33.1093 16.2254 33.2015C16.3736 33.2938 16.547 33.3372 16.7212 33.3258C16.8954 33.3144 17.0616 33.2487 17.1965 33.1379C17.3314 33.0272 17.4282 32.8769 17.4733 32.7083L20.0883 22.5699C20.2275 21.978 20.5259 21.4354 20.9513 21.001C21.3767 20.5665 21.9128 20.2566 22.5017 20.1049L32.7083 17.4733C32.8778 17.4293 33.0291 17.333 33.1408 17.1981C33.2524 17.0633 33.3188 16.8967 33.3304 16.722C33.342 16.5473 33.2983 16.3734 33.2055 16.2249C33.1127 16.0764 32.9755 15.961 32.8133 15.8949L6.14666 5.06159Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  hand: (
    <svg width="27" height="27" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 18.3332V9.99992C30 9.11586 29.6488 8.26802 29.0237 7.6429C28.3986 7.01777 27.5508 6.66658 26.6667 6.66658C25.7826 6.66658 24.9348 7.01777 24.3097 7.6429C23.6846 8.26802 23.3334 9.11586 23.3334 9.99992M23.3334 16.6666V6.66658C23.3334 5.78253 22.9822 4.93468 22.3571 4.30956C21.7319 3.68444 20.8841 3.33325 20 3.33325C19.116 3.33325 18.2681 3.68444 17.643 4.30956C17.0179 4.93468 16.6667 5.78253 16.6667 6.66658V9.99992M16.6667 9.99992V17.4999M16.6667 9.99992C16.6667 9.11586 16.3155 8.26802 15.6904 7.6429C15.0653 7.01777 14.2174 6.66658 13.3334 6.66658C12.4493 6.66658 11.6015 7.01777 10.9763 7.6429C10.3512 8.26802 10 9.11586 10 9.99992V23.3332M30 13.3333C30 12.4492 30.3512 11.6013 30.9763 10.9762C31.6015 10.3511 32.4493 9.99992 33.3334 9.99992C34.2174 9.99992 35.0653 10.3511 35.6904 10.9762C36.3155 11.6013 36.6667 12.4492 36.6667 13.3333V23.3332C36.6667 26.8695 35.2619 30.2609 32.7615 32.7613C30.261 35.2618 26.8696 36.6666 23.3334 36.6666H20C15.3334 36.6666 12.5 35.2332 10.0167 32.7666L4.0167 26.7666C3.44326 26.1315 3.13601 25.3002 3.15857 24.4448C3.18113 23.5894 3.53177 22.7755 4.1379 22.1715C4.74402 21.5675 5.5592 21.2198 6.41465 21.2002C7.2701 21.1807 8.1003 21.4909 8.73336 22.0666L11.6667 24.9999" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  brush: (
    <svg width="27" height="27" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.3333 16.6666L23.3333 21.6666M16.615 28.385L35.63 9.3733C36.2935 8.70982 36.6662 7.80994 36.6662 6.87163C36.6662 5.93332 36.2935 5.03345 35.63 4.36996C34.9665 3.70648 34.0666 3.33374 33.1283 3.33374C32.19 3.33374 31.2901 3.70648 30.6266 4.36996L11.6116 23.385M10.8333 35C11.987 35 13.1148 34.6578 14.0741 34.0169C15.0334 33.3759 15.7811 32.4649 16.2226 31.399C16.6641 30.3331 16.7796 29.1602 16.5546 28.0286C16.3295 26.8971 15.7739 25.8577 14.9581 25.0418C14.1423 24.226 13.1029 23.6705 11.9713 23.4454C10.8398 23.2203 9.66689 23.3358 8.60098 23.7773C7.53508 24.2188 6.62404 24.9665 5.98307 25.9258C5.34209 26.8851 4.99997 28.0129 4.99997 29.1666C5.00028 30.2759 4.57839 31.3438 3.81997 32.1533C3.58628 32.3864 3.42707 32.6836 3.36251 33.0073C3.29796 33.331 3.33097 33.6666 3.45736 33.9715C3.58375 34.2764 3.79783 34.5369 4.07246 34.72C4.34709 34.9031 4.6699 35.0006 4.99997 35H10.8333Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  text: (
    <svg width="27" height="27" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.3334 27.5C23.3334 27.721 23.4212 27.933 23.5774 28.0893C23.7337 28.2455 23.9457 28.3333 24.1667 28.3333H25C25.8841 28.3333 26.7319 28.6845 27.3571 29.3096C27.9822 29.9348 28.3334 30.7826 28.3334 31.6667C28.3334 32.5507 27.9822 33.3986 27.3571 34.0237C26.7319 34.6488 25.8841 35 25 35H15C14.116 35 13.2681 34.6488 12.643 34.0237C12.0179 33.3986 11.6667 32.5507 11.6667 31.6667C11.6667 30.7826 12.0179 29.9348 12.643 29.3096C13.2681 28.6845 14.116 28.3333 15 28.3333H15.8334C16.0544 28.3333 16.2663 28.2455 16.4226 28.0893C16.5789 27.933 16.6667 27.721 16.6667 27.5V12.5C16.6667 12.279 16.5789 12.067 16.4226 11.9107C16.2663 11.7545 16.0544 11.6667 15.8334 11.6667H10.8334C10.6124 11.6667 10.4004 11.7545 10.2441 11.9107C10.0878 12.067 10 12.279 10 12.5V13.3333C10 14.2174 9.64885 15.0652 9.02373 15.6904C8.39861 16.3155 7.55076 16.6667 6.66671 16.6667C5.78265 16.6667 4.93481 16.3155 4.30968 15.6904C3.68456 15.0652 3.33337 14.2174 3.33337 13.3333V8.33333C3.33337 7.44928 3.68456 6.60143 4.30968 5.97631C4.93481 5.35119 5.78265 5 6.66671 5H33.3334C34.2174 5 35.0653 5.35119 35.6904 5.97631C36.3155 6.60143 36.6667 7.44928 36.6667 8.33333V13.3333C36.6667 14.2174 36.3155 15.0652 35.6904 15.6904C35.0653 16.3155 34.2174 16.6667 33.3334 16.6667C32.4493 16.6667 31.6015 16.3155 30.9763 15.6904C30.3512 15.0652 30 14.2174 30 13.3333V12.5C30 12.279 29.9122 12.067 29.756 11.9107C29.5997 11.7545 29.3877 11.6667 29.1667 11.6667H24.1667C23.9457 11.6667 23.7337 11.7545 23.5774 11.9107C23.4212 12.067 23.3334 12.279 23.3334 12.5V27.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ruler: (
    <svg width="27" height="27" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.1667 20.8332L27.5 17.4999M19.1667 15.8332L22.5 12.4999M14.1667 10.8332L17.5 7.49991M29.1667 25.8332L32.5 22.4999M35.5 25.4999C35.8729 25.8715 36.1688 26.3131 36.3707 26.7993C36.5726 27.2855 36.6765 27.8068 36.6765 28.3332C36.6765 28.8597 36.5726 29.381 36.3707 29.8672C36.1688 30.3534 35.8729 30.795 35.5 31.1666L31.1667 35.4999C30.7951 35.8728 30.3535 36.1687 29.8673 36.3706C29.3811 36.5725 28.8598 36.6764 28.3334 36.6764C27.8069 36.6764 27.2856 36.5725 26.7994 36.3706C26.3132 36.1687 25.8717 35.8728 25.5 35.4999L4.50004 14.4999C3.75096 13.7472 3.33044 12.7285 3.33044 11.6666C3.33044 10.6047 3.75096 9.58595 4.50004 8.83325L8.83337 4.49991C9.58607 3.75084 10.6048 3.33032 11.6667 3.33032C12.7286 3.33032 13.7473 3.75084 14.5 4.49991L35.5 25.4999Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dice: (
    <svg width="27" height="27" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.0399 29.8239C34.9691 29.2883 35.5417 28.2973 35.5417 27.2248V12.775C35.5417 11.7025 34.9691 10.7115 34.0399 10.1759L21.4982 2.9468C20.5709 2.41232 19.4291 2.41232 18.5019 2.9468L5.96021 10.1759C5.03097 10.7115 4.45837 11.7025 4.45837 12.7751V27.2248C4.45837 28.2973 5.03097 29.2883 5.96021 29.8239L18.5019 37.053C19.4291 37.5875 20.5709 37.5875 21.4982 37.053L34.0399 29.8239Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M29.801 27.5265C30.1022 27.2071 30.3297 26.8255 30.4674 26.4086L34.4176 14.446C35.0034 12.6717 33.8423 10.7992 31.9924 10.5354L20.4236 8.88537C20.1427 8.84529 19.8574 8.84529 19.5764 8.88537L8.00765 10.5354C6.15781 10.7992 4.99663 12.6717 5.58253 14.446L9.53269 26.4086C9.67036 26.8255 9.89785 27.2071 10.1991 27.5265L17.8178 35.6031C19.0018 36.8584 20.9982 36.8584 22.1823 35.6031L29.801 27.5265Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30.2584 27.0416H9.74171M30.2584 27.0416L20 8.82498M30.2584 27.0416L34.5 28.5M9.74171 27.0416L20 8.82498M9.74171 27.0416L5.5 29M20 8.82498V3" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  scroll: (
    <svg width="30" height="30" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.875 17.5H14.5833M21.875 11.6667H14.5833M27.7083 24.7917V7.29167C27.7083 6.51812 27.401 5.77625 26.854 5.22927C26.307 4.68229 25.5652 4.375 24.7916 4.375H5.83329M5.83329 4.375C6.60684 4.375 7.34871 4.68229 7.89569 5.22927C8.44267 5.77625 8.74996 6.51812 8.74996 7.29167V11.6667M5.83329 4.375C5.05974 4.375 4.31788 4.68229 3.7709 5.22927C3.22392 5.77625 2.91663 6.51812 2.91663 7.29167V10.2083C2.91663 10.5951 3.07027 10.966 3.34376 11.2395C3.61725 11.513 3.98819 11.6667 4.37496 11.6667H8.74996M11.6666 30.625H29.1666C29.9402 30.625 30.682 30.3177 31.229 29.7707C31.776 29.2237 32.0833 28.4819 32.0833 27.7083V26.25C32.0833 25.8632 31.9296 25.4923 31.6562 25.2188C31.3827 24.9453 31.0117 24.7917 30.625 24.7917H16.0416C15.6549 24.7917 15.2839 24.9453 15.0104 25.2188C14.7369 25.4923 14.5833 25.8632 14.5833 26.25V27.7083C14.5833 28.4819 14.276 29.2237 13.729 29.7707C13.182 30.3177 12.4402 30.625 11.6666 30.625ZM11.6666 30.625C10.8931 30.625 10.1512 30.3177 9.60423 29.7707C9.05725 29.2237 8.74996 28.4819 8.74996 27.7083V11.6667" stroke="white" strokeWidth="2.1875" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  pawn: (
    <svg width="30" height="30" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.1458 14.5834L23.3333 26.2501M10.2083 14.5834H24.7916M11.6666 26.2501L13.8541 14.5834M7.29163 29.1667C7.29163 28.3932 7.59892 27.6513 8.1459 27.1044C8.69288 26.5574 9.43474 26.2501 10.2083 26.2501H24.7916C25.5652 26.2501 26.307 26.5574 26.854 27.1044C27.401 27.6513 27.7083 28.3932 27.7083 29.1667V30.6251C27.7083 31.0119 27.5546 31.3828 27.2812 31.6563C27.0077 31.9298 26.6367 32.0834 26.25 32.0834H8.74996C8.36319 32.0834 7.99225 31.9298 7.71876 31.6563C7.44527 31.3828 7.29163 31.0119 7.29163 30.6251V29.1667ZM23.3333 8.75008C23.3333 11.9717 20.7216 14.5834 17.5 14.5834C14.2783 14.5834 11.6666 11.9717 11.6666 8.75008C11.6666 5.52842 14.2783 2.91675 17.5 2.91675C20.7216 2.91675 23.3333 5.52842 23.3333 8.75008Z" stroke="white" strokeWidth="2.1875" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  map: (
    <svg width="30" height="30" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.125 4.71924C12.6724 4.71924 12.2261 4.82455 11.8213 5.02685L5.18146 8.34747C4.93926 8.4685 4.73554 8.65457 4.5931 8.88483C4.45067 9.11509 4.37515 9.38047 4.375 9.65122V28.2639C4.37439 28.5128 4.43747 28.7577 4.55824 28.9753C4.67901 29.1928 4.85345 29.3759 5.06497 29.507C5.27648 29.6381 5.51803 29.713 5.76663 29.7243C6.01523 29.7357 6.2626 29.6833 6.48521 29.5721L11.8213 26.9033C12.2261 26.701 12.6724 26.5957 13.125 26.5957C13.5776 26.5957 14.0239 26.701 14.4288 26.9033L20.5713 29.9746C20.9761 30.1769 21.4224 30.2822 21.875 30.2822C22.3276 30.2822 22.7739 30.1769 23.1788 29.9746L29.8185 26.6539C30.0607 26.5329 30.2645 26.3468 30.4069 26.1166C30.5493 25.8863 30.6249 25.6209 30.625 25.3502V6.73601C30.6254 6.48728 30.5621 6.24259 30.4412 6.0252C30.3204 5.80781 30.1459 5.62494 29.9344 5.494C29.7229 5.36305 29.4815 5.28837 29.233 5.27705C28.9845 5.26574 28.7373 5.31816 28.5148 5.42935L23.1788 8.0981C22.7739 8.30039 22.3276 8.40571 21.875 8.40571C21.4224 8.40571 20.9761 8.30039 20.5713 8.0981L14.4288 5.02685C14.0239 4.82455 13.5776 4.71924 13.125 4.71924ZM21.875 8.40571V30.2808M13.125 4.71924V26.5941" stroke="white" strokeWidth="2.1875" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  notes: (
    <svg width="30" height="30" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.6667 2.91675V8.75008M17.5 2.91675V8.75008M23.3334 2.91675V8.75008M11.6667 14.5834H20.4167M11.6667 20.4167H23.3334M11.6667 26.2501H18.9584M8.75004 5.83341H26.25C27.8609 5.83341 29.1667 7.13925 29.1667 8.75008V29.1667C29.1667 30.7776 27.8609 32.0834 26.25 32.0834H8.75004C7.13921 32.0834 5.83337 30.7776 5.83337 29.1667V8.75008C5.83337 7.13925 7.13921 5.83341 8.75004 5.83341Z" stroke="white" strokeWidth="2.1875" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  pages: (
    <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.7917 4.375C25.5652 4.375 26.3071 4.68229 26.8541 5.22927C27.401 5.77625 27.7083 6.51812 27.7083 7.29167V29.1667C27.7082 29.422 27.6411 29.6729 27.5136 29.8942C27.3861 30.1155 27.2028 30.2994 26.9819 30.4276C26.761 30.5557 26.5103 30.6237 26.2549 30.6245C25.9995 30.6254 25.7484 30.5592 25.5267 30.4325L18.9467 26.6729C18.5061 26.4212 18.0074 26.2889 17.5 26.2889C16.9926 26.2889 16.4939 26.4212 16.0533 26.6729L9.47333 30.4325C9.25158 30.5592 9.00045 30.6254 8.74507 30.6245C8.48969 30.6237 8.23901 30.5557 8.01812 30.4276C7.79723 30.2994 7.61387 30.1155 7.48638 29.8942C7.35889 29.6729 7.29175 29.422 7.29166 29.1667V7.29167C7.29166 6.51812 7.59895 5.77625 8.14594 5.22927C8.69292 4.68229 9.43478 4.375 10.2083 4.375H24.7917Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="white"/>
    </svg>
  ),
  settings: (
    <svg width="30" height="30" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.1035 6.03172C14.1838 5.18639 14.5765 4.40137 15.2047 3.83005C15.8329 3.25873 16.6515 2.94214 17.5007 2.94214C18.3498 2.94214 19.1685 3.25873 19.7967 3.83005C20.4249 4.40137 20.8175 5.18639 20.8979 6.03172C20.9462 6.5778 21.1253 7.10421 21.4202 7.56639C21.715 8.02856 22.1168 8.4129 22.5917 8.68688C23.0665 8.96085 23.6004 9.11639 24.1481 9.14034C24.6957 9.16428 25.2411 9.05592 25.7381 8.82443C26.5097 8.47411 27.3841 8.42342 28.191 8.68223C28.9979 8.94103 29.6797 9.49082 30.1036 10.2246C30.5275 10.9584 30.6633 11.8236 30.4844 12.6519C30.3056 13.4803 29.8249 14.2124 29.136 14.7059C28.6874 15.0207 28.3212 15.4389 28.0684 15.9251C27.8156 16.4113 27.6836 16.9513 27.6836 17.4993C27.6836 18.0474 27.8156 18.5873 28.0684 19.0736C28.3212 19.5598 28.6874 19.978 29.136 20.2928C29.8249 20.7862 30.3056 21.5184 30.4844 22.3467C30.6633 23.1751 30.5275 24.0403 30.1036 24.7741C29.6797 25.5078 28.9979 26.0576 28.191 26.3164C27.3841 26.5752 26.5097 26.5245 25.7381 26.1742C25.2411 25.9427 24.6957 25.8344 24.1481 25.8583C23.6004 25.8823 23.0665 26.0378 22.5917 26.3118C22.1168 26.5858 21.715 26.9701 21.4202 27.4323C21.1253 27.8944 20.9462 28.4209 20.8979 28.9669C20.8175 29.8123 20.4249 30.5973 19.7967 31.1686C19.1685 31.7399 18.3498 32.0565 17.5007 32.0565C16.6515 32.0565 15.8329 31.7399 15.2047 31.1686C14.5765 30.5973 14.1838 29.8123 14.1035 28.9669C14.0553 28.4207 13.8761 27.8941 13.5812 27.4317C13.2863 26.9694 12.8843 26.5849 12.4093 26.3109C11.9342 26.0369 11.4001 25.8814 10.8523 25.8576C10.3044 25.8338 9.75883 25.9424 9.26183 26.1742C8.49021 26.5245 7.61585 26.5752 6.80891 26.3164C6.00198 26.0576 5.32021 25.5078 4.89629 24.7741C4.47236 24.0403 4.33662 23.1751 4.51548 22.3467C4.69434 21.5184 5.175 20.7862 5.86391 20.2928C6.31253 19.978 6.67873 19.5598 6.93154 19.0736C7.18436 18.5873 7.31635 18.0474 7.31635 17.4993C7.31635 16.9513 7.18436 16.4113 6.93154 15.9251C6.67873 15.4389 6.31253 15.0207 5.86391 14.7059C5.17597 14.2122 4.69615 13.4803 4.51773 12.6525C4.3393 11.8248 4.47501 10.9602 4.89847 10.2269C5.32194 9.49364 6.00291 8.94398 6.80905 8.68478C7.61518 8.42558 8.48889 8.47536 9.26037 8.82443C9.75731 9.05592 10.3027 9.16428 10.8504 9.14034C11.3981 9.11639 11.9319 8.96085 12.4068 8.68688C12.8816 8.4129 13.2835 8.02856 13.5783 7.56639C13.8731 7.10421 14.0523 6.5778 14.1006 6.03172M21.875 17.5001C21.875 19.9163 19.9162 21.8751 17.5 21.8751C15.0837 21.8751 13.125 19.9163 13.125 17.5001C13.125 15.0838 15.0837 13.1251 17.5 13.1251C19.9162 13.1251 21.875 15.0838 21.875 17.5001Z" stroke="white" strokeWidth="2.1875" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  quit: (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.5 7.5L7.5 22.5M7.5 7.5L22.5 22.5" stroke="#9290B2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dice_menu: (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.7116 18.9645C21.6409 18.4289 22.2135 17.438 22.2135 16.3654V8.63443C22.2135 7.56187 21.6409 6.57091 20.7116 6.03529L13.9981 2.16555C13.0708 1.63107 11.929 1.63107 11.0018 2.16555L4.28821 6.03529C3.35897 6.57091 2.78638 7.56187 2.78638 8.63443V16.3654C2.78638 17.438 3.35898 18.4289 4.28822 18.9645L11.0018 22.8343C11.929 23.3688 13.0708 23.3688 13.9981 22.8343L20.7116 18.9645Z" stroke="#9290B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.454 17.3859C18.7552 17.0666 18.9827 16.685 19.1204 16.2681L21.0893 10.3054C21.6752 8.5311 20.514 6.65866 18.6642 6.39482L12.9235 5.57604C12.6425 5.53597 12.3573 5.53597 12.0763 5.57604L6.33565 6.39482C4.48581 6.65866 3.32464 8.53111 3.91053 10.3054L5.87945 16.2681C6.01711 16.685 6.2446 17.0666 6.54586 17.3859L10.3176 21.3844C11.5017 22.6397 13.4981 22.6397 14.6822 21.3844L18.454 17.3859Z" stroke="#9290B2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.9115 16.901H6.08857M18.9115 16.901L12.5 5.51561M18.9115 16.901L21.5625 17.8125M6.08857 16.901L12.5 5.51561M6.08857 16.901L3.4375 18.125M12.5 5.51561V1.875" stroke="#9290B2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  up: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 6.25L5 3.75L2.5 6.25" stroke="#EFE5D5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  ),
  down: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="#EFE5D5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  ),
  shapeAngle: (
    <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_414_828)">
        <path d="M3.83862 9.93457L6.54783 17.4619M6.54783 17.4619L9.25703 24.9892C9.43666 25.4883 9.8072 25.8955 10.2871 26.1214C10.7671 26.3473 11.3171 26.3733 11.8162 26.1937L19.3435 23.4845M6.54783 17.4619C9.04328 16.5637 11.7933 16.6937 14.193 17.8231C16.5926 18.9526 18.4453 20.989 19.3435 23.4845M19.3435 23.4845L26.8707 20.7753" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="#DCD4FA"/>
      </g>
      <defs>
        <clipPath id="clip0_414_828">
          <rect width="24" height="24" fill="white" transform="translate(0 8.12769) rotate(-19.7947)"/>
        </clipPath>
      </defs>
    </svg>
  ),
  snappSquareDashedX: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 21H15M14 3H15M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5M21 14V15M21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21M21 9V10M3 14V15M3 9V10M5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19M5 3C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5M9 15L12 12M12 12L15 9M12 12L9 9M12 12L15 15M9 21H10M9 3H10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="#DCD4FA"/>
    </svg>
  ),
  snappSquareDashedXCorner: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3H15M16 16L18.5 18.5M18.5 18.5L21 21M18.5 18.5L21 16M18.5 18.5L16 21M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5M21 9V10M3 14V15M3 9V10M5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19M5 3C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5M9 21H10M9 3H10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="#DCD4FA"/>
    </svg>
  ),
}

const IconButton = ({ label, icon, className = '', onClick, pressed }) => (
  <button
    className={cx('iconButton', className)}
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    title={label}
    onClick={onClick}
  >
    {icons[icon]}
  </button>
)

const RoomPage = () => {
  const { roomId } = useParams()
  const websocketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const tabletopFrameRef = useRef(null)
  const tabletopRef = useRef(null)
  const assetDragRef = useRef(null)
  const assetResizeRef = useRef(null)
  const marqueeRef = useRef(null)
  const marqueeCompletedRef = useRef(false)
  const drawDragRef = useRef(null)
  const drawingMoveRef = useRef(null)
  const chatDragRef = useRef(null)
  const chatResizeRef = useRef(null)
  const diceDragRef = useRef(null)
  const textDragRef = useRef(null)
  const [room, setRoom] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isDiceMenuOpen, setIsDiceMenuOpen] = useState(false)
  const [activeTool, setActiveTool] = useState('select')
  const [tabletopTexts, setTabletopTexts] = useState([])
  const [tabletopDrawings, setTabletopDrawings] = useState([])
  const tabletopDrawingsRef = useRef([])
  const [selectedDrawingIds, setSelectedDrawingIds] = useState([])
  const selectedDrawingIdsRef = useRef([])
  const [drawPreview, setDrawPreview] = useState(null)
  const [drawSettings, setDrawSettings] = useState({ color: '#16151A', strokeWidth: 4 })
  const tabletopTextsRef = useRef([])
  const [selectedTextId, setSelectedTextId] = useState(null)
  const selectedTextIdRef = useRef(null)
  const [selectedTextIds, setSelectedTextIds] = useState([])
  const selectedTextIdsRef = useRef([])
  const [editingTextId, setEditingTextId] = useState(null)
  const [textSettings, setTextSettings] = useState({ fontFamily: 'Arial', fontSize: 24, color: '#EFE5D5', bold: false, italic: false })
  const [isMeasurePanelOpen, setIsMeasurePanelOpen] = useState(false)
  const [measureShape, setMeasureShape] = useState('line')
  const [measureSnap, setMeasureSnap] = useState('none')
  const [measureDropdown, setMeasureDropdown] = useState(null)
  const [keepMeasure, setKeepMeasure] = useState(false)
  const [measureTokenMovement, setMeasureTokenMovement] = useState(true)
  const [broadcastMeasure, setBroadcastMeasure] = useState(true)
  const [measurePanelPosition, setMeasurePanelPosition] = useState({ x: 12, y: 90 })
  const [measurement, setMeasurement] = useState(null)
  const measurementRef = useRef(null)
  const measureDragRef = useRef(null)
  const measureBroadcastRef = useRef(false)
  const measurePanelDragRef = useRef(null)
  const lastMeasureBroadcastRef = useRef(0)
  const assetMeasureRef = useRef(false)
  const [activeSidePanel, setActiveSidePanel] = useState(null)
  const [tokens, setTokens] = useState([])
  const [tabletopAssets, setTabletopAssets] = useState([])
  const [draggingAssetId, setDraggingAssetId] = useState(null)
  const [resizingAssetId, setResizingAssetId] = useState(null)
  const [selectedAssetId, setSelectedAssetId] = useState(null)
  const [selectedAssetIds, setSelectedAssetIds] = useState([])
  const [selectionMarquee, setSelectionMarquee] = useState(null)
  const [mapContextMenu, setMapContextMenu] = useState(null)
  const [workOnLayer, setWorkOnLayer] = useState('players')
  const [expandedLayers, setExpandedLayers] = useState({ players: true, map: true, master: true })
  const [backgroundSettings, setBackgroundSettings] = useState({
    visibleGrid: true,
    backgroundColor: '#949494',
    gridColor: '#ffffff',
    gridOpacity: 25,
    pageSizeX: 1920,
    pageSizeY: 1080,
    mapScaleValue: 1,
    mapScaleUnity: 'meters',
    movementAdaptableToGrid: false,
  })
  const [backgroundColorDraft, setBackgroundColorDraft] = useState('#949494')
  const [gridColorDraft, setGridColorDraft] = useState('#ffffff')
  const [roomSyncError, setRoomSyncError] = useState('')
  const [tokenSearch, setTokenSearch] = useState('')
  const [tokensLoading, setTokensLoading] = useState(false)
  const [tokenUploadLoading, setTokenUploadLoading] = useState(false)
  const [tokensError, setTokensError] = useState('')
  const tokenFileInputRef = useRef(null)
  const loadTabletopPageRef = useRef(null)
  const isRoomMasterRef = useRef(false)
  const currentUserIdRef = useRef(null)
  const pageLoadSequenceRef = useRef(0)
  const currentPageIdRef = useRef(null)
  const [pages, setPages] = useState([])
  const [folders, setFolders] = useState([])
  const [currentPageId, setCurrentPageId] = useState(null)
  const [playersPageId, setPlayersPageId] = useState(null)
  const [pageSearch, setPageSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState({})
  const [renamingPageId, setRenamingPageId] = useState(null)
  const [renamingFolderId, setRenamingFolderId] = useState(null)
  const isRoomMaster = room?.role === 'master'
  const sidePanels = isRoomMaster
    ? ['Sheets', 'Images', 'Maps', 'Pages', 'Notes']
    : ['Sheets', 'Images', 'Notes']
  const undoHistoryRef = useRef([])
  const selectedAssetIdRef = useRef(null)
  const selectedAssetIdsRef = useRef([])
  const undoActionRef = useRef(null)
  const deleteSelectedAssetRef = useRef(null)
  const [chatDraft, setChatDraft] = useState('')
  const [chatStatus, setChatStatus] = useState('idle')
  const [chatMessages, setChatMessages] = useState([])
  const roomUserProfilesRef = useRef({})
  const [chatBox, setChatBox] = useState({
    x: 22,
    y: 22,
    width: 320,
    height: 460,
  })
  const [diceMenuPosition, setDiceMenuPosition] = useState({
    x: 132,
    y: 22,
  })
  const [advancedRoll, setAdvancedRoll] = useState({
    quantity: 1,
    sides: 20,
    bonus: 0,
  })

  useEffect(() => {
    undoHistoryRef.current = []
    selectedAssetIdRef.current = null
    selectedAssetIdsRef.current = []
    setSelectedAssetId(null)
    setSelectedAssetIds([])
    setSelectedTextId(null)
    selectedTextIdRef.current = null
    setSelectedTextIds([])
    selectedTextIdsRef.current = []
  }, [roomId])

  useEffect(() => { tabletopTextsRef.current = tabletopTexts }, [tabletopTexts])
  useEffect(() => { tabletopDrawingsRef.current = tabletopDrawings }, [tabletopDrawings])

  useEffect(() => {
    if (!isRoomMaster && ['Maps', 'Pages'].includes(activeSidePanel)) {
      setActiveSidePanel(null)
    }
  }, [activeSidePanel, isRoomMaster])

  useEffect(() => {
    if (!mapContextMenu) return undefined
    const dismissMenu = (event) => {
      if (!event.target.closest?.('[data-map-context-menu]')) setMapContextMenu(null)
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMapContextMenu(null)
    }
    document.addEventListener('pointerdown', dismissMenu)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissMenu)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [mapContextMenu])

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      const target = event.target
      const isEditable = target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )
      if (isEditable) return

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        undoActionRef.current?.()
        return
      }

      if ((event.key === 'Backspace' || event.key === 'Delete') && (selectedTextIdRef.current != null || selectedDrawingIdsRef.current.length > 0)) {
        event.preventDefault()
        const drawingIds = selectedDrawingIdsRef.current
        drawingIds.forEach((id) => { if (!String(id).startsWith('draft-')) sendRoomMessage({ type: 'drawing.delete', page_id: currentPageIdRef.current, drawing_id: id }) })
        setTabletopDrawings((current) => current.filter((item) => !drawingIds.includes(item.id)))
        tabletopDrawingsRef.current = tabletopDrawingsRef.current.filter((item) => !drawingIds.includes(item.id))
        selectedDrawingIdsRef.current = []
        setSelectedDrawingIds([])
        const ids = selectedTextIdsRef.current.length ? selectedTextIdsRef.current : [selectedTextIdRef.current]
        ids.forEach((id) => { if (!String(id).startsWith('draft-')) sendRoomMessage({ type: 'text.delete', page_id: currentPageIdRef.current, text_id: id }) })
        setTabletopTexts((current) => current.filter((item) => !ids.includes(item.id)))
        selectedTextIdRef.current = null
        selectedTextIdsRef.current = []
        setSelectedTextIds([])
        setSelectedTextId(null)
        return
      }
      if ((event.key === 'Backspace' || event.key === 'Delete') && (selectedAssetIdRef.current != null || selectedAssetIdsRef.current.length > 0)) {
        event.preventDefault()
        deleteSelectedAssetRef.current?.(selectedAssetIdsRef.current.length ? selectedAssetIdsRef.current : [selectedAssetIdRef.current])
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  useEffect(() => {
    if (activeSidePanel !== 'Images' || !roomId) return
    let cancelled = false
    setTokensLoading(true)
    setTokensError('')
    getRoomAssets(roomId)
      .then((assets) => { if (!cancelled) setTokens(assets) })
      .catch(() => { if (!cancelled) setTokensError('Não foi possível carregar os tokens.') })
      .finally(() => { if (!cancelled) setTokensLoading(false) })
    return () => { cancelled = true }
  }, [activeSidePanel, roomId])

  const handleTokenUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setTokensError('Escolha uma imagem PNG, JPEG ou WEBP.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setTokensError('A imagem deve ter no máximo 10 MB.')
      return
    }
    setTokenUploadLoading(true)
    setTokensError('')
    try {
      const asset = await uploadRoomAsset(roomId, file)
      setTokens((current) => [asset, ...current])
    } catch (error) {
      setTokensError(error.response?.data?.detail || 'Não foi possível enviar a imagem.')
    } finally {
      setTokenUploadLoading(false)
    }
  }

  const filteredTokens = tokens.filter((token) =>
    (token.asset_image_file_name || '').toLowerCase().includes(tokenSearch.trim().toLowerCase())
  )

  const loadTabletopPage = async (requestedPageId = null) => {
    const sequence = ++pageLoadSequenceRef.current
    const content = await getRoomTabletop(roomId, requestedPageId)
    if (sequence !== pageLoadSequenceRef.current) return
    const loadedPageId = content.page_id ?? null
    if (currentPageIdRef.current !== loadedPageId) undoHistoryRef.current = []
    currentPageIdRef.current = loadedPageId
    setCurrentPageId(loadedPageId)
    setPlayersPageId(content.active_page_id ?? null)
    setPages(content.pages || [])
    setFolders(content.folders || [])
    setTabletopAssets(content.assets || [])
    setTabletopTexts(content.texts || [])
    setTabletopDrawings(content.drawings || [])
    setSelectedTextId(null)
    setEditingTextId(null)
    selectedTextIdRef.current = null
    setSelectedTextIds([])
    selectedTextIdsRef.current = []
    selectedDrawingIdsRef.current = []
    setSelectedDrawingIds([])
    setSelectedAssetId(null)
    setSelectedAssetIds([])
    selectedAssetIdRef.current = null
    selectedAssetIdsRef.current = []
    const settings = content.settings
    if (!settings) return
    setBackgroundSettings({
      visibleGrid: settings.visible_grid,
      movementAdaptableToGrid: settings.movement_adaptable_to_grid,
      gridColor: settings.grid_color,
      gridOpacity: settings.grid_opacity,
      backgroundColor: settings.background_color,
      pageSizeX: settings.page_size_x,
      pageSizeY: settings.page_size_y,
      mapScaleValue: Number(settings.map_scale_value) || 1,
      mapScaleUnity: settings.map_scale_unity,
    })
    setGridColorDraft(settings.grid_color)
    setBackgroundColorDraft(settings.background_color)
  }
  loadTabletopPageRef.current = loadTabletopPage
  isRoomMasterRef.current = isRoomMaster
  currentUserIdRef.current = currentUser?.id

  useEffect(() => {
    if (!roomId) return undefined
    let cancelled = false
    loadTabletopPage(null).catch((error) => {
      if (!cancelled) console.error('Não foi possível carregar o tabletop da sala.', error)
    })
    return () => { cancelled = true; pageLoadSequenceRef.current += 1 }
  }, [roomId])

  useEffect(() => {
    if (currentPageId == null) return
    const firstMapAsset = getLayerAssets(tabletopAssets, 'map')[0]
    const previewImageUrl = firstMapAsset?.asset_image_url || null
    setPages((current) => current.map((page) => page.id === currentPageId && page.preview_image_url !== previewImageUrl
      ? { ...page, preview_image_url: previewImageUrl }
      : page))
  }, [currentPageId, tabletopAssets])

  const gridStyle = useMemo(() => ({
    '--tabletop-scale': zoom / 100,
    '--tabletop-x': `${pan.x}px`,
    '--tabletop-y': `${pan.y}px`,
    '--tabletop-width': `${backgroundSettings.pageSizeX}px`,
    '--tabletop-height': `${backgroundSettings.pageSizeY}px`,
    backgroundColor: backgroundSettings.backgroundColor,
  }), [backgroundSettings.backgroundColor, backgroundSettings.pageSizeX, backgroundSettings.pageSizeY, pan.x, pan.y, zoom])

  const sendRoomMessage = (message) => {
    const socket = websocketRef.current
    if (socket?.readyState !== WebSocket.OPEN) {
      setRoomSyncError('A conexão com a sala não está disponível. Tente novamente em instantes.')
      return false
    }
    socket.send(JSON.stringify(message))
    setRoomSyncError('')
    return true
  }

  const applyBackgroundSettings = (settings) => {
    const message = { type: 'background.change_settings', page_id: currentPageIdRef.current, ...settings }
    if (!sendRoomMessage(message)) return false
    setBackgroundSettings((current) => ({
      ...current,
      ...(settings.visible_grid !== undefined && { visibleGrid: settings.visible_grid }),
      ...(settings.background_color !== undefined && { backgroundColor: settings.background_color }),
      ...(settings.grid_color !== undefined && { gridColor: settings.grid_color }),
      ...(settings.grid_opacity !== undefined && { gridOpacity: settings.grid_opacity }),
      ...(settings.page_size_x !== undefined && { pageSizeX: settings.page_size_x }),
      ...(settings.page_size_y !== undefined && { pageSizeY: settings.page_size_y }),
      ...(settings.map_scale_value !== undefined && { mapScaleValue: settings.map_scale_value }),
      ...(settings.map_scale_unity !== undefined && { mapScaleUnity: settings.map_scale_unity }),
      ...(settings.movement_adaptable_to_grid !== undefined && { movementAdaptableToGrid: settings.movement_adaptable_to_grid }),
    }))
    if (settings.grid_color !== undefined) setGridColorDraft(settings.grid_color)
    return true
  }

  const fitTabletopToMap = (asset) => {
    if (!asset || asset.layer !== 'map') return false
    const image = tabletopRef.current?.querySelector(`[data-asset-id="${asset.id}"] img`)
    const width = Math.ceil(Number(asset.width) || image?.naturalWidth || 0)
    const height = Math.ceil(Number(asset.height) || image?.naturalHeight || 0)
    if (width < 1 || height < 1) return false
    return applyBackgroundSettings({ page_size_x: width, page_size_y: height })
  }

  const removeAssetFromTabletop = (assetIds, recordUndo = true) => {
    const ids = (Array.isArray(assetIds) ? assetIds : [assetIds]).map(Number)
    const assets = tabletopAssets.filter((item) => ids.includes(item.id) && item.layer != null)
    if (!assets.length) return false
    const socket = websocketRef.current
    if (socket?.readyState !== WebSocket.OPEN) {
      setRoomSyncError('A conexão com a sala não está disponível. Tente novamente em instantes.')
      return false
    }
    assets.forEach((asset) => socket.send(JSON.stringify({ type: 'asset.remove_from_tabletop', page_id: currentPageIdRef.current, asset_id: asset.id })))
    if (recordUndo) undoHistoryRef.current.push({ type: 'restore-placement-group', assets: assets.map(tabletopAssetFields) })
    setTabletopAssets((current) => current.map((item) => ids.includes(item.id) ? clearTabletopFields(item) : item))
    if (ids.includes(selectedAssetIdRef.current)) selectedAssetIdRef.current = null
    selectedAssetIdsRef.current = selectedAssetIdsRef.current.filter((id) => !ids.includes(id))
    setSelectedAssetIds(selectedAssetIdsRef.current)
    setSelectedAssetId((current) => ids.includes(current) ? null : current)
    return true
  }

  deleteSelectedAssetRef.current = removeAssetFromTabletop

  const undoLastAction = () => {
    const action = undoHistoryRef.current.pop()
    if (!action) return
    const failAndRestoreHistory = () => { undoHistoryRef.current.push(action) }

    if (action.type === 'restore-placement' || action.type === 'restore-placement-group') {
      const assets = action.type === 'restore-placement' ? [action.asset] : action.assets
      const socket = websocketRef.current
      if (socket?.readyState !== WebSocket.OPEN) return failAndRestoreHistory()
      assets.forEach((asset) => {
        const { id, ...assetData } = tabletopAssetFields(asset)
        socket.send(JSON.stringify({ type: 'asset.insert', page_id: currentPageIdRef.current, asset_id: id, asset_data: assetData }))
      })
      setTabletopAssets((current) => current.map((item) => {
        const asset = assets.find((candidate) => candidate.id === item.id)
        return asset ? { ...item, ...tabletopAssetFields(asset) } : item
      }))
      selectedAssetIdsRef.current = assets.map((asset) => asset.id)
      setSelectedAssetIds(selectedAssetIdsRef.current)
      selectedAssetIdRef.current = assets[0]?.id ?? null
      setSelectedAssetId(selectedAssetIdRef.current)
      return
    }

    if (action.type === 'remove-placement') {
      if (!removeAssetFromTabletop(action.assetId, false)) return failAndRestoreHistory()
      return
    }

    if (action.type === 'move') {
      if (!sendRoomMessage({ type: 'asset.move', page_id: currentPageIdRef.current, asset_id: action.assetId, x: action.x, y: action.y })) return failAndRestoreHistory()
      setTabletopAssets((current) => current.map((item) => item.id === action.assetId
        ? { ...item, position_x: action.x, position_y: action.y }
        : item))
      return
    }

    if (action.type === 'move-group' || action.type === 'resize-group') {
      const socket = websocketRef.current
      if (socket?.readyState !== WebSocket.OPEN) return failAndRestoreHistory()
      action.assets.forEach((asset) => {
        if (action.type === 'resize-group') socket.send(JSON.stringify({ type: 'asset.change_size', page_id: currentPageIdRef.current, asset_id: asset.id, width: asset.width, height: asset.height }))
        socket.send(JSON.stringify({ type: 'asset.move', page_id: currentPageIdRef.current, asset_id: asset.id, x: asset.x, y: asset.y }))
      })
      setTabletopAssets((current) => current.map((item) => {
        const previous = action.assets.find((asset) => asset.id === item.id)
        return previous ? { ...item, position_x: previous.x, position_y: previous.y, ...(previous.width && { width: previous.width }), ...(previous.height && { height: previous.height }) } : item
      }))
      return
    }

    if (action.type === 'resize') {
      if (!sendRoomMessage({ type: 'asset.change_size', page_id: currentPageIdRef.current, asset_id: action.assetId, width: action.width, height: action.height })) return failAndRestoreHistory()
      if (action.x != null && action.y != null) {
        sendRoomMessage({ type: 'asset.move', page_id: currentPageIdRef.current, asset_id: action.assetId, x: action.x, y: action.y })
      }
      setTabletopAssets((current) => current.map((item) => item.id === action.assetId
        ? { ...item, width: action.width, height: action.height, ...(action.x != null && { position_x: action.x }), ...(action.y != null && { position_y: action.y }) }
        : item))
      return
    }

    if (action.type === 'reorder') {
      const socket = websocketRef.current
      if (socket?.readyState !== WebSocket.OPEN) return failAndRestoreHistory()
      action.assets.forEach((asset) => {
        socket.send(JSON.stringify({ type: 'asset.change_order', page_id: currentPageIdRef.current, asset_id: asset.id, layer: asset.layer, layer_order: asset.layer_order }))
      })
      setTabletopAssets((current) => current.map((item) => {
        const previous = action.assets.find((asset) => asset.id === item.id)
        return previous ? { ...item, layer: previous.layer, layer_order: previous.layer_order } : item
      }))
    }
  }

  undoActionRef.current = undoLastAction

  const reorderAsset = (assetId, targetLayer, targetAssetId = null, insertBefore = true) => {
    const draggedAsset = tabletopAssets.find((asset) => asset.id === assetId)
    if (!draggedAsset) return
    const sourceLayer = draggedAsset.layer
    const sourceAssets = getLayerAssets(tabletopAssets, sourceLayer).filter((asset) => asset.id !== assetId)
    const targetAssets = sourceLayer === targetLayer
      ? sourceAssets
      : getLayerAssets(tabletopAssets, targetLayer)
    const targetIndex = targetAssetId == null
      ? targetAssets.length
      : Math.max(0, targetAssets.findIndex((asset) => asset.id === targetAssetId) + (insertBefore ? 0 : 1))
    targetAssets.splice(targetIndex, 0, { ...draggedAsset, layer: targetLayer })

    const affectedIds = new Set([assetId])
    if (sourceLayer !== targetLayer) sourceAssets.forEach((asset) => affectedIds.add(asset.id))
    targetAssets.forEach((asset) => affectedIds.add(asset.id))
    const oldStates = tabletopAssets.filter((asset) => affectedIds.has(asset.id)).map((asset) => ({
      id: asset.id,
      layer: asset.layer,
      layer_order: Number(asset.layer_order) || 0,
    }))
    const nextStates = []
    if (sourceLayer !== targetLayer) {
      sourceAssets.forEach((asset, index) => nextStates.push({ id: asset.id, layer: sourceLayer, layer_order: index }))
    }
    targetAssets.forEach((asset, index) => nextStates.push({ id: asset.id, layer: targetLayer, layer_order: index }))
    const changedStates = nextStates.filter((next) => {
      const previous = oldStates.find((asset) => asset.id === next.id)
      return previous && (previous.layer !== next.layer || previous.layer_order !== next.layer_order)
    })
    if (!changedStates.length) return

    const socket = websocketRef.current
    if (socket?.readyState !== WebSocket.OPEN) {
      setRoomSyncError('A conexão com a sala não está disponível. Tente novamente em instantes.')
      return
    }
    changedStates.forEach((asset) => {
      socket.send(JSON.stringify({ type: 'asset.change_order', page_id: currentPageIdRef.current, asset_id: asset.id, layer: asset.layer, layer_order: asset.layer_order }))
    })
    undoHistoryRef.current.push({ type: 'reorder', assets: oldStates })
    setTabletopAssets((current) => current.map((asset) => {
      const next = nextStates.find((item) => item.id === asset.id)
      return next ? { ...asset, layer: next.layer, layer_order: next.layer_order } : asset
    }))
    setRoomSyncError('')
  }

  const changeAssetVisibility = (asset) => {
    const visible = asset.visible === false
    if (!sendRoomMessage({ type: 'asset.change_visibility', page_id: currentPageIdRef.current, asset_id: asset.id, visible })) return
    setTabletopAssets((current) => current.map((item) => item.id === asset.id ? { ...item, visible } : item))
  }

  const changeMovementAdaptability = (enabled) => {
    if (!applyBackgroundSettings({ movement_adaptable_to_grid: enabled }) || !enabled) return
    tabletopAssets.forEach((asset) => {
      if (asset.position_x == null || asset.position_y == null) return
      const width = Math.max(gridCellSize, Math.ceil((Number(asset.width) || defaultTokenSize) / gridCellSize) * gridCellSize)
      const height = Math.max(gridCellSize, Math.ceil((Number(asset.height) || defaultTokenSize) / gridCellSize) * gridCellSize)
      const maxX = Math.max(0, backgroundSettings.pageSizeX - width)
      const maxY = Math.max(0, backgroundSettings.pageSizeY - height)
      const x = Math.max(0, Math.min(Math.floor(maxX / gridCellSize) * gridCellSize, Math.round((Number(asset.position_x) || 0) / gridCellSize) * gridCellSize))
      const y = Math.max(0, Math.min(Math.floor(maxY / gridCellSize) * gridCellSize, Math.round((Number(asset.position_y) || 0) / gridCellSize) * gridCellSize))
      setTabletopAssets((current) => current.map((item) => item.id === asset.id
        ? { ...item, position_x: String(x), position_y: String(y), width: String(width), height: String(height) }
        : item))
      if (width !== Number(asset.width) || height !== Number(asset.height)) {
        sendRoomMessage({ type: 'asset.change_size', page_id: currentPageIdRef.current, asset_id: asset.id, width: String(width), height: String(height) })
      }
      if (x !== Number(asset.position_x) || y !== Number(asset.position_y)) {
        sendRoomMessage({ type: 'asset.move', page_id: currentPageIdRef.current, asset_id: asset.id, x: String(x), y: String(y) })
      }
    })
  }

  const handleLayerDrop = (event, layer) => {
    event.preventDefault()
    event.stopPropagation()
    const assetId = Number(event.dataTransfer.getData('application/x-room-asset-id'))
    if (assetId && tabletopAssets.some((asset) => asset.id === assetId)) reorderAsset(assetId, layer)
  }

  const handleLayerAssetDrop = (event, targetAsset, layer) => {
    event.preventDefault()
    event.stopPropagation()
    const assetId = Number(event.dataTransfer.getData('application/x-room-asset-id'))
    if (!assetId || assetId === targetAsset.id) return
    const bounds = event.currentTarget.getBoundingClientRect()
    reorderAsset(assetId, layer, targetAsset.id, event.clientY < bounds.top + bounds.height / 2)
  }

  const changeZoom = (direction) => {
    setZoom((current) => Math.min(maxZoom, Math.max(minZoom, current + direction * zoomStep)))
  }

  const keepChatInsideScreen = useCallback((nextBox) => {
    const maxWidth = Math.max(180, window.innerWidth - chatMenuSafeArea)
    const maxHeight = Math.max(220, window.innerHeight - chatMenuSafeArea)
    const minWidth = Math.min(chatMinWidth, maxWidth)
    const minHeight = Math.min(chatMinHeight, maxHeight)
    const width = Math.min(Math.max(nextBox.width, minWidth), maxWidth)
    const height = Math.min(Math.max(nextBox.height, minHeight), maxHeight)
    const x = Math.min(
      Math.max(nextBox.x, 0),
      Math.max(0, window.innerWidth - width - chatMenuSafeArea)
    )
    const y = Math.min(
      Math.max(nextBox.y, 0),
      Math.max(0, window.innerHeight - height - chatMenuSafeArea)
    )

    return { x, y, width, height }
  }, [])

  const keepDiceMenuInsideScreen = useCallback((nextPosition) => {
    const diceMenu = document.querySelector('[data-dice-menu]')
    const width = diceMenu?.offsetWidth || Math.min(diceMenuWidth, window.innerWidth - diceMenuSafeArea * 2)
    const height = diceMenu?.offsetHeight || Math.min(diceMenuHeight, window.innerHeight - diceMenuSafeArea * 2)
    const x = Math.min(
      Math.max(nextPosition.x, 0),
      Math.max(0, window.innerWidth - width - diceMenuSafeArea)
    )
    const y = Math.min(
      Math.max(nextPosition.y, 0),
      Math.max(0, window.innerHeight - height - diceMenuSafeArea)
    )

    return { x, y }
  }, [])

  const formatDiceRoll = (payload) => {
    const dices = payload.result?.dices ?? []
    const total = payload.result?.total ?? dices.reduce((sum, dice) => sum + dice, 0) + payload.bonus
    const bonusLabel = payload.bonus ? `${payload.bonus > 0 ? '+' : ''}${payload.bonus}` : ''
    const expression = `${payload.quantity}d${payload.sides}${bonusLabel}`

    let txtColor = '#11111a'

    if (dices.length == 1){
      if (payload.sides == dices[0]){
        txtColor = '#158801'
      } else if (1 == dices[0]){
        txtColor = '#AB0404'
      }
      
    }

    // return `Roll: ${expression} = ${total}\n(${details})`
    return (
      <div className={s.chatRollResult}>
        <header>
          <Icon
            name='dices'
            color='#363547'
            className={s.headerRollResult}
          ></Icon>
          <p>{`Roll: ${expression}`}</p>
        </header>
        <span className={s.rollLine}></span>

        <div className={s.rollNumberContainer}>
          <img
            className={s.rollDiceBackground}
            src={diceD20Chat}
            alt=""
            aria-hidden="true"
          />

          <p 
            className={s.rollNumberResult}
            style={{ color: txtColor }}
          >{total}</p>
        </div>
        <div className={s.rollDiceDetails} aria-label={`Dice results: ${dices.join(', ')}`}>
          <div className={s.rollDiceValues}>
            {dices.map((die, index) => <span
              className={s.rollDieValue}
              key={`${index}-${die}`}
              style={{ color: die === payload.sides ? '#158801' : die === 1 ? '#AB0404' : undefined }}
            >{die}</span>)}
          </div>
          {payload.bonus !== 0 && <span className={s.rollBonusValue}>Bonus {bonusLabel}</span>}
        </div>
      </div>
    )
  }

  useEffect(() => {
    let isMounted = true

    const loadRoomContext = async () => {
      try {
        const [roomData, userData] = await Promise.all([
          getGameById(roomId),
          getUser(),
        ])

        if (!isMounted) {
          return
        }

        setRoom(roomData)
        setCurrentUser(userData)
      } catch (error) {
        console.error(error)
      }
    }

    loadRoomContext()

    return () => {
      isMounted = false
    }
  }, [roomId])

  useEffect(() => {
    if (!room?.code) {
      return undefined
    }

    const socket = new WebSocket(buildWebSocketUrl(room.code))
    websocketRef.current = socket
    setChatStatus('connecting')

    socket.addEventListener('open', () => {
      setChatStatus('connected')
    })

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.event === 'error') {
          setRoomSyncError(data.payload?.message || 'O servidor não conseguiu atualizar a sala.')
          return
        }

        if (data.event === 'player.join') {
          roomUserProfilesRef.current[String(data.user_id)] = data.profilepic_image_url || null
          return
        }

        if (data.event === 'page.created') {
          const page = data.payload
          setPages((current) => current.some((item) => item.id === page.id) ? current : [...current, page])
          if (isRoomMasterRef.current && data.user_id === currentUserIdRef.current) loadTabletopPageRef.current?.(page.id).catch(console.error)
          return
        }
        if (data.event === 'folder.created') {
          setFolders((current) => current.some((item) => item.id === data.payload.id) ? current : [...current, data.payload])
          return
        }
        if (data.event === 'page.updated') {
          setPages((current) => current.map((item) => item.id === data.payload.id ? { ...item, ...data.payload } : item))
          return
        }
        if (data.event === 'folder.updated') {
          setFolders((current) => current.map((item) => item.id === data.payload.id ? { ...item, ...data.payload } : item))
          return
        }
        if (data.event === 'page.published') {
          setPlayersPageId(data.payload.page_id)
          setPages((current) => current.map((item) => ({ ...item, is_players_page: item.id === data.payload.page_id })))
          if (!isRoomMasterRef.current) loadTabletopPageRef.current?.(data.payload.page_id).catch(console.error)
          return
        }

        if (data.event !== 'message' && data.event !== 'measure.update') {
          return
        }

        const payload = data.payload
        if (data.event === 'measure.update' || payload?.type === 'measure.update') {
          if (Number(data.user_id) !== Number(currentUser?.id)) {
            const nextMeasurement = payload.phase === 'end' && !payload.keep ? null : {
              x: payload.x1, y: payload.y1, endX: payload.x2, endY: payload.y2,
              shape: payload.shape, userId: data.user_id, isDragging: payload.phase !== 'end',
            }
            measurementRef.current = nextMeasurement
            setMeasurement(nextMeasurement)
          }
          return
        }
        if (payload?.page_id != null && Number(payload.page_id) !== Number(currentPageIdRef.current)) {
          const previewAffectingMessages = ['asset.insert', 'asset.change_layer', 'asset.change_order', 'asset.remove_from_tabletop']
          if (isRoomMasterRef.current && previewAffectingMessages.includes(payload.type)) {
            getRoomTabletop(roomId, payload.page_id).then((content) => {
              const previews = new Map((content.pages || []).map((page) => [page.id, page.preview_image_url]))
              setPages((current) => current.map((page) => previews.has(page.id)
                ? { ...page, preview_image_url: previews.get(page.id) || null }
                : page))
            }).catch((error) => console.error('Não foi possível atualizar o preview das pages.', error))
          }
          return
        }
        if (payload?.type === 'text.create') {
          const text = { id: payload.text_id, page_id: payload.page_id, client_id: payload.client_id, content: payload.content || '', position_x: payload.x, position_y: payload.y, layer: payload.layer, font_family: payload.font_family, font_size: payload.font_size, color: payload.color, bold: payload.bold, italic: payload.italic }
          setTabletopTexts((current) => {
            const draft = current.find((item) => item.client_id === payload.client_id)
            return draft
              ? current.map((item) => item.client_id === payload.client_id ? { ...text, content: item.content, font_family: item.font_family, font_size: item.font_size, color: item.color, bold: item.bold, italic: item.italic } : item)
              : current.some((item) => item.id === payload.text_id) ? current.map((item) => item.id === payload.text_id ? { ...item, ...text } : item) : [...current, text]
          })
          setSelectedTextId((current) => { const next = current === `draft-${payload.client_id}` ? payload.text_id : current; selectedTextIdRef.current = next; return next })
          setSelectedTextIds((current) => {
            const next = current.map((id) => id === `draft-${payload.client_id}` ? payload.text_id : id)
            selectedTextIdsRef.current = next
            return next
          })
          setEditingTextId((current) => current === `draft-${payload.client_id}` ? payload.text_id : current)
          return
        }
        if (payload?.type === 'text.update') {
          const changes = Object.fromEntries(['content', 'font_family', 'font_size', 'color', 'bold', 'italic'].filter((key) => payload[key] != null).map((key) => [key, payload[key]]))
          setTabletopTexts((current) => current.map((item) => item.id === payload.text_id ? { ...item, ...changes } : item))
          return
        }
        if (payload?.type === 'text.move') {
          setTabletopTexts((current) => current.map((item) => item.id === payload.text_id ? { ...item, position_x: payload.x, position_y: payload.y } : item))
          return
        }
        if (payload?.type === 'text.delete') {
          setTabletopTexts((current) => current.filter((item) => item.id !== payload.text_id))
          setSelectedTextId((current) => current === payload.text_id ? null : current)
          setSelectedTextIds((current) => { const next = current.filter((id) => id !== payload.text_id); selectedTextIdsRef.current = next; return next })
          setEditingTextId((current) => current === payload.text_id ? null : current)
          if (selectedTextIdRef.current === payload.text_id) selectedTextIdRef.current = null
          return
        }
        if (payload?.type === 'drawing.create') {
          const drawing = { id: payload.drawing_id, client_id: payload.client_id, page_id: payload.page_id, position_x: payload.position_x, position_y: payload.position_y, points: payload.points, color: payload.color, stroke_width: payload.stroke_width, layer: payload.layer }
          setTabletopDrawings((current) => current.some((item) => item.client_id === payload.client_id)
            ? current.map((item) => item.client_id === payload.client_id ? { ...drawing, position_x: item.position_x, position_y: item.position_y } : item)
            : current.some((item) => item.id === payload.drawing_id) ? current.map((item) => item.id === payload.drawing_id ? { ...item, ...drawing } : item) : [...current, drawing])
          setSelectedDrawingIds((current) => {
            const next = current.map((id) => id === `draft-${payload.client_id}` ? payload.drawing_id : id)
            selectedDrawingIdsRef.current = next
            return next
          })
          return
        }
        if (payload?.type === 'drawing.move') {
          setTabletopDrawings((current) => current.map((item) => item.id === payload.drawing_id ? { ...item, position_x: payload.position_x, position_y: payload.position_y } : item))
          return
        }
        if (payload?.type === 'drawing.delete') {
          setTabletopDrawings((current) => current.filter((item) => item.id !== payload.drawing_id))
          setSelectedDrawingIds((current) => { const next = current.filter((id) => id !== payload.drawing_id); selectedDrawingIdsRef.current = next; return next })
          return
        }
        const isChatMessage = payload?.type === 'chat.message'
        const isDiceRoll = payload?.type === 'dice.roll'

        if (payload?.type === 'asset.insert') {
          if (!isRoomMasterRef.current && payload.asset_data?.layer === 'master') return
          setTabletopAssets((current) => {
            const hasAsset = current.some((asset) => asset.id === payload.asset_id)
            return hasAsset
              ? current.map((asset) => asset.id === payload.asset_id ? { ...asset, ...payload.asset_data } : asset)
              : current
          })
          // Hydrate just this asset without replacing other tokens' current sizes and placements.
          getRoomTabletop(roomId, payload.page_id)
            .then((content) => {
              const insertedAsset = content.assets?.find((asset) => asset.id === payload.asset_id)
              if (!insertedAsset) return
              setTabletopAssets((current) => {
                const existing = current.find((asset) => asset.id === insertedAsset.id)
                if (existing) return current.map((asset) => asset.id === insertedAsset.id
                  ? { ...existing, ...insertedAsset, ...payload.asset_data }
                  : asset)
                return [...current, { ...insertedAsset, ...payload.asset_data }]
              })
            })
            .catch((error) => console.error('Não foi possível atualizar o asset inserido.', error))
          return
        }

        if (payload?.type === 'asset.move') {
          setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id
            ? { ...asset, position_x: payload.x, position_y: payload.y }
            : asset))
          return
        }

        if (payload?.type === 'asset.change_layer') {
          if (!isRoomMasterRef.current && payload.layer === 'master') {
            setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id ? clearTabletopFields(asset) : asset))
            return
          }
          if (!isRoomMasterRef.current) {
            getRoomTabletop(roomId, payload.page_id).then((content) => {
              if (Number(currentPageIdRef.current) === Number(payload.page_id)) setTabletopAssets(content.assets || [])
            }).catch(console.error)
            return
          }
          setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id
            ? { ...asset, layer: payload.layer }
            : asset))
          return
        }

        if (payload?.type === 'asset.change_order') {
          if (!isRoomMasterRef.current && payload.layer === 'master') {
            setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id ? clearTabletopFields(asset) : asset))
            return
          }
          if (!isRoomMasterRef.current) {
            getRoomTabletop(roomId, payload.page_id).then((content) => {
              if (Number(currentPageIdRef.current) === Number(payload.page_id)) setTabletopAssets(content.assets || [])
            }).catch(console.error)
            return
          }
          setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id
            ? { ...asset, layer: payload.layer, layer_order: payload.layer_order }
            : asset))
          return
        }

        if (payload?.type === 'asset.remove_from_tabletop') {
          setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id
            ? clearTabletopFields(asset)
            : asset))
          setSelectedAssetId((current) => current === payload.asset_id ? null : current)
          if (selectedAssetIdRef.current === payload.asset_id) selectedAssetIdRef.current = null
          setSelectedAssetIds((current) => {
            const next = current.filter((id) => id !== payload.asset_id)
            selectedAssetIdsRef.current = next
            return next
          })
          return
        }

        if (payload?.type === 'asset.change_visibility') {
          setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id
            ? { ...asset, visible: payload.visible }
            : asset))
          return
        }

        if (payload?.type === 'asset.change_size') {
          setTabletopAssets((current) => current.map((asset) => asset.id === payload.asset_id
            ? { ...asset, width: payload.width, height: payload.height }
            : asset))
          return
        }

        if (payload?.type === 'background.change_settings') {
          setBackgroundSettings((current) => ({
            ...current,
            ...(payload.visible_grid != null && { visibleGrid: payload.visible_grid }),
            ...(payload.background_color != null && { backgroundColor: payload.background_color }),
            ...(payload.grid_color != null && { gridColor: payload.grid_color }),
            ...(payload.grid_opacity != null && { gridOpacity: payload.grid_opacity }),
            ...(payload.page_size_x != null && { pageSizeX: payload.page_size_x }),
            ...(payload.page_size_y != null && { pageSizeY: payload.page_size_y }),
            ...(payload.map_scale_value != null && { mapScaleValue: payload.map_scale_value }),
            ...(payload.map_scale_unity != null && { mapScaleUnity: payload.map_scale_unity }),
            ...(payload.movement_adaptable_to_grid != null && { movementAdaptableToGrid: payload.movement_adaptable_to_grid }),
          }))
          if (payload.background_color) setBackgroundColorDraft(payload.background_color)
          if (payload.grid_color) setGridColorDraft(payload.grid_color)
          return
        }

        if (!isChatMessage && !isDiceRoll) {
          return
        }

        setChatMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            text: isDiceRoll ? formatDiceRoll(data.payload) : data.payload.message,
            userId: data.user_id,
            avatarUrl: roomUserProfilesRef.current[String(data.user_id)] ?? data.profilepic_image_url ?? null,
            isOwn: Number(data.user_id) === Number(currentUser?.id),
          },
        ])
      } catch (error) {
        console.error(error)
      }
    })

    socket.addEventListener('close', () => {
      setChatStatus('disconnected')
    })

    socket.addEventListener('error', () => {
      setChatStatus('disconnected')
    })

    return () => {
      socket.close()
      websocketRef.current = null
    }
  }, [currentUser?.id, room?.code])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [chatMessages, isChatOpen])

  useEffect(() => {
    const handleWindowResize = () => {
      setChatBox((current) => keepChatInsideScreen(current))
      setDiceMenuPosition((current) => keepDiceMenuInsideScreen(current))
      const measurePanel = document.querySelector('[data-measure-panel]')
      const panelWidth = measurePanel?.offsetWidth || Math.min(560, window.innerWidth - 24)
      setMeasurePanelPosition((current) => ({
        x: Math.max(8, Math.min(window.innerWidth - panelWidth - 8, current.x)),
        y: Math.max(8, Math.min(window.innerHeight - (measurePanel?.offsetHeight || 400) - 8, current.y)),
      }))
    }

    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [keepChatInsideScreen, keepDiceMenuInsideScreen])

  const handleWheel = (event) => {
    event.preventDefault()
    changeZoom(event.deltaY > 0 ? -1 : 1)
  }

  const handlePointerDown = (event) => {
    if (activeTool === 'draw') {
      if (event.button !== 0 || !event.target.closest?.('[data-tabletop]')) return
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (!point || currentPageIdRef.current == null) return
      event.preventDefault()
      event.stopPropagation()
      setSelectedTextId(null)
      selectedTextIdRef.current = null
      setSelectedTextIds([])
      selectedTextIdsRef.current = []
      setSelectedDrawingIds([])
      selectedDrawingIdsRef.current = []
      setSelectedAssetId(null)
      setSelectedAssetIds([])
      selectedAssetIdRef.current = null
      selectedAssetIdsRef.current = []
      drawDragRef.current = { pointerId: event.pointerId, points: [point], lastClientX: event.clientX, lastClientY: event.clientY, color: drawSettings.color, strokeWidth: drawSettings.strokeWidth, layer: workOnLayer }
      event.currentTarget.setPointerCapture(event.pointerId)
      setDrawPreview({ points: [point], color: drawSettings.color, strokeWidth: drawSettings.strokeWidth })
      return
    }
    if (activeTool === 'text') {
      if (event.button !== 0) return
      const existingText = event.target.closest?.('[data-text-id]')
      if (existingText) return
      if (!event.target.closest?.('[data-tabletop]')) return
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (!point || currentPageIdRef.current == null) return
      event.preventDefault()
      event.stopPropagation()
      const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const draft = { id: `draft-${clientId}`, client_id: clientId, page_id: currentPageIdRef.current, content: '', position_x: point.x, position_y: point.y, layer: workOnLayer, font_family: textSettings.fontFamily, font_size: textSettings.fontSize, color: textSettings.color, bold: textSettings.bold, italic: textSettings.italic }
      tabletopTextsRef.current = [...tabletopTextsRef.current, draft]
      setTabletopTexts((current) => [...current, draft])
      setSelectedTextId(draft.id)
      selectedTextIdRef.current = draft.id
      setSelectedTextIds([draft.id])
      selectedTextIdsRef.current = [draft.id]
      setEditingTextId(draft.id)
      return
    }
    if (activeTool === 'measure') {
      if (event.button !== 0) return
      if (!event.target.closest?.('[data-tabletop]')) return
      event.preventDefault()
      const bounds = tabletopRef.current.getBoundingClientRect()
      const point = snapMeasurePoint({ x: (event.clientX - bounds.left) / (zoom / 100), y: (event.clientY - bounds.top) / (zoom / 100) })
      const next = { ...point, endX: point.x, endY: point.y, shape: measureShape, userId: currentUser?.id, isDragging: true }
      measurementRef.current = next
      measureDragRef.current = { pointerId: event.pointerId, start: point }
      measureBroadcastRef.current = broadcastMeasure
      event.currentTarget.setPointerCapture(event.pointerId)
      setMeasurement(next)
      if (measureBroadcastRef.current) sendRoomMessage({ type: 'measure.update', page_id: currentPageIdRef.current, phase: 'start', x1: point.x, y1: point.y, x2: point.x, y2: point.y, shape: measureShape, keep: keepMeasure })
      return
    }
    const canPan = activeTool === 'move' ? event.button === 0 || event.button === 2 : event.button === 2
    if (!canPan) {
      return
    }

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    })
  }

  const startSelectionMarquee = (event) => {
    if (activeTool !== 'select') return
    if (event.button !== 0 || event.target.closest?.('[data-asset-id]') || event.target.closest?.('[data-text-id]') || event.target.closest?.('[data-drawing-id]')) return
    event.preventDefault()
    const bounds = tabletopFrameRef.current.getBoundingClientRect()
    marqueeRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, frameLeft: bounds.left, frameTop: bounds.top }
    marqueeCompletedRef.current = false
    tabletopFrameRef.current.setPointerCapture(event.pointerId)
    setSelectionMarquee({ left: event.clientX - bounds.left, top: event.clientY - bounds.top, width: 0, height: 0 })
  }

  const handlePointerMove = (event) => {
    if (drawDragRef.current?.pointerId === event.pointerId) {
      const active = drawDragRef.current
      const dx = event.clientX - active.lastClientX
      const dy = event.clientY - active.lastClientY
      if (dx * dx + dy * dy < 2.25) return
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (!point || active.points.length >= 5000) return
      active.points.push(point)
      active.lastClientX = event.clientX
      active.lastClientY = event.clientY
      setDrawPreview((current) => current ? { ...current, points: active.points.slice() } : current)
      return
    }
    if (drawingMoveRef.current?.pointerId === event.pointerId) {
      const active = drawingMoveRef.current
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (!point) return
      const dx = point.x - active.startX
      const dy = point.y - active.startY
      setTabletopDrawings((current) => current.map((item) => {
        const origin = active.items.find((entry) => entry.id === item.id)
        return origin ? { ...item, position_x: Math.max(0, origin.x + dx), position_y: Math.max(0, origin.y + dy) } : item
      }))
      return
    }
    if (textDragRef.current?.pointerId === event.pointerId) {
      const active = textDragRef.current
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (!point) return
      const dx = point.x - active.startX
      const dy = point.y - active.startY
      setTabletopTexts((current) => current.map((item) => {
        const origin = active.items.find((entry) => entry.id === item.id)
        return origin ? { ...item, position_x: Math.max(0, origin.originX + dx), position_y: Math.max(0, origin.originY + dy) } : item
      }))
      return
    }
    if (measureDragRef.current?.pointerId === event.pointerId) {
      const bounds = tabletopRef.current.getBoundingClientRect()
      const point = snapMeasurePoint({ x: (event.clientX - bounds.left) / (zoom / 100), y: (event.clientY - bounds.top) / (zoom / 100) })
      const next = { ...measurementRef.current, endX: point.x, endY: point.y, isDragging: true }
      measurementRef.current = next
      setMeasurement(next)
      if (measureBroadcastRef.current && Date.now() - lastMeasureBroadcastRef.current > 35) {
        lastMeasureBroadcastRef.current = Date.now()
        sendRoomMessage({ type: 'measure.update', page_id: currentPageIdRef.current, phase: 'update', x1: next.x, y1: next.y, x2: next.endX, y2: next.endY, shape: next.shape, keep: keepMeasure })
      }
      return
    }
    if (marqueeRef.current?.pointerId === event.pointerId) {
      const marquee = marqueeRef.current
      setSelectionMarquee({
        left: Math.min(marquee.startX, event.clientX) - marquee.frameLeft,
        top: Math.min(marquee.startY, event.clientY) - marquee.frameTop,
        width: Math.abs(event.clientX - marquee.startX),
        height: Math.abs(event.clientY - marquee.startY),
      })
      return
    }
    if (!drag || event.pointerId !== drag.pointerId) {
      return
    }

    setPan({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    })
  }

  const handlePointerUp = (event) => {
    if (drawDragRef.current?.pointerId === event.pointerId) {
      const active = drawDragRef.current
      drawDragRef.current = null
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (point) {
        const previous = active.points[active.points.length - 1]
        if (active.points.length < 5000 && (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 0.5)) active.points.push(point)
      }
      const xs = active.points.map((item) => item.x)
      const ys = active.points.map((item) => item.y)
      const minX = Math.min(...xs)
      const minY = Math.min(...ys)
      const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const drawing = {
        id: `draft-${clientId}`, client_id: clientId, page_id: currentPageIdRef.current,
        position_x: minX, position_y: minY,
        points: active.points.map((item) => ({ x: item.x - minX, y: item.y - minY })),
        color: active.color,
        stroke_width: active.strokeWidth,
        layer: active.layer,
      }
      setDrawPreview(null)
      if (active.points.length > 0) {
        tabletopDrawingsRef.current = [...tabletopDrawingsRef.current, drawing]
        setTabletopDrawings((current) => [...current, drawing])
        setSelectedDrawingIds([drawing.id])
        selectedDrawingIdsRef.current = [drawing.id]
        const sent = sendRoomMessage({ type: 'drawing.create', page_id: drawing.page_id, client_id: clientId, position_x: drawing.position_x, position_y: drawing.position_y, points: drawing.points, color: drawing.color, stroke_width: drawing.stroke_width, layer: drawing.layer })
        if (!sent) {
          setTabletopDrawings((current) => current.filter((item) => item.id !== drawing.id))
          tabletopDrawingsRef.current = tabletopDrawingsRef.current.filter((item) => item.id !== drawing.id)
          setSelectedDrawingIds([])
          selectedDrawingIdsRef.current = []
        }
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
      return
    }
    if (drawingMoveRef.current?.pointerId === event.pointerId) {
      const active = drawingMoveRef.current
      drawingMoveRef.current = null
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (point) {
        const dx = point.x - active.startX
        const dy = point.y - active.startY
        active.items.forEach((item) => {
          if (!String(item.id).startsWith('draft-')) sendRoomMessage({ type: 'drawing.move', page_id: currentPageIdRef.current, drawing_id: item.id, position_x: Math.max(0, item.x + dx), position_y: Math.max(0, item.y + dy) })
        })
      }
      return
    }
    if (textDragRef.current?.pointerId === event.pointerId) {
      const active = textDragRef.current
      textDragRef.current = null
      const point = getTabletopPoint(event.clientX, event.clientY)
      if (point) {
        const dx = point.x - active.startX
        const dy = point.y - active.startY
        active.items.forEach((item) => {
          if (!String(item.id).startsWith('draft-')) sendRoomMessage({ type: 'text.move', page_id: currentPageIdRef.current, text_id: item.id, x: Math.max(0, item.originX + dx), y: Math.max(0, item.originY + dy) })
        })
      }
      return
    }
    if (measureDragRef.current?.pointerId === event.pointerId) {
      const dragState = measureDragRef.current
      const bounds = tabletopRef.current.getBoundingClientRect()
      const point = snapMeasurePoint({ x: (event.clientX - bounds.left) / (zoom / 100), y: (event.clientY - bounds.top) / (zoom / 100) })
      const next = { ...measurementRef.current, endX: point.x, endY: point.y }
      measureDragRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
      if (!keepMeasure) {
        measurementRef.current = null
        setMeasurement(null)
      } else {
        const finishedMeasurement = { ...next, isDragging: false }
        measurementRef.current = finishedMeasurement
        setMeasurement(finishedMeasurement)
      }
      if (measureBroadcastRef.current) sendRoomMessage({ type: 'measure.update', page_id: currentPageIdRef.current, phase: 'end', x1: next.x, y1: next.y, x2: next.endX, y2: next.endY, shape: next.shape, keep: keepMeasure })
      measureBroadcastRef.current = false
      return
    }
    if (marqueeRef.current?.pointerId === event.pointerId) {
      const marquee = marqueeRef.current
      const left = Math.min(marquee.startX, event.clientX)
      const right = Math.max(marquee.startX, event.clientX)
      const top = Math.min(marquee.startY, event.clientY)
      const bottom = Math.max(marquee.startY, event.clientY)
      const selectedIds = [...tabletopRef.current.querySelectorAll('[data-asset-id]')]
        .filter((element) => {
          const bounds = element.getBoundingClientRect()
          return bounds.right >= left && bounds.left <= right && bounds.bottom >= top && bounds.top <= bottom
        })
        .map((element) => Number(element.dataset.assetId))
      const selectedTextIds = [...tabletopRef.current.querySelectorAll('[data-text-id]')]
        .filter((element) => {
          const bounds = element.getBoundingClientRect()
          return bounds.right >= left && bounds.left <= right && bounds.bottom >= top && bounds.top <= bottom
        })
        .map((element) => {
          const rawId = element.dataset.textId
          return /^\d+$/.test(rawId) ? Number(rawId) : rawId
        })
      const selectedDrawingIds = [...tabletopRef.current.querySelectorAll('[data-drawing-id]')]
        .filter((element) => {
          const bounds = element.getBoundingClientRect()
          return bounds.right >= left && bounds.left <= right && bounds.bottom >= top && bounds.top <= bottom
        })
        .map((element) => {
          const rawId = element.dataset.drawingId
          return /^\d+$/.test(rawId) ? Number(rawId) : rawId
        })
      marqueeCompletedRef.current = Math.abs(event.clientX - marquee.startX) > 4 || Math.abs(event.clientY - marquee.startY) > 4
      setSelectedAssetIds(selectedIds)
      selectedAssetIdsRef.current = selectedIds
      setSelectedAssetId(selectedIds[0] ?? null)
      selectedAssetIdRef.current = selectedIds[0] ?? null
      selectedTextIdsRef.current = selectedTextIds
      setSelectedTextIds(selectedTextIds)
      selectedTextIdRef.current = selectedTextIds[0] ?? null
      setSelectedTextId(selectedTextIds[0] ?? null)
      selectedDrawingIdsRef.current = selectedDrawingIds
      setSelectedDrawingIds(selectedDrawingIds)
      tabletopFrameRef.current.releasePointerCapture(event.pointerId)
      marqueeRef.current = null
      setSelectionMarquee(null)
      return
    }
    if (!drag || event.pointerId !== drag.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    setDrag(null)
  }

  const snapMeasurePoint = ({ x, y }) => {
    let snappedX = x
    let snappedY = y
    if (measureSnap === 'center') {
      snappedX = Math.floor(x / gridCellSize) * gridCellSize + gridCellSize / 2
      snappedY = Math.floor(y / gridCellSize) * gridCellSize + gridCellSize / 2
    } else if (measureSnap === 'corner') {
      snappedX = Math.round(x / gridCellSize) * gridCellSize
      snappedY = Math.round(y / gridCellSize) * gridCellSize
    }
    return {
      x: Math.max(0, Math.min(backgroundSettings.pageSizeX, snappedX)),
      y: Math.max(0, Math.min(backgroundSettings.pageSizeY, snappedY)),
    }
  }

  const startChatDrag = (event) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    chatDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: chatBox.x,
      originY: chatBox.y,
    }
  }

  const moveChatDrag = (event) => {
    const dragState = chatDragRef.current

    if (!dragState || event.pointerId !== dragState.pointerId) {
      return
    }

    setChatBox((current) => keepChatInsideScreen({
      ...current,
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY,
    }))
  }

  const stopChatDrag = (event) => {
    const dragState = chatDragRef.current

    if (!dragState || event.pointerId !== dragState.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    chatDragRef.current = null
  }

  const startChatResize = (event, direction) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    chatResizeRef.current = {
      pointerId: event.pointerId,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      origin: chatBox,
    }
  }

  const moveChatResize = (event) => {
    const resizeState = chatResizeRef.current

    if (!resizeState || event.pointerId !== resizeState.pointerId) {
      return
    }

    const deltaX = event.clientX - resizeState.startX
    const deltaY = event.clientY - resizeState.startY
    const nextBox = { ...resizeState.origin }

    if (resizeState.direction.includes('e')) {
      nextBox.width = resizeState.origin.width + deltaX
    }

    if (resizeState.direction.includes('s')) {
      nextBox.height = resizeState.origin.height + deltaY
    }

    if (resizeState.direction.includes('w')) {
      nextBox.width = resizeState.origin.width - deltaX
      nextBox.x = resizeState.origin.x + deltaX
    }

    if (resizeState.direction.includes('n')) {
      nextBox.height = resizeState.origin.height - deltaY
      nextBox.y = resizeState.origin.y + deltaY
    }

    setChatBox(keepChatInsideScreen(nextBox))
  }

  const stopChatResize = (event) => {
    const resizeState = chatResizeRef.current

    if (!resizeState || event.pointerId !== resizeState.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    chatResizeRef.current = null
  }

  const startDiceMenuDrag = (event) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    diceDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: diceMenuPosition.x,
      originY: diceMenuPosition.y,
    }
  }

  const startMeasurePanelDrag = (event) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    measurePanelDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, origin: measurePanelPosition }
  }
  const moveMeasurePanelDrag = (event) => {
    const dragState = measurePanelDragRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return
    const panel = event.currentTarget.closest('[data-measure-panel]')
    const width = panel?.offsetWidth || 420
    const height = panel?.offsetHeight || 400
    setMeasurePanelPosition({
      x: Math.max(8, Math.min(window.innerWidth - width - 8, dragState.origin.x + event.clientX - dragState.x)),
      y: Math.max(8, Math.min(window.innerHeight - height - 8, dragState.origin.y + event.clientY - dragState.y)),
    })
  }
  const stopMeasurePanelDrag = (event) => {
    if (measurePanelDragRef.current?.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    measurePanelDragRef.current = null
  }

  const moveDiceMenuDrag = (event) => {
    const dragState = diceDragRef.current

    if (!dragState || event.pointerId !== dragState.pointerId) {
      return
    }

    setDiceMenuPosition(keepDiceMenuInsideScreen({
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY,
    }))
  }

  const stopDiceMenuDrag = (event) => {
    const dragState = diceDragRef.current

    if (!dragState || event.pointerId !== dragState.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    diceDragRef.current = null
  }

  const sendChatMessage = () => {
    const text = chatDraft.trim()
    const socket = websocketRef.current

    if (!text || socket?.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(JSON.stringify({
      type: 'chat.message',
      message: text,
    }))
    setChatDraft('')
  }

  const sendDiceRoll = ({ quantity, sides, bonus = 0 }) => {
    const socket = websocketRef.current
    const result = {}

    if (socket?.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(JSON.stringify({
      type: 'dice.roll',
      quantity,
      sides,
      bonus,
      result,
    }))
  }

  const getTabletopPoint = (clientX, clientY) => {
    const tabletop = tabletopRef.current
    if (!tabletop) return null
    const bounds = tabletop.getBoundingClientRect()
    return {
      x: (clientX - bounds.left) / (bounds.width / backgroundSettings.pageSizeX),
      y: (clientY - bounds.top) / (bounds.height / backgroundSettings.pageSizeY),
    }
  }

  const persistText = (textId, changes) => {
    if (textId == null || String(textId).startsWith('draft-')) return false
    sendRoomMessage({ type: 'text.update', page_id: currentPageIdRef.current, text_id: textId, ...changes })
    return true
  }

  const finishTextEdit = (text) => {
    if (!text) return
    setEditingTextId(null)
    if (String(text.id).startsWith('draft-')) {
      if (!text.content.trim()) {
        setTabletopTexts((current) => current.filter((item) => item.id !== text.id))
        tabletopTextsRef.current = tabletopTextsRef.current.filter((item) => item.id !== text.id)
        return
      }
      if (text.pending_save) return
      const sent = sendRoomMessage({ type: 'text.create', page_id: currentPageIdRef.current, client_id: text.client_id, content: text.content, x: text.position_x, y: text.position_y, layer: text.layer, font_family: text.font_family, font_size: text.font_size, color: text.color, bold: text.bold, italic: text.italic })
      if (sent) {
        const pending = { ...text, pending_save: true }
        tabletopTextsRef.current = tabletopTextsRef.current.map((item) => item.id === text.id ? pending : item)
        setTabletopTexts((current) => current.map((item) => item.id === text.id ? pending : item))
      }
      return
    }
    if (!text.content.trim()) {
      sendRoomMessage({ type: 'text.delete', page_id: currentPageIdRef.current, text_id: text.id })
      setTabletopTexts((current) => current.filter((item) => item.id !== text.id))
      return
    }
    persistText(text.id, { content: text.content, font_family: text.font_family, font_size: text.font_size, color: text.color, bold: text.bold, italic: text.italic })
  }

  const changeTextSetting = (key, value) => {
    setTextSettings((current) => ({ ...current, [key]: value }))
    const selected = tabletopTexts.find((item) => item.id === selectedTextId)
    if (!selected) return
    const field = { fontFamily: 'font_family', fontSize: 'font_size', color: 'color', bold: 'bold', italic: 'italic' }[key]
    setTabletopTexts((current) => current.map((item) => item.id === selected.id ? { ...item, [field]: value } : item))
    if (!String(selected.id).startsWith('draft-')) persistText(selected.id, { [field]: value })
  }

  const startTextDrag = (event, text) => {
    if (activeTool !== 'select' || event.button !== 0 || editingTextId === text.id) return
    event.preventDefault()
    event.stopPropagation()
    const currentSelection = selectedTextIdsRef.current.includes(text.id) ? selectedTextIdsRef.current : [text.id]
    selectedTextIdsRef.current = currentSelection
    setSelectedTextIds(currentSelection)
    selectedTextIdRef.current = text.id
    setSelectedTextId(text.id)
    if (text.layer !== workOnLayer) return
    const point = getTabletopPoint(event.clientX, event.clientY)
    if (!point) return
    const movable = tabletopTexts.filter((item) => currentSelection.includes(item.id) && item.layer === workOnLayer)
    textDragRef.current = { pointerId: event.pointerId, items: movable.map((item) => ({ id: item.id, originX: Number(item.position_x) || 0, originY: Number(item.position_y) || 0 })), startX: point.x, startY: point.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleTokenDragStart = (event, asset) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-room-asset-id', String(asset.id))
    const image = event.currentTarget.querySelector('img')
    event.dataTransfer.setData('application/x-room-asset-size', JSON.stringify({
      width: image?.naturalWidth || asset.width || defaultTokenSize,
      height: image?.naturalHeight || asset.height || defaultTokenSize,
    }))
  }

  const handleTabletopDragOver = (event) => {
    if (event.dataTransfer.types.includes('application/x-room-asset-id')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const handleTabletopDrop = (event) => {
    event.preventDefault()
    const assetId = Number(event.dataTransfer.getData('application/x-room-asset-id'))
    const asset = tokens.find((token) => token.id === assetId)
    const point = getTabletopPoint(event.clientX, event.clientY)
    const tabletopBounds = tabletopRef.current?.getBoundingClientRect()
    if (!asset || !point || !tabletopBounds) return
    if (event.clientX < tabletopBounds.left || event.clientX > tabletopBounds.right || event.clientY < tabletopBounds.top || event.clientY > tabletopBounds.bottom) return

    const dragSize = (() => {
      try { return JSON.parse(event.dataTransfer.getData('application/x-room-asset-size') || '{}') }
      catch { return {} }
    })()
    let width = workOnLayer === 'map'
      ? Number((asset.layer === 'map' && asset.width) || dragSize.width || asset.width) || defaultTokenSize
      : defaultTokenSize
    let height = workOnLayer === 'map'
      ? Number((asset.layer === 'map' && asset.height) || dragSize.height || asset.height) || defaultTokenSize
      : defaultTokenSize
    if (backgroundSettings.movementAdaptableToGrid) {
      width = Math.max(gridCellSize, Math.ceil(width / gridCellSize) * gridCellSize)
      height = Math.max(gridCellSize, Math.ceil(height / gridCellSize) * gridCellSize)
    }
    const maxX = Math.max(0, backgroundSettings.pageSizeX - width)
    const maxY = Math.max(0, backgroundSettings.pageSizeY - height)
    const rawX = point.x - width / 2
    const rawY = point.y - height / 2
    const positionX = backgroundSettings.movementAdaptableToGrid
      ? Math.min(Math.floor(maxX / gridCellSize) * gridCellSize, Math.max(0, Math.round(rawX / gridCellSize) * gridCellSize))
      : Math.max(0, Math.min(maxX, rawX))
    const positionY = backgroundSettings.movementAdaptableToGrid
      ? Math.min(Math.floor(maxY / gridCellSize) * gridCellSize, Math.max(0, Math.round(rawY / gridCellSize) * gridCellSize))
      : Math.max(0, Math.min(maxY, rawY))
    const layerOrder = getLayerAssets(tabletopAssets, workOnLayer).length
    const assetData = {
      position_x: String(positionX),
      position_y: String(positionY),
      width: String(width),
      height: String(height),
      layer: workOnLayer,
      layer_order: layerOrder,
    }
    if (!sendRoomMessage({ type: 'asset.insert', page_id: currentPageIdRef.current, asset_id: asset.id, asset_data: assetData })) return
    const currentPlacement = tabletopAssets.find((item) => item.id === asset.id && item.layer != null)
    setTabletopAssets((current) => {
      const alreadyOnTable = current.some((item) => item.id === asset.id)
      return alreadyOnTable
        ? current.map((item) => item.id === asset.id ? { ...item, ...assetData } : item)
        : [...current, { ...asset, ...assetData }]
    })
    undoHistoryRef.current.push(currentPlacement
      ? { type: 'restore-placement', asset: tabletopAssetFields(currentPlacement) }
      : { type: 'remove-placement', assetId: asset.id })
    selectedAssetIdRef.current = asset.id
    setSelectedAssetId(asset.id)
    setSelectedAssetIds([asset.id])
    selectedAssetIdsRef.current = [asset.id]
  }

  const sendPageAction = (message) => sendRoomMessage(message)
  const startPageDrag = (event, page) => {
    event.dataTransfer.setData('application/x-room-page-id', String(page.id))
    event.dataTransfer.effectAllowed = 'move'
  }
  const dropPageIntoFolder = (event, folderId) => {
    event.preventDefault()
    const pageId = Number(event.dataTransfer.getData('application/x-room-page-id'))
    if (!pageId || !isRoomMaster) return
    sendPageAction({ type: 'page.move', page_id: pageId, folder_id: folderId })
  }
  const visiblePages = pages.filter((page) => page.name.toLowerCase().includes(pageSearch.trim().toLowerCase()))
  const renamePage = (pageId, name) => {
    if (name.trim()) sendPageAction({ type: 'page.rename', page_id: pageId, name: name.trim() })
    setRenamingPageId(null)
  }
  const renameFolder = (folderId, name) => {
    if (name.trim()) sendPageAction({ type: 'folder.rename', folder_id: folderId, name: name.trim() })
    setRenamingFolderId(null)
  }
  const publishPage = (pageId) => {
    if (!isRoomMaster || !sendPageAction({ type: 'page.set_active', page_id: pageId })) return
    setPlayersPageId(pageId)
    setPages((current) => current.map((page) => ({ ...page, is_players_page: page.id === pageId })))
    loadTabletopPage(pageId).catch((error) => console.error('Não foi possível abrir a page.', error))
  }

  const constrainAssetPosition = (value, maxValue) => {
    const max = Math.max(0, maxValue)
    if (!backgroundSettings.movementAdaptableToGrid) return Math.max(0, Math.min(max, value))
    return Math.max(0, Math.min(Math.floor(max / gridCellSize) * gridCellSize, Math.round(value / gridCellSize) * gridCellSize))
  }

  const startAssetDrag = (event, asset) => {
    if (activeTool !== 'select') return
    if (event.button !== 0) return
    selectedAssetIdRef.current = asset.id
    const currentSelection = selectedAssetIds.includes(asset.id) ? selectedAssetIds : [asset.id]
    setSelectedAssetId(asset.id)
    setSelectedAssetIds(currentSelection)
    selectedAssetIdsRef.current = currentSelection
    if (asset.layer !== workOnLayer) return
    if (measureTokenMovement) {
      const startX = (Number(asset.position_x) || 0) + (Number(asset.width) || defaultTokenSize) / 2
      const startY = (Number(asset.position_y) || 0) + (Number(asset.height) || defaultTokenSize) / 2
      setMeasurement({ x: startX, y: startY, endX: startX, endY: startY, shape: 'line', isDragging: true })
      assetMeasureRef.current = true
      if (broadcastMeasure) sendRoomMessage({ type: 'measure.update', page_id: currentPageIdRef.current, phase: 'start', x1: startX, y1: startY, x2: startX, y2: startY, shape: 'line' })
    }
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingAssetId(asset.id)
    const movableAssets = tabletopAssets.filter((item) => currentSelection.includes(item.id) && item.layer === workOnLayer)
    assetDragRef.current = {
      pointerId: event.pointerId,
      assetId: asset.id,
      assets: movableAssets.map((item) => ({
        id: item.id,
        originX: Number(item.position_x) || 0,
        originY: Number(item.position_y) || 0,
        width: Number(item.width) || defaultTokenSize,
        height: Number(item.height) || defaultTokenSize,
      })),
      startX: event.clientX,
      startY: event.clientY,
      originX: Number(asset.position_x) || 0,
      originY: Number(asset.position_y) || 0,
      width: Number(asset.width) || defaultTokenSize,
      height: Number(asset.height) || defaultTokenSize,
    }
  }

  const moveAssetDrag = (event) => {
    const activeDrag = assetDragRef.current
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return
    const scale = zoom / 100
    const dx = (event.clientX - activeDrag.startX) / scale
    const dy = (event.clientY - activeDrag.startY) / scale
    if (assetMeasureRef.current) {
      const next = { x: activeDrag.originX + activeDrag.width / 2, y: activeDrag.originY + activeDrag.height / 2, endX: activeDrag.originX + activeDrag.width / 2 + dx, endY: activeDrag.originY + activeDrag.height / 2 + dy, shape: 'line' }
      setMeasurement(next)
      if (broadcastMeasure && Date.now() - lastMeasureBroadcastRef.current > 35) {
        lastMeasureBroadcastRef.current = Date.now()
        sendRoomMessage({ type: 'measure.update', page_id: currentPageIdRef.current, phase: 'update', x1: next.x, y1: next.y, x2: next.endX, y2: next.endY, shape: 'line' })
      }
    }
    const bounds = activeDrag.assets.reduce((result, item) => ({
      minX: Math.min(result.minX, item.originX), minY: Math.min(result.minY, item.originY),
      maxX: Math.max(result.maxX, item.originX + item.width), maxY: Math.max(result.maxY, item.originY + item.height),
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
    const moveX = constrainAssetPosition(bounds.minX + dx, backgroundSettings.pageSizeX - (bounds.maxX - bounds.minX)) - bounds.minX
    const moveY = constrainAssetPosition(bounds.minY + dy, backgroundSettings.pageSizeY - (bounds.maxY - bounds.minY)) - bounds.minY
    setTabletopAssets((current) => current.map((asset) => {
      const origin = activeDrag.assets.find((item) => item.id === asset.id)
      return origin ? { ...asset, position_x: String(origin.originX + moveX), position_y: String(origin.originY + moveY) } : asset
    }))
  }

  const stopAssetDrag = (event) => {
    const activeDrag = assetDragRef.current
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    assetDragRef.current = null
    setDraggingAssetId(null)
    const scale = zoom / 100
    const dx = (event.clientX - activeDrag.startX) / scale
    const dy = (event.clientY - activeDrag.startY) / scale
    if (assetMeasureRef.current) {
      const next = { x: activeDrag.originX + activeDrag.width / 2, y: activeDrag.originY + activeDrag.height / 2, endX: activeDrag.originX + activeDrag.width / 2 + dx, endY: activeDrag.originY + activeDrag.height / 2 + dy, shape: 'line' }
      if (broadcastMeasure) sendRoomMessage({ type: 'measure.update', page_id: currentPageIdRef.current, phase: 'end', x1: next.x, y1: next.y, x2: next.endX, y2: next.endY, shape: 'line' })
      setMeasurement(null)
      assetMeasureRef.current = false
    }
    const bounds = activeDrag.assets.reduce((result, item) => ({
      minX: Math.min(result.minX, item.originX), minY: Math.min(result.minY, item.originY),
      maxX: Math.max(result.maxX, item.originX + item.width), maxY: Math.max(result.maxY, item.originY + item.height),
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
    const moveX = constrainAssetPosition(bounds.minX + dx, backgroundSettings.pageSizeX - (bounds.maxX - bounds.minX)) - bounds.minX
    const moveY = constrainAssetPosition(bounds.minY + dy, backgroundSettings.pageSizeY - (bounds.maxY - bounds.minY)) - bounds.minY
    const socket = websocketRef.current
    if (socket?.readyState === WebSocket.OPEN) {
      const moved = activeDrag.assets.filter((item) => item.originX + moveX !== item.originX || item.originY + moveY !== item.originY)
      if (moved.length) {
        undoHistoryRef.current.push({ type: 'move-group', assets: moved.map((item) => ({ id: item.id, x: String(item.originX), y: String(item.originY) })) })
      }
      setTabletopAssets((current) => current.map((asset) => {
        const origin = activeDrag.assets.find((item) => item.id === asset.id)
        return origin ? { ...asset, position_x: String(origin.originX + moveX), position_y: String(origin.originY + moveY) } : asset
      }))
      activeDrag.assets.forEach((item) => socket.send(JSON.stringify({ type: 'asset.move', page_id: currentPageIdRef.current, asset_id: item.id, x: String(item.originX + moveX), y: String(item.originY + moveY) })))
    } else {
      setTabletopAssets((current) => current.map((asset) => {
        const origin = activeDrag.assets.find((item) => item.id === asset.id)
        return origin ? { ...asset, position_x: String(origin.originX), position_y: String(origin.originY) } : asset
      }))
      setTokensError('A conexão com a sala caiu. A movimentação não foi salva.')
    }
  }

  const calculateAssetResize = (event, activeResize) => {
    if (activeResize.members) {
      const deltaX = (event.clientX - activeResize.startX) / (zoom / 100)
      const deltaY = (event.clientY - activeResize.startY) / (zoom / 100)
      const { direction, originX, originY, originWidth, originHeight } = activeResize
      let width = originWidth
      let height = originHeight
      if (direction.includes('e')) width += deltaX
      if (direction.includes('w')) width -= deltaX
      if (direction.includes('s')) height += deltaY
      if (direction.includes('n')) height -= deltaY
      if (direction.length === 2) {
        const factor = Math.max(0.1, 1 + ((width / originWidth - 1) + (height / originHeight - 1)) / 2)
        width = originWidth * factor
        height = originHeight * factor
      }
      width = Math.max(20, Math.min(width, backgroundSettings.pageSizeX))
      height = Math.max(20, Math.min(height, backgroundSettings.pageSizeY))
      let x = direction.includes('w') ? originX + originWidth - width : originX
      let y = direction.includes('n') ? originY + originHeight - height : originY
      const clampedX = constrainAssetPosition(x, backgroundSettings.pageSizeX - width)
      const clampedY = constrainAssetPosition(y, backgroundSettings.pageSizeY - height)
      const scaleX = width / originWidth
      const scaleY = height / originHeight
      return activeResize.members.map((member) => ({
        id: member.id,
        x: clampedX + (member.x - originX) * scaleX,
        y: clampedY + (member.y - originY) * scaleY,
        width: member.width * scaleX,
        height: member.height * scaleY,
      }))
    }
    const scale = zoom / 100
    const deltaX = (event.clientX - activeResize.startX) / scale
    const deltaY = (event.clientY - activeResize.startY) / scale
    const { direction, originX, originY, originWidth, originHeight } = activeResize
    let width = originWidth
    let height = originHeight
    let x = originX
    let y = originY
    const horizontal = direction.includes('e') ? deltaX : direction.includes('w') ? -deltaX : 0
    const vertical = direction.includes('s') ? deltaY : direction.includes('n') ? -deltaY : 0

    if (direction.length === 2) {
      const proportionalChange = (horizontal / originWidth + vertical / originHeight) / 2
      const factor = Math.max(0.1, 1 + proportionalChange)
      width = originWidth * factor
      height = originHeight * factor
    } else if (direction === 'e' || direction === 'w') {
      width = originWidth + horizontal
    } else {
      height = originHeight + vertical
    }

    if (backgroundSettings.movementAdaptableToGrid) {
      width = Math.max(gridCellSize, Math.round(width / gridCellSize) * gridCellSize)
      height = Math.max(gridCellSize, Math.round(height / gridCellSize) * gridCellSize)
    } else {
      width = Math.max(20, width)
      height = Math.max(20, height)
    }
    width = Math.min(width, backgroundSettings.pageSizeX)
    height = Math.min(height, backgroundSettings.pageSizeY)

    if (direction.includes('w')) x = originX + originWidth - width
    if (direction.includes('n')) y = originY + originHeight - height
    x = constrainAssetPosition(x, backgroundSettings.pageSizeX - width)
    y = constrainAssetPosition(y, backgroundSettings.pageSizeY - height)
    return { x, y, width, height }
  }

  const startAssetResize = (event, asset, direction) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedAssetId(asset.id)
    setSelectedAssetIds([asset.id])
    selectedAssetIdsRef.current = [asset.id]
    if (asset.layer !== workOnLayer) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const originWidth = Number(asset.width) || defaultTokenSize
    const originHeight = Number(asset.height) || defaultTokenSize
    assetResizeRef.current = {
      pointerId: event.pointerId,
      captureTarget: event.currentTarget,
      assetId: asset.id,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      originX: Number(asset.position_x) || 0,
      originY: Number(asset.position_y) || 0,
      originWidth,
      originHeight,
    }
    setResizingAssetId(asset.id)
  }

  const startGroupResize = (event, direction, members, bounds) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    assetResizeRef.current = {
      pointerId: event.pointerId,
      captureTarget: event.currentTarget,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      originX: bounds.x,
      originY: bounds.y,
      originWidth: bounds.width,
      originHeight: bounds.height,
      members: members.map((asset) => ({
        id: asset.id,
        x: Number(asset.position_x) || 0,
        y: Number(asset.position_y) || 0,
        width: Number(asset.width) || defaultTokenSize,
        height: Number(asset.height) || defaultTokenSize,
      })),
    }
    setResizingAssetId('group')
  }

  const handleAssetPointerMove = (event) => {
    const activeResize = assetResizeRef.current
    if (activeResize?.pointerId === event.pointerId) {
      const sizes = calculateAssetResize(event, activeResize)
      setTabletopAssets((current) => current.map((asset) => {
        const size = activeResize.members ? sizes.find((item) => item.id === asset.id) : (asset.id === activeResize.assetId ? sizes : null)
        return size ? { ...asset, position_x: String(size.x), position_y: String(size.y), width: String(size.width), height: String(size.height) } : asset
      }))
      return
    }
    moveAssetDrag(event)
  }

  const finishAssetResize = (event) => {
    const activeResize = assetResizeRef.current
    if (!activeResize || activeResize.pointerId !== event.pointerId) return
    activeResize.captureTarget.releasePointerCapture(event.pointerId)
    assetResizeRef.current = null
    setResizingAssetId(null)
    const sizes = calculateAssetResize(event, activeResize)
    const socket = websocketRef.current
    if (socket?.readyState !== WebSocket.OPEN) {
      setTabletopAssets((current) => current.map((asset) => {
        const member = activeResize.members?.find((item) => item.id === asset.id)
        const revert = activeResize.members ? member && { x: member.x, y: member.y, width: member.width, height: member.height } : asset.id === activeResize.assetId ? { x: activeResize.originX, y: activeResize.originY, width: activeResize.originWidth, height: activeResize.originHeight } : null
        return revert ? { ...asset, position_x: String(revert.x), position_y: String(revert.y), width: String(revert.width), height: String(revert.height) } : asset
      }))
      setRoomSyncError('A conexão com a sala caiu. O redimensionamento não foi salvo.')
      return
    }
    const originalMembers = activeResize.members || [{ id: activeResize.assetId, x: activeResize.originX, y: activeResize.originY, width: activeResize.originWidth, height: activeResize.originHeight }]
    const resized = activeResize.members ? sizes : [{ ...sizes, id: activeResize.assetId }]
    setTabletopAssets((current) => current.map((asset) => {
      const size = resized.find((item) => item.id === asset.id)
      return size ? { ...asset, position_x: String(size.x), position_y: String(size.y), width: String(size.width), height: String(size.height) } : asset
    }))
    const changed = resized.filter((size) => {
      const original = originalMembers.find((item) => item.id === size.id)
      return original && (size.x !== original.x || size.y !== original.y || size.width !== original.width || size.height !== original.height)
    })
    if (changed.length) {
      undoHistoryRef.current.push({ type: 'resize-group', assets: changed.map((size) => {
        const original = originalMembers.find((item) => item.id === size.id)
        return { id: size.id, x: String(original.x), y: String(original.y), width: String(original.width), height: String(original.height) }
      }) })
    }
    resized.forEach((size) => {
      sendRoomMessage({ type: 'asset.change_size', page_id: currentPageIdRef.current, asset_id: size.id, width: String(size.width), height: String(size.height) })
      if (size.x !== originalMembers.find((item) => item.id === size.id)?.x || size.y !== originalMembers.find((item) => item.id === size.id)?.y) {
        sendRoomMessage({ type: 'asset.move', page_id: currentPageIdRef.current, asset_id: size.id, x: String(size.x), y: String(size.y) })
      }
    })
  }

  const handleAssetPointerUp = (event) => {
    if (assetResizeRef.current?.pointerId === event.pointerId) finishAssetResize(event)
    else stopAssetDrag(event)
  }

  const handleAdvancedRollChange = (field, value) => {
    setAdvancedRoll((current) => ({
      ...current,
      [field]: field === 'sides'
        ? Number(value)
        : Math.max(0, Number(value) || 0),
    }))
  }

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendChatMessage()
    }
  }

  const renderResizeHandle = (direction) => (
    <span
      key={direction}
      className={cx('chatResizeHandle', `chatResizeHandle-${direction}`)}
      aria-hidden="true"
      onPointerDown={(event) => startChatResize(event, direction)}
      onPointerMove={moveChatResize}
      onPointerUp={stopChatResize}
      onPointerCancel={stopChatResize}
    />
  )

  const selectedMovableAssets = tabletopAssets.filter((asset) => selectedAssetIds.includes(asset.id) && asset.layer === workOnLayer && asset.position_x != null && asset.position_y != null)
  const selectedGroupBounds = selectedMovableAssets.length > 1 ? selectedMovableAssets.reduce((bounds, asset) => {
    const x = Number(asset.position_x) || 0
    const y = Number(asset.position_y) || 0
    const width = Number(asset.width) || defaultTokenSize
    const height = Number(asset.height) || defaultTokenSize
    const left = Math.min(bounds.left, x)
    const top = Math.min(bounds.top, y)
    const right = Math.max(bounds.right, x + width)
    const bottom = Math.max(bounds.bottom, y + height)
    return { left, top, right, bottom, x: left, y: top, width: right - left, height: bottom - top }
  }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }) : null

  return (
    <main className={s.roomPage} onContextMenu={(event) => event.preventDefault()}>
      <IconButton
        className={s.chatButton}
        label="Chat"
        icon="chat"
        pressed={isChatOpen}
        onClick={() => {
          if (!isChatOpen) setChatBox((current) => keepChatInsideScreen(current))
          setIsChatOpen((current) => !current)
        }}
      />

      <section
        ref={tabletopFrameRef}
        className={cx('tabletopFrame', { isPanning: Boolean(drag), selectToolActive: activeTool === 'select', moveToolActive: activeTool === 'move', measureToolActive: activeTool === 'measure', textToolActive: activeTool === 'text', drawToolActive: activeTool === 'draw' })}
        aria-label="Tabletop"
        data-tabletop-frame
        onWheel={handleWheel}
        onPointerDown={(event) => { handlePointerDown(event); startSelectionMarquee(event) }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragOver={handleTabletopDragOver}
        onDrop={handleTabletopDrop}
        onClick={(event) => {
          if (activeTool !== 'select') return
          if (event.target === tabletopRef.current || event.target === tabletopFrameRef.current) {
            if (marqueeCompletedRef.current) {
              marqueeCompletedRef.current = false
              return
            }
            setSelectedAssetId(null)
            setSelectedAssetIds([])
            selectedAssetIdsRef.current = []
            selectedAssetIdRef.current = null
            setSelectedTextId(null)
            selectedTextIdRef.current = null
            setSelectedTextIds([])
            selectedTextIdsRef.current = []
            setSelectedDrawingIds([])
            selectedDrawingIdsRef.current = []
          }
        }}
      >
        {selectionMarquee && <div className={s.selectionMarquee} style={selectionMarquee} aria-hidden="true" />}
        <div ref={tabletopRef} className={s.tabletop} data-tabletop style={gridStyle}>
          {drawPreview && drawPreview.points.length > 0 && <svg className={s.drawPreview} viewBox={`0 0 ${backgroundSettings.pageSizeX} ${backgroundSettings.pageSizeY}`} aria-hidden="true">
            <path d={drawingPath(drawPreview.points)} fill="none" stroke={drawPreview.color} strokeWidth={drawPreview.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            {drawPreview.points.length === 1 && <circle cx={drawPreview.points[0].x} cy={drawPreview.points[0].y} r={drawPreview.strokeWidth / 2} fill={drawPreview.color} />}
          </svg>}
          {measurement && (() => {
            const dx = measurement.endX - measurement.x
            const dy = measurement.endY - measurement.y
            const distance = Math.hypot(dx, dy)
            const angle = Math.atan2(dy, dx)
            const value = distance / gridCellSize * Number(backgroundSettings.mapScaleValue || 0)
            const label = `${Number(value.toFixed(2))} ${backgroundSettings.mapScaleUnity === 'meters' ? 'm' : backgroundSettings.mapScaleUnity === 'kilometers' ? 'km' : backgroundSettings.mapScaleUnity === 'miles' ? 'mi' : 'ft'}`
            const labelX = measurement.endX
            const labelY = measurement.isDragging ? Math.max(18, measurement.endY - 28) : measurement.endY
            const normalX = distance ? -dy / distance : 0
            const normalY = distance ? dx / distance : 0
            const halfWidth = distance / 2
            const shapePath = measurement.shape === 'square'
              ? `M ${measurement.x + normalX * halfWidth} ${measurement.y + normalY * halfWidth} L ${measurement.endX + normalX * halfWidth} ${measurement.endY + normalY * halfWidth} L ${measurement.endX - normalX * halfWidth} ${measurement.endY - normalY * halfWidth} L ${measurement.x - normalX * halfWidth} ${measurement.y - normalY * halfWidth} Z`
              : measurement.shape === 'cone'
                ? `M ${measurement.x} ${measurement.y} L ${measurement.x + distance * Math.cos(angle - Math.PI / 6)} ${measurement.y + distance * Math.sin(angle - Math.PI / 6)} A ${distance} ${distance} 0 0 1 ${measurement.x + distance * Math.cos(angle + Math.PI / 6)} ${measurement.y + distance * Math.sin(angle + Math.PI / 6)} Z`
                : null
            return <svg className={s.measureOverlay} viewBox={`0 0 ${backgroundSettings.pageSizeX} ${backgroundSettings.pageSizeY}`} aria-hidden="true">
              <defs><marker id="measure-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#111" /></marker></defs>
              {measurement.shape === 'circle' && <circle cx={measurement.x} cy={measurement.y} r={distance} className={s.measureArea} />}
              {shapePath && <path d={shapePath} className={s.measureArea} />}
              <line x1={measurement.x} y1={measurement.y} x2={measurement.endX} y2={measurement.endY} className={s.measureLine} markerEnd="url(#measure-arrow)" />
              <circle cx={measurement.x} cy={measurement.y} r="4" className={s.measureOrigin} />
              <circle cx={labelX} cy={labelY} r="16" className={s.measureLabelBg} />
              <text x={labelX} y={labelY + 4} className={s.measureLabel}>{label}</text>
            </svg>
          })()}
          {tabletopAssets.filter((asset) => asset.position_x != null && asset.position_y != null).map((asset) => {
            const width = Number(asset.width) || defaultTokenSize
            const height = Number(asset.height) || defaultTokenSize
            const isSelected = selectedAssetIds.includes(asset.id) || selectedAssetId === asset.id
            const canEdit = asset.layer === workOnLayer
            const orderedLayerAssets = getLayerAssets(tabletopAssets, asset.layer)
            const layerPosition = orderedLayerAssets.findIndex((item) => item.id === asset.id)
            const layerBase = { map: 1000, master: 100000, players: 200000 }[asset.layer] || 0
            return (
              <div
                key={asset.id}
                className={cx('tabletopAsset', {
                  assetDragging: draggingAssetId === asset.id,
                  assetResizing: resizingAssetId === asset.id,
                  assetSelected: isSelected,
                  assetMapLayer: asset.layer === 'map',
                })}
                style={{
                  left: `${asset.position_x}px`,
                  top: `${asset.position_y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  zIndex: layerBase + orderedLayerAssets.length - layerPosition,
                  opacity: asset.layer === 'master' ? 0.48 : 1,
                  display: asset.visible === false ? 'none' : undefined,
                  cursor: canEdit ? 'grab' : 'default',
                }}
                data-asset-id={asset.id}
                onClick={(event) => {
                  if (activeTool !== 'select') return
                  event.stopPropagation()
                  selectedAssetIdRef.current = asset.id
                  setSelectedAssetId(asset.id)
                  if (!selectedAssetIds.includes(asset.id)) {
                    setSelectedAssetIds([asset.id])
                    selectedAssetIdsRef.current = [asset.id]
                  }
                }}
                onPointerDown={(event) => startAssetDrag(event, asset)}
                onPointerMove={handleAssetPointerMove}
                onPointerUp={handleAssetPointerUp}
                onPointerCancel={handleAssetPointerUp}
                onContextMenu={(event) => {
                  if (asset.layer !== 'map') return
                  event.preventDefault()
                  event.stopPropagation()
                  setMapContextMenu({
                    asset,
                    x: Math.max(8, Math.min(event.clientX, window.innerWidth - 230)),
                    y: Math.max(8, Math.min(event.clientY, window.innerHeight - 70)),
                  })
                }}
              >
                <img className={s.tabletopAssetImage} src={asset.asset_image_url} alt={asset.asset_image_file_name || 'Token'} draggable="false" />
                {isSelected && <span className={s.assetSelectionBorder} aria-hidden="true" />}
                {isSelected && canEdit && selectedMovableAssets.length <= 1 && ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((direction) => (
                  <span
                    key={direction}
                    className={cx('assetResizeHandle', `assetResizeHandle-${direction}`)}
                    aria-label={`Redimensionar token ${direction}`}
                    onPointerDown={(event) => startAssetResize(event, asset, direction)}
                  />
                ))}
              </div>
            )
          })}
          {tabletopTexts.filter((item) => item.layer !== 'master' || isRoomMaster).map((item) => (
            <div
              key={item.id}
              className={cx('tabletopText', { tabletopTextSelected: selectedTextIds.includes(item.id) || selectedTextId === item.id })}
              style={{ left: `${item.position_x}px`, top: `${item.position_y}px`, zIndex: item.layer === 'master' ? 250000 : item.layer === 'map' ? 150000 : 250000, color: item.color, fontFamily: item.font_family, fontSize: `${item.font_size}px`, fontWeight: item.bold ? 700 : 400, fontStyle: item.italic ? 'italic' : 'normal' }}
              data-text-id={item.id}
              onPointerDown={(event) => {
                  if (activeTool === 'text') { event.preventDefault(); event.stopPropagation(); setSelectedTextId(item.id); selectedTextIdRef.current = item.id; setSelectedTextIds([item.id]); selectedTextIdsRef.current = [item.id]; setEditingTextId(item.id); setTextSettings({ fontFamily: item.font_family, fontSize: item.font_size, color: item.color, bold: item.bold, italic: item.italic }); return }
                startTextDrag(event, item)
              }}
            >
              {editingTextId === item.id
                ? <textarea autoFocus rows={Math.max(1, (item.content || '').split('\n').length)} value={item.content} placeholder="Digite o texto" onChange={(event) => {
                  const updated = tabletopTextsRef.current.map((text) => text.id === item.id ? { ...text, content: event.target.value, font_family: textSettings.fontFamily, font_size: textSettings.fontSize, color: textSettings.color, bold: textSettings.bold, italic: textSettings.italic } : text)
                  tabletopTextsRef.current = updated
                  setTabletopTexts(updated)
                }} onBlur={() => finishTextEdit(tabletopTextsRef.current.find((text) => text.id === item.id))} onKeyDown={(event) => { event.stopPropagation(); if (event.key === 'Escape') event.currentTarget.blur() }} />
                : <span>{item.content}</span>}
            </div>
          ))}
          {tabletopDrawings.filter((item) => item.layer !== 'master' || isRoomMaster).map((drawing) => {
            const points = drawing.points || []
            const padding = Math.max(7, (Number(drawing.stroke_width) || 4) / 2)
            const contentWidth = Math.max(1, ...points.map((point) => Number(point.x) || 0))
            const contentHeight = Math.max(1, ...points.map((point) => Number(point.y) || 0))
            const width = contentWidth + padding * 2
            const height = contentHeight + padding * 2
            const selected = selectedDrawingIds.includes(drawing.id)
            return <svg
              key={drawing.id}
              className={cx('tabletopDrawing', { tabletopDrawingSelected: selected })}
              data-drawing-id={drawing.id}
              viewBox={`0 0 ${width} ${height}`}
              style={{ left: `${Number(drawing.position_x) - padding}px`, top: `${Number(drawing.position_y) - padding}px`, width: `${width}px`, height: `${height}px`, zIndex: drawing.layer === 'master' ? 290000 : drawing.layer === 'map' ? 180000 : 280000, overflow: 'visible' }}
              aria-label="Desenho no tabletop"
              onPointerDown={(event) => {
                if (activeTool !== 'select' || event.button !== 0) return
                event.preventDefault()
                event.stopPropagation()
                const selection = selectedDrawingIdsRef.current.includes(drawing.id) ? selectedDrawingIdsRef.current : [drawing.id]
                selectedDrawingIdsRef.current = selection
                setSelectedDrawingIds(selection)
                if (drawing.layer !== workOnLayer) return
                const point = getTabletopPoint(event.clientX, event.clientY)
                if (!point) return
                const movable = tabletopDrawings.filter((item) => selection.includes(item.id) && item.layer === workOnLayer)
                drawingMoveRef.current = { pointerId: event.pointerId, startX: point.x, startY: point.y, items: movable.map((item) => ({ id: item.id, x: Number(item.position_x) || 0, y: Number(item.position_y) || 0 })) }
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
            >
              {selected && <rect className={s.drawingSelectionBorder} x="1" y="1" width={Math.max(0, width - 2)} height={Math.max(0, height - 2)} />}
              <path d={drawingPath(points, padding)} fill="none" stroke={drawing.color} strokeWidth={drawing.stroke_width} strokeLinecap="round" strokeLinejoin="round" />
              <path d={drawingPath(points, padding)} fill="none" stroke="transparent" strokeWidth={Math.max(12, Number(drawing.stroke_width) || 4)} pointerEvents="stroke" />
              {points.length === 1 && <circle cx={Number(points[0].x) + padding} cy={Number(points[0].y) + padding} r={Number(drawing.stroke_width) / 2} fill={drawing.color} />}
            </svg>
          })}
          {backgroundSettings.visibleGrid && <div
            className={s.tabletopGridOverlay}
            style={{
              zIndex: 1001 + getLayerAssets(tabletopAssets, 'map').length,
              backgroundImage: `linear-gradient(${backgroundSettings.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${backgroundSettings.gridColor} 1px, transparent 1px)`,
              backgroundSize: `${gridCellSize}px ${gridCellSize}px`,
              backgroundPosition: '-1px -1px',
              opacity: Math.max(0, Math.min(100, Number(backgroundSettings.gridOpacity))) / 100,
            }}
            aria-hidden="true"
          />}
          {selectedGroupBounds && <div
            className={s.assetGroupSelection}
            style={{ left: selectedGroupBounds.x, top: selectedGroupBounds.y, width: selectedGroupBounds.width, height: selectedGroupBounds.height }}
            aria-label={`${selectedMovableAssets.length} tokens selecionados`}
            onPointerMove={handleAssetPointerMove}
            onPointerUp={handleAssetPointerUp}
            onPointerCancel={handleAssetPointerUp}
          >
            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((direction) => <span
              key={direction}
              className={cx('assetResizeHandle', `assetResizeHandle-${direction}`)}
              onPointerDown={(event) => startGroupResize(event, direction, selectedMovableAssets, selectedGroupBounds)}
            />)}
          </div>}
        </div>
        {mapContextMenu && <div
          className={s.mapContextMenu}
          data-map-context-menu
          style={{ left: mapContextMenu.x, top: mapContextMenu.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button type="button" onClick={() => {
            fitTabletopToMap(mapContextMenu.asset)
            setMapContextMenu(null)
          }}>
            Ajustar tabletop a este mapa
          </button>
        </div>}
      </section>

      <aside className={s.zoomControl} aria-label="Zoom controls">
        <button type="button" aria-label="Zoom out" onClick={() => changeZoom(-1)}>-</button>
        <span>{zoom}%</span>
        <button type="button" aria-label="Zoom in" onClick={() => changeZoom(1)}>+</button>
      </aside>

      {isChatOpen && (
        <section
          className={s.chatPanel}
          aria-label="Room chat"
          style={{
            transform: `translate(${chatBox.x}px, ${chatBox.y}px)`,
            width: `${chatBox.width}px`,
            height: `${chatBox.height}px`,
          }}
        >
          <header
            className={s.chatHeader}
            onPointerDown={startChatDrag}
            onPointerMove={moveChatDrag}
            onPointerUp={stopChatDrag}
            onPointerCancel={stopChatDrag}
          >
            <span className={s.chatHeaderIcon}>{icons.chat}</span>
            <strong>Chat</strong>
            <button
              className={s.chatCloseButton}
              type="button"
              aria-label="Fechar chat"
              title="Fechar chat"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setIsChatOpen(false)}
            >
              {icons.quit}
            </button>
          </header>

          <div className={s.chatMessages} role="log" aria-live="polite">
            {chatMessages.map((message) => (
              <article
                key={message.id}
                className={cx('chatMessageRow', {
                  chatMessageOwn: message.isOwn,
                  chatMessageOther: !message.isOwn,
                })}
              >
                {!message.isOwn && <span className={s.chatAvatar} aria-hidden="true">{message.avatarUrl && <img src={message.avatarUrl} alt="" />}</span>}
                <p className={cx('chatBubble', {
                  chatBubbleOwn: message.isOwn,
                  chatBubbleOther: !message.isOwn,
                })}>
                  {message.text}
                </p>
              </article>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <footer className={s.chatComposer}>
            <textarea
              aria-label="Mensagem"
              placeholder={chatStatus === 'connected' ? 'Mensagem...' : 'Conectando...'}
              value={chatDraft}
              rows={1}
              disabled={chatStatus !== 'connected'}
              onChange={(event) => setChatDraft(event.target.value)}
              onKeyDown={handleChatKeyDown}
            />
            <button
              type="button"
              aria-label="Enviar mensagem"
              title="Enviar mensagem"
              disabled={chatStatus !== 'connected' || !chatDraft.trim()}
              onClick={sendChatMessage}
            >
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M28.884 5.525 5.978 14.764c-1.32.532-1.296 2.413.037 2.91l8.269 3.083 3.083 8.268c.497 1.334 2.378 1.357 2.91.038l9.239-22.906c.399-.99-.642-2.03-1.632-1.632Z" fill="currentColor"/>
              </svg>
            </button>
          </footer>

          {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(renderResizeHandle)}
        </section>
      )}

      {isDiceMenuOpen && (
        <section
          className={s.diceMenuPanel}
          data-dice-menu
          aria-label="Dice roll"
          style={{
            transform: `translate(${diceMenuPosition.x}px, ${diceMenuPosition.y}px)`,
          }}
        >
          <header
            className={s.diceMenuHeader}
            onPointerDown={startDiceMenuDrag}
            onPointerMove={moveDiceMenuDrag}
            onPointerUp={stopDiceMenuDrag}
            onPointerCancel={stopDiceMenuDrag}
          >
            <span className={s.diceMenuHeaderIcon}>{icons.dice_menu}</span>
            <strong>Dice Roll</strong>
            <button
              className={s.diceMenuCloseButton}
              type="button"
              aria-label="Fechar dice roll"
              title="Fechar dice roll"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setIsDiceMenuOpen(false)}
            >
              {icons.quit}
            </button>
          </header>

          <div className={s.diceQuickRolls}>
            {diceOptions.map((dice) => (
              <button
                key={dice.sides}
                type="button"
                className={s.diceQuickButton}
                onClick={() => sendDiceRoll({ quantity: 1, sides: dice.sides })}
                disabled={chatStatus !== 'connected'}
              >
                <img src={dice.image} alt="" aria-hidden="true" />
                <span>{dice.label}</span>
              </button>
            ))}
          </div>

          <div className={s.advancedRoll}>
            <h2>Advanced roll</h2>
            <div className={s.advancedRollControls}>
              <div className={s.numberInput} style={{ width: `calc(${Math.max(2, String(advancedRoll.quantity ?? '').length)}ch + 48px)` }}>
                  <input
                  type="number"
                  min="1"
                  aria-label="Quantidade de dados"
                  value={advancedRoll.quantity}
                  onChange={(event) =>
                    handleAdvancedRollChange('quantity', event.target.value)
                  }
                />

                <div className={s.numberInputButtons}>
                  <button
                    type="button"
                    onClick={() =>
                      handleAdvancedRollChange(
                        'quantity',
                        Number(advancedRoll.quantity) + 1
                      )
                    }
                    aria-label="Aumentar quantidade"
                  >
                    {icons.up}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleAdvancedRollChange(
                        'quantity',
                        Math.max(1, Number(advancedRoll.quantity) - 1)
                      )
                    }
                    aria-label="Diminuir quantidade"
                  >
                    {icons.down}
                  </button>
                </div>
              </div>

              <select
                aria-label="Tipo de dado"
                value={advancedRoll.sides}
                style={{ width: `calc(${Math.max(3, (diceOptions.find((dice) => String(dice.sides) === String(advancedRoll.sides))?.label || 'D20').length)}ch + 59px)` }}
                onChange={(event) => handleAdvancedRollChange('sides', event.target.value)}
              >
                {diceOptions.map((dice) => (
                  <option key={dice.sides} value={dice.sides}>{dice.label}</option>
                ))}
              </select>
              <span className={s.advancedRollPlus}>+</span>
              <div className={s.numberInput} style={{ width: `calc(${Math.max(2, String(advancedRoll.bonus ?? '').length)}ch + 48px)` }}>
                <input
                  type="number"
                  min="0"
                  aria-label="Bonus da rolagem"
                  value={advancedRoll.bonus}
                  onChange={(event) => handleAdvancedRollChange('bonus', event.target.value)}
                />

                <div className={s.numberInputButtons}>
                  <button
                    type="button"
                    onClick={() =>
                      handleAdvancedRollChange(
                        'bonus',
                        Number(advancedRoll.bonus) + 1
                      )
                    }
                    aria-label="Aumentar quantidade"
                  >
                    {icons.up}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleAdvancedRollChange(
                        'bonus',
                        Math.max(0, Number(advancedRoll.bonus) - 1)
                      )
                    }
                    aria-label="Diminuir quantidade"
                  >
                    {icons.down}
                  </button>
                </div>
              </div>
              <div className={s.dmToggle} aria-hidden="true">
                <span>DM</span>
                <span />
              </div>
              <button
                type="button"
                className={s.rollButton}
                disabled={chatStatus !== 'connected' || advancedRoll.quantity < 1}
                onClick={() => sendDiceRoll(advancedRoll)}
              >
                Roll
              </button>
            </div>
          </div>
        </section>
      )}

      <nav className={s.bottomMenu} aria-label="Tabletop tools">
        <IconButton label="Select" icon="cursor" pressed={activeTool === 'select'} onClick={() => { setActiveTool('select'); setIsMeasurePanelOpen(false) }} />
        <IconButton label="Move" icon="hand" pressed={activeTool === 'move'} onClick={() => { setActiveTool('move'); setIsMeasurePanelOpen(false) }} />
        <IconButton label="Draw" icon="brush" pressed={activeTool === 'draw'} onClick={() => { setActiveTool((current) => current === 'draw' ? 'select' : 'draw'); setIsMeasurePanelOpen(false) }} />
        <IconButton label="Text" icon="text" pressed={activeTool === 'text'} onClick={() => {
          if (activeTool === 'text') {
            const editing = tabletopTextsRef.current.find((item) => item.id === selectedTextIdRef.current)
            if (editingTextId != null) finishTextEdit(editing)
            setEditingTextId(null)
            setActiveTool('select')
          } else {
            setActiveTool('text')
          }
          setIsMeasurePanelOpen(false)
        }} />
        <IconButton label="Measure" icon="ruler" pressed={activeTool === 'measure'} onClick={() => { setActiveTool('measure'); setIsMeasurePanelOpen((open) => !open) }} />
        <span className={s.separator} aria-hidden="true" />
        <IconButton
          label="Dice"
          icon="dice"
          pressed={isDiceMenuOpen}
          onClick={() => {
            if (!isDiceMenuOpen) setDiceMenuPosition((current) => keepDiceMenuInsideScreen(current))
            setIsDiceMenuOpen((current) => !current)
          }}
        />
      </nav>

      {activeTool === 'text' && <section className={s.textToolbar} aria-label="Text formatting">
        <label>Font<select value={textSettings.fontFamily} onChange={(event) => changeTextSetting('fontFamily', event.target.value)}><option>Arial</option><option>Georgia</option><option>Times New Roman</option><option>Courier New</option><option>Verdana</option></select></label>
        <label>Size<input type="number" min="6" max="200" value={textSettings.fontSize} onChange={(event) => changeTextSetting('fontSize', Math.max(6, Math.min(200, Number(event.target.value) || 6)))} /></label>
        <label>Color<input aria-label="Text color" type="color" value={textSettings.color} onChange={(event) => changeTextSetting('color', event.target.value)} /></label>
        <button type="button" aria-pressed={textSettings.bold} onClick={() => changeTextSetting('bold', !textSettings.bold)}><strong>B</strong></button>
        <button type="button" aria-pressed={textSettings.italic} onClick={() => changeTextSetting('italic', !textSettings.italic)}><em>I</em></button>
      </section>}
      {activeTool === 'draw' && <section className={s.drawToolbar} aria-label="Draw settings">
        <label>Color<input type="color" value={drawSettings.color} onChange={(event) => setDrawSettings((current) => ({ ...current, color: event.target.value }))} /></label>
        <label className={s.drawWidthField}>Thickness<input type="range" min="1" max="24" step="1" value={drawSettings.strokeWidth} onChange={(event) => setDrawSettings((current) => ({ ...current, strokeWidth: Number(event.target.value) }))} /></label>
        <output>{drawSettings.strokeWidth}px</output>
      </section>}

      <nav className={s.sideMenu} aria-label="Room panels">
        <div className={s.sideMenuTop}>
          {sidePanels.map((panel) => (
            <IconButton
              key={panel}
              label={panel}
              icon={{ Sheets: 'scroll', Images: 'pawn', Maps: 'map', Pages: 'pages', Notes: 'notes' }[panel]}
              pressed={activeSidePanel === panel}
              onClick={() => setActiveSidePanel((current) => current === panel ? null : panel)}
            />
          ))}
        </div>
        <IconButton label="Settings" icon="settings" pressed={activeSidePanel === 'Settings'} onClick={() => setActiveSidePanel((current) => current === 'Settings' ? null : 'Settings')} />
      </nav>

      {isMeasurePanelOpen && <section
        className={cx('measurePanel', { measurePanelWithShapeDropdown: measureDropdown === 'shape' })}
        data-measure-panel
        style={{ left: measurePanelPosition.x, top: measurePanelPosition.y }}
        aria-label="Measure settings"
      >
        <header className={s.measurePanelHeader} onPointerDown={startMeasurePanelDrag} onPointerMove={moveMeasurePanelDrag} onPointerUp={stopMeasurePanelDrag} onPointerCancel={stopMeasurePanelDrag}>
          <span className={s.measurePanelIcon}>{icons.ruler}</span>
          <strong>Measure</strong>
          <button className={s.measureCloseButton} type="button" aria-label="Close measure" title="Close measure" onPointerDown={(event) => event.stopPropagation()} onClick={() => setIsMeasurePanelOpen(false)}>{icons.quit}</button>
        </header>
        <div className={s.measurePanelContent}>
          <div className={s.measureSelectLabel}><span>Shape</span>
            <div className={s.measureSelectWrap}>
              <button type="button" className={s.measureSelectTrigger} aria-expanded={measureDropdown === 'shape'} onClick={() => setMeasureDropdown((current) => current === 'shape' ? null : 'shape')}>
                {measureShape === 'cone' ? icons.shapeAngle : <Icon name={{ line: 'shapePline', circle: 'shapeCircle', square: 'shapeSquare' }[measureShape]} size={25} color="#DCD4FA" />}
                <span className={s.measureSelectValue}>{measureShape[0].toUpperCase() + measureShape.slice(1)}</span><Icon name="chevronDown" size={20} color="#DCD4FA" />
              </button>
              {measureDropdown === 'shape' && <div className={s.measureDropdown}>{[
                { value: 'line', label: 'Line', icon: <Icon name="shapePline" size={23} color="#DCD4FA" /> },
                { value: 'circle', label: 'Circle', icon: <Icon name="shapeCircle" size={23} color="#DCD4FA" /> },
                { value: 'square', label: 'Square', icon: <Icon name="shapeSquare" size={23} color="#DCD4FA" /> },
                { value: 'cone', label: 'Cone', icon: icons.shapeAngle },
              ].map((option) => <button type="button" key={option.value} aria-pressed={measureShape === option.value} onClick={() => { setMeasureShape(option.value); setMeasureDropdown(null) }}>{option.icon}<span>{option.label}</span></button>)}</div>}
            </div>
          </div>
          <div className={s.measureSelectLabel}><span>Grid Snapping</span>
            <div className={s.measureSelectWrap}>
              <button type="button" className={s.measureSelectTrigger} aria-expanded={measureDropdown === 'snap'} onClick={() => setMeasureDropdown((current) => current === 'snap' ? null : 'snap')}>
                {measureSnap === 'none' ? <Icon name="snappSquareDashed" size={25} color="#DCD4FA" /> : measureSnap === 'center' ? icons.snappSquareDashedX : icons.snappSquareDashedXCorner}
                <span className={s.measureSelectValue}>{{ none: 'No snapping', center: 'Snap to center', corner: 'Snap to corner' }[measureSnap]}</span><Icon name="chevronDown" size={20} color="#DCD4FA" />
              </button>
              {measureDropdown === 'snap' && <div className={s.measureDropdown}>{[
                { value: 'none', label: 'No snapping', icon: <Icon name="snappSquareDashed" size={23} color="#DCD4FA" /> },
                { value: 'center', label: 'Snap to center', icon: icons.snappSquareDashedX },
                { value: 'corner', label: 'Snap to corner', icon: icons.snappSquareDashedXCorner },
              ].map((option) => <button type="button" key={option.value} aria-pressed={measureSnap === option.value} onClick={() => { setMeasureSnap(option.value); setMeasureDropdown(null) }}>{option.icon}<span>{option.label}</span></button>)}</div>}
            </div>
          </div>
          <label className={s.measureCheckbox}><span>Keep the shape on tabletop</span><input type="checkbox" checked={keepMeasure} onChange={(event) => setKeepMeasure(event.target.checked)} /></label>
          <label className={s.measureCheckbox}><span>Always measure token movement</span><input type="checkbox" checked={measureTokenMovement} onChange={(event) => setMeasureTokenMovement(event.target.checked)} /></label>
          <label className={s.measureCheckbox}><span>Broadcast to others</span><input type="checkbox" checked={broadcastMeasure} onChange={(event) => setBroadcastMeasure(event.target.checked)} /></label>
          <div className={s.measureScale}>1 Cell = {backgroundSettings.mapScaleValue || 0} {backgroundSettings.mapScaleUnity}</div>
        </div>
      </section>}

      <aside className={cx('sidePanel', { sidePanelOpen: Boolean(activeSidePanel) })} aria-hidden={!activeSidePanel}>
        {activeSidePanel && <div className={s.sidePanelContent}>
          <h2>{activeSidePanel}</h2>
          {activeSidePanel === 'Images' ? <>
            <div className={s.tokenSearchRow}>
              <label className={s.tokenSearch}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
                <input type="search" placeholder="Search..." aria-label="Pesquisar imagens" value={tokenSearch} onChange={(event) => setTokenSearch(event.target.value)} />
              </label>
              <button className={s.tokenUploadButton} type="button" aria-label="Enviar imagem" title="Enviar imagem" disabled={tokenUploadLoading} onClick={() => tokenFileInputRef.current?.click()}>
                {tokenUploadLoading ? <span className={s.uploadSpinner} /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM7 11h10l1.5 8h-13L7 11ZM5 21h14"/></svg>}
              </button>
              <input ref={tokenFileInputRef} className={s.visuallyHidden} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleTokenUpload} />
            </div>
            <h3 className={s.tokenSectionTitle}>My Images</h3>
            {tokensError && <p className={s.tokenMessage} role="alert">{tokensError}</p>}
            {tokensLoading ? <p className={s.tokenMessage}>Carregando imagens...</p> : filteredTokens.length ? <ul className={s.tokenList}>
              {filteredTokens.map((token) => <li className={s.tokenItem} key={token.id} draggable="true" onDragStart={(event) => handleTokenDragStart(event, token)}>
                <div className={s.tokenThumbnail}>{token.asset_image_url && <img src={token.asset_image_url} alt="" />}</div>
                <span title={token.asset_image_file_name}>{token.asset_image_file_name || 'Imagem sem nome'}</span>
              </li>)}
            </ul> : <p className={s.tokenMessage}>{tokenSearch ? 'Nenhuma imagem encontrada.' : 'Você ainda não tem imagens.'}</p>}
          </> : activeSidePanel === 'Sheets' ? null : activeSidePanel === 'Maps' ? <>
            {roomSyncError && <p className={s.tokenMessage} role="alert">{roomSyncError}</p>}
            <section className={s.mapsSection}>
              <header className={s.mapsSectionHeader}>
                <h3>Layers</h3>
                <span className={s.mapsAddIcon} aria-hidden="true"><Icon name="copyPlus" size={18} color="#c9c7e0" /></span>
              </header>
              {tabletopLayers.map(({ value: layer, label }) => {
                const layerAssets = getLayerAssets(tabletopAssets, layer)
                return (
                  <section
                    className={s.layerGroup}
                    key={layer}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleLayerDrop(event, layer)}
                  >
                    <button
                      type="button"
                      className={s.layerGroupToggle}
                      aria-expanded={expandedLayers[layer]}
                      onClick={() => setExpandedLayers((current) => ({ ...current, [layer]: !current[layer] }))}
                    >
                      <span className={cx('layerChevron', { layerChevronClosed: !expandedLayers[layer] })} aria-hidden="true"><Icon name="chevronDown" size={15} color="#c9c7e0" /></span>
                      <span>{label}</span>
                    </button>
                    {expandedLayers[layer] && <ul className={s.layerAssetList}>
                      {layerAssets.map((asset) => (
                        <li
                          className={cx('layerAssetRow', { layerAssetRowMap: layer === 'map' })}
                          key={asset.id}
                          draggable="true"
                          onDragStart={(event) => handleTokenDragStart(event, asset)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => handleLayerAssetDrop(event, asset, layer)}
                        >
                          <span className={s.layerAssetThumbnail}>
                            {asset.asset_image_url ? <img src={asset.asset_image_url} alt="" /> : <span>&lt;placeholder&gt;</span>}
                          </span>
                          <span className={s.layerAssetName} title={asset.asset_image_file_name}>{asset.asset_image_file_name || `Token ${asset.id}`}</span>
                          <button
                            type="button"
                            className={cx('visibilityButton', { assetHidden: asset.visible === false })}
                            aria-label={asset.visible === false ? 'Mostrar token' : 'Ocultar token'}
                            title={asset.visible === false ? 'Mostrar token' : 'Ocultar token'}
                            onClick={() => changeAssetVisibility(asset)}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/>{asset.visible === false && <path d="M4 20 20 4"/>}</svg>
                          </button>
                          {layer === 'map' && <button
                            type="button"
                            className={s.fitMapButton}
                            aria-label="Ajustar tamanho do tabletop a este mapa"
                            title="Ajustar tamanho do tabletop a este mapa"
                            onClick={(event) => {
                              event.stopPropagation()
                              fitTabletopToMap(asset)
                            }}
                          >
                            <Icon name="maximize2" size={17} color="#fff" />
                          </button>}
                        </li>
                      ))}
                      {!layerAssets.length && <li className={s.emptyLayer}>Arraste tokens para esta layer</li>}
                    </ul>}
                  </section>
                )
              })}
            </section>

            <section className={s.mapsSection}>
              <header className={s.mapsSectionHeader}><h3>Configurations</h3></header>
              <label className={s.mapsFieldLabel}>Background</label>
              <div className={s.mapsCheckboxRow}>
                <label className={s.gridCheckbox}>
                <input
                    type="checkbox"
                    checked={backgroundSettings.visibleGrid}
                    onChange={(event) => applyBackgroundSettings({ visible_grid: event.target.checked })}
                  />
                  <span>Visible Grid</span>
                </label>
                <label className={s.gridCheckbox}>
                  <input
                    type="checkbox"
                    checked={backgroundSettings.movementAdaptableToGrid}
                    onChange={(event) => changeMovementAdaptability(event.target.checked)}
                  />
                  <span>Movement Adaptable to Grid</span>
                </label>
              </div>
              <label className={s.mapsFieldLabel}>Grid Color</label>
              <div className={s.backgroundColorField}>
                  <input
                    type="color"
                    aria-label="Cor da grid"
                    value={/^#[0-9a-f]{6}$/i.test(gridColorDraft) ? gridColorDraft : backgroundSettings.gridColor}
                    onChange={(event) => {
                      setGridColorDraft(event.target.value)
                      applyBackgroundSettings({ grid_color: event.target.value })
                    }}
                  />
                  <input
                    type="text"
                    aria-label="Hexadecimal da cor da grid"
                    value={gridColorDraft}
                    onChange={(event) => setGridColorDraft(event.target.value)}
                    onBlur={() => {
                      if (/^#[0-9a-f]{6}$/i.test(gridColorDraft)) applyBackgroundSettings({ grid_color: gridColorDraft })
                      else setGridColorDraft(backgroundSettings.gridColor)
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    aria-label="Opacidade da grid em porcentagem"
                    value={backgroundSettings.gridOpacity}
                    onChange={(event) => setBackgroundSettings((current) => ({ ...current, gridOpacity: Math.max(0, Math.min(100, Number(event.target.value) || 0)) }))}
                    onBlur={() => applyBackgroundSettings({ grid_opacity: Math.round(backgroundSettings.gridOpacity) })}
                  />
                  <span className={s.gridOpacitySuffix}>%</span>
              </div>
              <label className={s.mapsFieldLabel}>Background Color</label>
              <div className={s.backgroundColorField}>
                <input
                  type="color"
                  aria-label="Cor de fundo do tabletop"
                  value={/^#[0-9a-f]{6}$/i.test(backgroundColorDraft) ? backgroundColorDraft : backgroundSettings.backgroundColor}
                  onChange={(event) => {
                    setBackgroundColorDraft(event.target.value)
                    applyBackgroundSettings({ background_color: event.target.value })
                  }}
                />
                <input
                  type="text"
                  aria-label="Hexadecimal da cor de fundo"
                  value={backgroundColorDraft}
                  onChange={(event) => setBackgroundColorDraft(event.target.value)}
                  onBlur={() => {
                    if (/^#[0-9a-f]{6}$/i.test(backgroundColorDraft)) applyBackgroundSettings({ background_color: backgroundColorDraft })
                    else setBackgroundColorDraft(backgroundSettings.backgroundColor)
                  }}
                />
              </div>

              <label className={s.mapsFieldLabel}>Page Size</label>
              <div className={s.pageSizeFields}>
                <label><span>X</span><input type="number" min="100" value={backgroundSettings.pageSizeX} onChange={(event) => setBackgroundSettings((current) => ({ ...current, pageSizeX: Number(event.target.value) || 100 }))} onBlur={() => applyBackgroundSettings({ page_size_x: Math.round(backgroundSettings.pageSizeX) })} /></label>
                <label><span>Y</span><input type="number" min="100" value={backgroundSettings.pageSizeY} onChange={(event) => setBackgroundSettings((current) => ({ ...current, pageSizeY: Number(event.target.value) || 100 }))} onBlur={() => applyBackgroundSettings({ page_size_y: Math.round(backgroundSettings.pageSizeY) })} /></label>
              </div>

              <label className={s.mapsFieldLabel}>Map Scale</label>
              <div className={s.mapScaleFields}>
                <input type="number" step="any" value={backgroundSettings.mapScaleValue} onChange={(event) => setBackgroundSettings((current) => ({ ...current, mapScaleValue: Number(event.target.value) || 0 }))} onBlur={() => applyBackgroundSettings({ map_scale_value: backgroundSettings.mapScaleValue })} aria-label="Valor da escala do mapa" />
                <select value={backgroundSettings.mapScaleUnity} onChange={(event) => applyBackgroundSettings({ map_scale_unity: event.target.value })} aria-label="Unidade da escala do mapa">
                  {mapScaleUnits.map((unit) => <option key={unit.label} value={unit.value}>{unit.label}</option>)}
                </select>
              </div>
            </section>

            <section className={cx('mapsSection', 'workOnLayerSection')}>
              <header className={s.mapsSectionHeader}><h3>Work on layer</h3></header>
              <div className={s.workLayerButtons} role="group" aria-label="Layer ativa para movimentação">
                {[{ value: 'players', label: 'Players' }, { value: 'map', label: 'Map' }, { value: 'master', label: 'DM' }].map((layer) => (
                  <button key={layer.value} type="button" aria-pressed={workOnLayer === layer.value} onClick={() => setWorkOnLayer(layer.value)}>{layer.label}</button>
                ))}
              </div>
            </section>
          </> : activeSidePanel === 'Pages' ? <>
            <label className={s.tokenSearch}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
              <input type="search" placeholder="Search..." aria-label="Pesquisar pages" value={pageSearch} onChange={(event) => setPageSearch(event.target.value)} />
            </label>
            <section className={s.pagesSection}>
              <header className={s.mapsSectionHeader}><h3>Map pages</h3></header>
              {isRoomMaster && <div className={s.pageActions}>
                <button type="button" onClick={() => sendPageAction({ type: 'page.create' })}><Icon name="copyPlus" size={16} color="#c9c7e0" /> New page</button>
                <button type="button" onClick={() => sendPageAction({ type: 'folder.create' })}><Icon name="copyPlus" size={16} color="#c9c7e0" /> New folder</button>
              </div>}
              {folders.map((folder) => {
                const folderPages = visiblePages.filter((page) => page.folder_id === folder.id)
                if (pageSearch && !folderPages.length && !folder.name.toLowerCase().includes(pageSearch.trim().toLowerCase())) return null
                const expanded = expandedFolders[folder.id] !== false
                return <section key={folder.id} className={s.pageFolder} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropPageIntoFolder(event, folder.id)}>
                  <div className={s.pageFolderHeading}>
                    <button type="button" aria-expanded={expanded} onClick={() => setExpandedFolders((current) => ({ ...current, [folder.id]: !expanded }))}><Icon name="chevronDown" size={15} color="#c9c7e0" /></button>
                    {renamingFolderId === folder.id ? <input autoFocus defaultValue={folder.name} onBlur={(event) => renameFolder(folder.id, event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') renameFolder(folder.id, event.currentTarget.value); if (event.key === 'Escape') setRenamingFolderId(null) }} /> : <button type="button" onClick={() => isRoomMaster && setRenamingFolderId(folder.id)}>{folder.name}</button>}
                  </div>
                  {expanded && <ul className={s.pageCardList}>{folderPages.map((page) => <li key={page.id} draggable={isRoomMaster} onDragStart={(event) => startPageDrag(event, page)} className={cx('pageCard', { pageCardCurrent: page.id === currentPageId })}>
                    <button type="button" className={s.pagePreview} aria-label={`Abrir ${page.name}`} onClick={() => { if (isRoomMaster || page.id === playersPageId) loadTabletopPage(page.id).catch(console.error) }}>{page.preview_image_url && <img src={page.preview_image_url} alt="" />}</button>
                    {renamingPageId === page.id ? <input autoFocus className={s.pageNameInput} defaultValue={page.name} onBlur={(event) => renamePage(page.id, event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') renamePage(page.id, event.currentTarget.value); if (event.key === 'Escape') setRenamingPageId(null) }} /> : <button type="button" className={s.pageName} onClick={() => isRoomMaster && setRenamingPageId(page.id)}>{page.name}</button>}
                    <button type="button" className={cx('pageBookmark', { pageBookmarkInactive: page.id !== playersPageId })} aria-label={page.id === playersPageId ? 'Page visível para os jogadores' : 'Mostrar esta page para os jogadores'} title={page.id === playersPageId ? 'Page visível para os jogadores' : 'Mostrar para os jogadores'} onClick={() => publishPage(page.id)} disabled={!isRoomMaster}><Icon name={page.id === playersPageId ? 'bookmarkCheck' : 'bookmark'} size={20} color="#f4f3fa" /></button>
                  </li>)}</ul>}
                </section>
              })}
              {visiblePages.filter((page) => page.folder_id == null).length > 0 && <section className={s.pageFolder} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropPageIntoFolder(event, null)}>
                <div className={s.pageFolderHeading}><span>Unfiled pages</span></div>
                <ul className={s.pageCardList}>{visiblePages.filter((page) => page.folder_id == null).map((page) => <li key={page.id} draggable={isRoomMaster} onDragStart={(event) => startPageDrag(event, page)} className={s.pageCard}><button type="button" className={s.pagePreview} aria-label={`Abrir ${page.name}`} onClick={() => { if (isRoomMaster || page.id === playersPageId) loadTabletopPage(page.id).catch(console.error) }}>{page.preview_image_url && <img src={page.preview_image_url} alt="" />}</button>{renamingPageId === page.id ? <input autoFocus className={s.pageNameInput} defaultValue={page.name} onBlur={(event) => renamePage(page.id, event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') renamePage(page.id, event.currentTarget.value); if (event.key === 'Escape') setRenamingPageId(null) }} /> : <button type="button" className={s.pageName} onClick={() => isRoomMaster && setRenamingPageId(page.id)}>{page.name}</button>}<button type="button" className={cx('pageBookmark', { pageBookmarkInactive: page.id !== playersPageId })} onClick={() => publishPage(page.id)} disabled={!isRoomMaster} aria-label="Mostrar para os jogadores"><Icon name={page.id === playersPageId ? 'bookmarkCheck' : 'bookmark'} size={20} color="#f4f3fa" /></button></li>)}</ul>
              </section>}
            </section>
          </> : <p className={s.tokenMessage}>Conteúdo de {activeSidePanel}.</p>}
        </div>}
      </aside>
    </main>
  )
}

export default RoomPage
