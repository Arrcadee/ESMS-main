import { useState, useCallback } from "react";

export default function useUIState() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  return {
    sidebarOpen,
    setSidebarOpen,
    activeNav,
    setActiveNav,
    modal,
    setModal,
    toast,
    showToast,
  };
}
