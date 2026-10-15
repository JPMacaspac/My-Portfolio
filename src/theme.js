import "./theme.css";

// Which light look to use: "steel" (default) or "blueprint".
// Both are defined in theme.css.
const LIGHT_PALETTE = "steel";

// What a first-time visitor sees: "system" follows their device's setting,
// or force "dark" or "light". After they press the switch, their choice is
// remembered on their device.
const DEFAULT_THEME = "system";

const STORAGE_KEY = "theme";
const root = document.documentElement;

function readStartingTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage can be blocked (for example in private windows): just ignore it
  }
  if (DEFAULT_THEME === "light" || DEFAULT_THEME === "dark") return DEFAULT_THEME;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

// Runs as soon as this file is loaded, before the page is drawn
root.dataset.theme = readStartingTheme();
root.dataset.palette = LIGHT_PALETTE;

// Switches between dark and light. Pass the button that was clicked so the
// new colors can spread out from it as a circle.
export function toggleTheme(button) {
  const next = root.dataset.theme === "dark" ? "light" : "dark";

  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // see above
    }
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (document.startViewTransition && !reducedMotion && button) {
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    // The circle must grow big enough to reach the farthest corner
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-r", `${radius}px`);
    document.startViewTransition(apply);
  } else {
    root.classList.add("theme-swap");
    apply();
    setTimeout(() => root.classList.remove("theme-swap"), 600);
  }
}