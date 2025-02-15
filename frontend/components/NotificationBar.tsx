"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styles from "./NotificationBar.module.css"

interface NotificationBarProps {
  message: string
  duration?: number
}

const NotificationBar: React.FC<NotificationBarProps> = ({ message, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration])

  if (!isVisible) return null

  return <div className={styles.notificationBar}>{message}</div>
}

export default NotificationBar

