"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styles from "./ThemeToggle.module.css"

const ThemeToggle: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkTheme)
  }, [isDarkTheme])

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  return (
    <div className={styles.themeToggle} onClick={toggleTheme}>
      <div className={styles.themeIcon}></div>
    </div>
  )
}

export default ThemeToggle

