import { useEffect, useRef, useState } from "react"
import cn from "classnames/bind"
import { useNavigate } from "react-router-dom"
import { logout } from "@/auth/services/authService"
import { getUser } from "@/services/usersService"
import { Icon } from "@/shared/icones/Icon"
import { ProfileModal } from "./ProfileModal"
import s from "./ProfileMenu.module.scss"

const cx = cn.bind(s)

const getInitials = (username = "") => {
  return username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export const ProfileMenu = () => {
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const [user, setUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [hasValidProfileImage, setHasValidProfileImage] = useState(false)

  const loadUser = async () => {
    try {
      setIsLoadingUser(true)
      setErrorMessage("")
      const response = await getUser()
      setUser(response)
      return response
    } catch (error) {
      setUser(null)
      setErrorMessage(
        error.response?.data?.detail ?? "It was not possible to load your profile."
      )
      return null
    } finally {
      setIsLoadingUser(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    setHasValidProfileImage(Boolean(user?.profileImageUrl))
  }, [user?.profileImageUrl])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleProfileClick = () => {
    setIsOpen(false)
    loadUser()
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setIsOpen(false)
      await logout()
      navigate("/login", { replace: true })
    } catch (error) {
      alert(error.response?.data?.detail ?? "It was not possible to logout.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const displayName = user?.username ?? "Profile"
  const initials = user?.username ? getInitials(displayName) : ""

  return (
    <>
      <div
        ref={wrapperRef}
        className={cx(s.wrapper, "user-area")}
      >
        <button
          type="button"
          className={cx(s.trigger, "menu-user-decor")}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div className={cx(s.avatar, "me-2")}>
            {hasValidProfileImage && user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt=""
                aria-hidden="true"
                className={s.avatarImage}
                onError={() => setHasValidProfileImage(false)}
              />
            ) : initials ? (
              <span>{initials}</span>
            ) : (
              <Icon name="user" size="25" />
            )}
          </div>
          <span className={s.username}>{displayName}</span>
          <Icon
            name="chevronDown"
            className={cx(s.chevron, {
              [s.chevronOpen]: isOpen,
            })}
          />
        </button>

        <div
          className={cx(s.popoverMenu, {
            [s.popoverMenuOpen]: isOpen,
          })}
        >
          <button
            type="button"
            className={s.menuItem}
            data-bs-toggle="modal"
            data-bs-target="#profileMenuModal"
            onClick={handleProfileClick}
          >
            My Profile
          </button>
          <a
            className={s.menuItem}
            href="mailto:dicetales@gmail.com?subject=Dice%20Tales%20Help%20Center"
            onClick={() => setIsOpen(false)}
          >
            Help Center
          </a>
          <button
            type="button"
            className={cx(s.menuItem, s.logoutItem)}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      <ProfileModal
        user={user}
        isLoading={isLoadingUser}
        errorMessage={errorMessage}
        onUserUpdated={setUser}
      />
    </>
  )
}
