"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = "sidebar-state";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      if (!isInitialized) {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState !== null) {
          setIsOpen(savedState === "true");
        } else {
          setIsOpen(!mobile);
        }
        setIsInitialized(true);
      } else if (!wasMobile && mobile && isOpen) {
        setIsOpen(false);
      }
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isInitialized, isOpen, isMobile]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    }
  }, [isOpen, isInitialized]);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, isMobile, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar debe usarse dentro de un SidebarProvider");
  }
  return context;
}
