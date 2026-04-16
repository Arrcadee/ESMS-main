import { useState } from "react";
import { ROLES } from "../data/constants.js";
import { fmtDate } from "../utils/dateUtils.js";

export default function useAuth(users, setUsers, showToast, setActiveNav) {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", error: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: ROLES.USER,
    error: "",
  });

  const handleLogin = () => {
    const u = users.find((u) => u.email === loginForm.email && u.password === loginForm.password);
    if (!u) {
      setLoginForm((f) => ({ ...f, error: "Invalid email or password." }));
      return;
    }
    setCurrentUser(u);
    setPage("app");
    setActiveNav("dashboard");
    showToast(`Welcome back, ${u.name.split(" ")[0]}!`);
  };

  const handleRegister = () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setRegisterForm((f) => ({ ...f, error: "All fields are required." }));
      return;
    }
    if (users.find((u) => u.email === registerForm.email)) {
      setRegisterForm((f) => ({ ...f, error: "Email already registered." }));
      return;
    }
    const newUser = {
      id: Date.now(),
      ...registerForm,
      avatar: registerForm.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      createdAt: fmtDate(new Date()),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setPage("app");
    setActiveNav("dashboard");
    showToast("Account created! Welcome to ESMS.");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("login");
    setLoginForm({ email: "", password: "", error: "" });
  };

  return {
    currentUser,
    setCurrentUser,
    page,
    setPage,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}
