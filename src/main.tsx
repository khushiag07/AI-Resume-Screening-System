
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  const savedTheme = localStorage.getItem("resumeai-theme");

if (savedTheme === "dark" || !savedTheme) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

  createRoot(document.getElementById("root")!).render(<App />);
  