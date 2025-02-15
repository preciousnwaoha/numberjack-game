"use client"

import { useState } from "react"
import styles from "./AboutModal.module.css"

export default function AboutModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button className={styles.aboutBtn} onClick={() => setIsOpen(true)}>
        ?
      </button>
      {isOpen && (
        <div className={styles.aboutWrapper}>
          <div className={styles.about}>
            <div className={styles.aboutHeader}>About NumberJack</div>
            <div className={styles.aboutContent}>
              <div className={styles.aboutContentItem}>
                <h3>Game play</h3>
                <p className={styles.aboutContentItemText}>
                  Enter the number of persons that will play NumberJack in the input box and click/tap on the person
                  icon to select computers too.
                </p>
                <p className={styles.aboutContentItemText}>
                  A max of 12 players are allowed in NumberJack. <br />
                  <br />
                  Type in a maximum number between 21 and 100 for 'Max Num' and then click/tap 'Start Game' to begin.
                </p>
              </div>
            </div>
            <div className={styles.aboutFooter}>
              inspired by <span id="scrimba">Scrimba.com</span>
            </div>
          </div>
          <div className={styles.aboutBtnWrapper}>
            <button className={styles.aboutBtn} onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  )
}

