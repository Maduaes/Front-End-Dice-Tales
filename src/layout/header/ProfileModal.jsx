import { useEffect, useRef, useState } from "react"
import cn from "classnames/bind"
import { createPortal } from "react-dom"
import pencilModalIcon from "@/assets/pencil_modal_icon.png"
import Input from "@/shared/forms/Input"
import { Icon } from "@/shared/icones/Icon"
import { updateUser, uploadProfilePicture } from "@/services/usersService"
import s from "./ProfileModal.module.scss"

const cx = cn.bind(s)
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]

const getInitialFormState = (user) => ({
  username: user?.username ?? "",
  email: user?.email ?? "",
  password: "",
})

const getInitials = (username = "") => {
  return username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not available"
  }

  if (typeof value === "number") {
    return value.toLocaleString()
  }

  return String(value)
}

const formatDateTime = (value) => {
  if (!value) {
    return "Not available"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not available"
  }

  return date.toLocaleString()
}

const getApiErrorMessage = (error) => {
  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ")
  }

  return detail ?? "It was not possible to update your profile."
}

export const ProfileModal = ({ user, isLoading, errorMessage, onUserUpdated }) => {
  const resetSavedTimerRef = useRef(null)
  const skipNextUserSyncRef = useRef(false)
  const [formData, setFormData] = useState(getInitialFormState(user))
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [profileFile, setProfileFile] = useState(null)
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("")
  const [hasValidProfileImage, setHasValidProfileImage] = useState(false)
  const initials = getInitials(user?.username ?? "")
  const infoItems = [
    { label: "User ID", value: formatValue(user?.id) },
    { label: "Storage Usage", value: formatValue(user?.storage_usage) },
    { label: "Hours Played", value: formatValue(user?.hours_played) },
    { label: "Created At", value: formatDateTime(user?.created_at) },
    { label: "Updated At", value: formatDateTime(user?.updated_at) },
  ]

  useEffect(() => {
    if (skipNextUserSyncRef.current) {
      skipNextUserSyncRef.current = false
      return
    }

    setFormData(getInitialFormState(user))
    setSubmitError("")
    setIsSubmitting(false)
  }, [user])

  useEffect(() => {
    if (!profileFile) {
      setProfilePreviewUrl("")
      return undefined
    }

    const objectUrl = URL.createObjectURL(profileFile)
    setProfilePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [profileFile])

  useEffect(() => {
    setHasValidProfileImage(Boolean(profilePreviewUrl || user?.profileImageUrl))
  }, [profilePreviewUrl, user?.profileImageUrl])

  useEffect(() => {
    return () => {
      if (resetSavedTimerRef.current) {
        clearTimeout(resetSavedTimerRef.current)
      }
    }
  }, [])

  const clearSavedState = () => {
    if (resetSavedTimerRef.current) {
      clearTimeout(resetSavedTimerRef.current)
      resetSavedTimerRef.current = null
    }
    setHasSaved(false)
  }

  const handleChange = (name, value) => {
    clearSavedState()
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileFileChange = (event) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setProfileFile(null)
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = ""
      setSubmitError("Use only PNG, JPG or WEBP files for the profile picture.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      event.target.value = ""
      setSubmitError("The profile picture must be up to 10MB.")
      return
    }

    clearSavedState()
    setSubmitError("")
    setProfileFile(file)
    event.target.value = ""
  }

  const handleReset = () => {
    clearSavedState()
    setFormData(getInitialFormState(user))
    setSubmitError("")
    setIsSubmitting(false)
    setProfileFile(null)
  }

  const handleSubmit = async () => {
    if (!user) {
      return
    }

    const nextUsername = formData.username.trim()
    const nextEmail = formData.email.trim()
    const nextPassword = formData.password.trim()
    const payload = {}

    if (nextUsername && nextUsername !== user.username) {
      payload.username = nextUsername
    }

    if (nextEmail && nextEmail !== user.email) {
      payload.email = nextEmail
    }

    if (nextPassword) {
      payload.password = nextPassword
    }

    if (Object.keys(payload).length === 0 && !profileFile) {
      setSubmitError("")
      return
    }

    let latestUser = user

    try {
      clearSavedState()
      setIsSubmitting(true)
      setSubmitError("")

      if (profileFile) {
        latestUser = await uploadProfilePicture(profileFile)
      }

      if (Object.keys(payload).length > 0) {
        latestUser = await updateUser(payload)
      }

      onUserUpdated?.(latestUser)
      setFormData(getInitialFormState(latestUser))
      setProfileFile(null)
      setHasSaved(true)
      resetSavedTimerRef.current = setTimeout(() => {
        setHasSaved(false)
        resetSavedTimerRef.current = null
      }, 2500)
    } catch (error) {
      if (latestUser !== user) {
        skipNextUserSyncRef.current = true
        onUserUpdated?.(latestUser)
        setProfileFile(null)
      }
      setSubmitError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resolvedProfileImage = profilePreviewUrl || user?.profileImageUrl || ""

  const modalContent = (
    <div
      className="modal fade"
      id="profileMenuModal"
      tabIndex="-1"
      aria-labelledby="profileMenuModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className={cx("modal-content", s.modalProfile)}>
          <div className={cx("modal-header", s.modalHeader)}>
            <div className={cx("d-flex", "align-items-center", "gap-2")}>
              <Icon name="squarePen" />
              <h1 className={cx("modal-title", "fs-5", s.modalTitle)} id="profileMenuModalLabel">
                My Profile
              </h1>
            </div>
            <button
              type="button"
              className={cx("btn-close", s.closeButton)}
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleReset}
            ></button>
          </div>

          <div className={cx("modal-body", s.modalBody)}>
            {isLoading ? (
              <div className={s.stateBox}>Loading profile...</div>
            ) : errorMessage ? (
              <div className={cx(s.stateBox, s.errorBox)}>{errorMessage}</div>
            ) : (
              <div className="container-fluid">
                <div className="row g-4">
                  <div className="col-12 col-lg-4">
                    <section className={s.identityPanel}>
                      <div className={s.identityAvatar}>
                        {hasValidProfileImage && resolvedProfileImage ? (
                          <img
                            src={resolvedProfileImage}
                            alt=""
                            aria-hidden="true"
                            className={s.identityAvatarImage}
                            onError={() => setHasValidProfileImage(false)}
                          />
                        ) : initials ? (
                          initials
                        ) : (
                          <Icon name="user" size="36" />
                        )}
                      </div>
                      <div className={s.identityContent}>
                        <span className={s.identityEyebrow}>Dice Tales Account</span>
                        <h2>{formatValue(user?.username)}</h2>
                        <p>{formatValue(user?.email)}</p>
                      </div>
                      <div className={s.uploadField}>
                        <label className={s.uploadLabel} htmlFor="profilePictureUpload">
                          Profile Picture
                        </label>
                        <div className={cx(s.uploadInput, "ipt-second")}>
                          <input
                            id="profilePictureUpload"
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp"
                            onChange={handleProfileFileChange}
                            className={s.uploadNativeInput}
                          />
                          <label className={s.uploadButton} htmlFor="profilePictureUpload">
                            Choose file
                          </label>
                          <span
                            className={cx(s.uploadValue, {
                              [s.uploadValuePlaceholder]: !profileFile && !user?.profileImageUrl,
                            })}
                          >
                            {profileFile
                              ? profileFile.name
                              : user?.profileImageUrl
                                ? "Current profile picture already defined."
                                : "No file selected"}
                          </span>
                          <img
                            src={pencilModalIcon}
                            alt=""
                            aria-hidden="true"
                            className={s.uploadIcon}
                          />
                        </div>
                        <small className={s.uploadHint}>
                          PNG, JPG or WEBP up to 10MB.
                        </small>
                      </div>
                    </section>
                  </div>

                  <div className="col-12 col-lg-8">
                    <section className={s.formPanel}>
                      <header className={s.formHeader}>
                        <span className={s.detailsEyebrow}>Edit your account</span>
                        <h3>Update your core information</h3>
                      </header>

                      <div className="row g-3">
                        <Input
                          label="Username"
                          placeholder="Your display name"
                          name="username"
                          value={formData.username}
                          handleChange={handleChange}
                          theme="ipt-second"
                          hasIcon={true}
                          nameIcon="user"
                          className="col-12"
                        />
                        <Input
                          label="Email"
                          placeholder="your.email@example.com"
                          name="email"
                          value={formData.email}
                          handleChange={handleChange}
                          theme="ipt-second"
                          hasIcon={true}
                          nameIcon="mail"
                          className="col-12 col-xl-7"
                        />
                        <Input
                          label="Password"
                          placeholder="Enter a new password"
                          type="password"
                          name="password"
                          value={formData.password}
                          handleChange={handleChange}
                          theme="ipt-second"
                          hasIcon={true}
                          nameIcon="keyRound"
                          className="col-12 col-xl-5"
                        />
                      </div>

                      <div className={cx("row", "g-3", s.infoGrid)}>
                        {infoItems.map((item) => (
                          <div className="col-12 col-md-6" key={item.label}>
                            <article className={s.infoCard}>
                              <span>{item.label}</span>
                              <strong>{item.value}</strong>
                            </article>
                          </div>
                        ))}
                      </div>

                      {submitError && (
                        <div className={cx(s.stateBox, s.errorBox, s.inlineError)}>
                          {submitError}
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={cx("modal-footer", s.modalFooter)}>
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={handleReset}
            >
              Close
            </button>
            <button
              type="button"
              className={cx("btn", "btn-primary-green", s.saveButton)}
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting || !user}
            >
              {isSubmitting ? "Saving..." : hasSaved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
