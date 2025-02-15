"use client"

import { useEffect, useRef } from "react"
import io, { type Socket } from "socket.io-client"

export const useSocket = (url: string) => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io(url)

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [url])

  const emit = (eventName: string, data: {
    [key: string]: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit(eventName, data)
    }
  }

  const on = (eventName: string, callback: (data: {
    [key: string]: string
  }) => void) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback)
    }
  }

  return { emit, on }
}

