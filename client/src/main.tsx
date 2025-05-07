import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simply render the app
const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("Rendering app to root element");
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
