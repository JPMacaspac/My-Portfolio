import { useCallback, useEffect, useRef, useState } from "react";
import "./HomeIntro.css";

// INTRO SPEED: every duration and delay is multiplied by this.
// 0.8 = fast, 1 = medium, 1.4 = slow (current).
const SPEED = 1.4;

const ROLES = ["Web Developer", "UI/UX Designer", "Web Designer"];
const GLITCH_CHARS = "!<>-_/[]{}=+*^?#%&";
const NAME_LETTERS = "JOHN PATRICK MACASPAC".split("");
const SYMBOLS = ["</>", "{ }", "=>", "[ ]", "01", ";", "( )", "#", "&&"];

// `at` = how far along the progress bar (0 to 1) a line shows up
const LOG_LINES = [
  { at: 0.05, text: "initializing portfolio" },
  { at: 0.28, text: "loading design system" },
  { at: 0.52, text: "mounting components" },
  { at: 0.76, text: "compiling animations" },
  { at: 0.98, text: "ready" },
];

/**
 * Sequence (times shown at speed 1; they all stretch with SPEED):
 *  0.0s   dot grid and the blue glow fade in
 *  0.4s   a ring and then the bracket logo draw themselves, "JP" fades in
 *  1.1s   progress bar, percent counter and log lines start running
 *  1.5s   the name appears one letter at a time
 *  2.1s   the roles scramble from one to the next
 *  4.2s   a light line sweeps across, the screen splits open, and the logo
 *         flies to the navbar's logo slot (same flight as before)
 * When the logo lands, onLanded() fires, which reveals the navbar and
 * starts the Home page animations.
 */
export default function HomeIntro({ onLanded }) {
  const logoRef = useRef(null);
  const barRef = useRef(null);
  const landedRef = useRef(false);
  const onLandedRef = useRef(onLanded);
  const [percent, setPercent] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [role, setRole] = useState("");
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);

  // Keep the latest onLanded without restarting the whole sequence when
  // App re-renders.
  useEffect(() => {
    onLandedRef.current = onLanded;
  });

  // Tell the app the logo has landed. Only ever fires once.
  const land = useCallback(() => {
    if (landedRef.current) return;
    landedRef.current = true;
    onLandedRef.current?.();
  }, []);

  useEffect(() => {
    const timers = [];
    const intervals = [];
    let raf;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms * SPEED));

    // --- progress bar, percent and log lines ---
    const start = performance.now() + 1100 * SPEED;
    const duration = 2400 * SPEED;
    let lastPercent = -1;
    let lastLog = 0;
    const step = (now) => {
      const p = Math.min(Math.max((now - start) / duration, 0), 1);
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;

      const pct = Math.round(eased * 100);
      if (pct !== lastPercent) {
        lastPercent = pct;
        setPercent(pct);
      }
      let n = lastLog;
      while (n < LOG_LINES.length && eased >= LOG_LINES[n].at) n += 1;
      if (n !== lastLog) {
        lastLog = n;
        setLogCount(n);
      }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    if (!reduced) raf = requestAnimationFrame(step);

    // --- roles: letters flicker through symbols, then settle left to right ---
    const scrambleTo = (target) => {
      let frame = 0;
      const id = setInterval(() => {
        frame += 1;
        const revealed = Math.floor((frame / 14) * target.length);
        setRole(
          [...target]
            .map((ch, i) =>
              i < revealed || ch === " " || ch === "/"
                ? ch
                : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            )
            .join("")
        );
        if (frame >= 14) {
          clearInterval(id);
          setRole(target);
        }
      }, 40);
      intervals.push(id);
    };
    if (reduced) {
      setTimeout(() => setRole(ROLES[0]), 0);
    } else {
      at(2100, () => scrambleTo(ROLES[0]));
      at(2800, () => scrambleTo(ROLES[1]));
      at(3500, () => scrambleTo(ROLES[2]));
    }

    // --- the ending: measure where the logo must land, then fly + split open ---
    const startExit = () => {
      const logoEl = logoRef.current;
      const navLogoSlot = document.getElementById("navbar-logo-slot");
      if (logoEl && navLogoSlot) {
        const from = logoEl.getBoundingClientRect();
        const to = navLogoSlot.getBoundingClientRect();
        logoEl.style.setProperty("--move-x", `${to.left + to.width / 2 - (from.left + from.width / 2)}px`);
        logoEl.style.setProperty("--move-y", `${to.top + to.height / 2 - (from.top + from.height / 2)}px`);
        logoEl.style.setProperty("--move-scale", to.height / from.height);
      }
      setExiting(true);

      // Safety net in case the browser never reports the end of the flight
      // (for example when animations are turned off).
      timers.push(setTimeout(land, reduced ? 300 : 1100 * SPEED + 800));
      // The screen halves have finished sliding away: remove the overlay.
      timers.push(setTimeout(() => setDone(true), reduced ? 400 : 1450 * SPEED));
    };
    timers.push(setTimeout(startExit, reduced ? 500 : 4200 * SPEED));

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      cancelAnimationFrame(raf);
    };
  }, [land]);

  const handleLogoTransitionEnd = (e) => {
    if (exiting && e.propertyName === "transform") land();
  };

  return (
    <>
      {!done && (
        <div
          className={`home-intro${exiting ? " home-intro--exit" : ""}`}
          style={{ "--intro-speed": SPEED }}
        >
          {/* Two halves of the screen that slide apart at the end */}
          <div className="home-intro__cur home-intro__cur--top" />
          <div className="home-intro__cur home-intro__cur--bottom" />
          <div className="home-intro__seam" />

          <div className="home-intro__fx">
            <div className="home-intro__grid hi-fi" style={{ "--t": "1s" }} />
            <div className="home-intro__glow" />

            <div className="home-intro__syms">
              {SYMBOLS.map((symbol, i) => (
                <span
                  key={symbol}
                  style={{
                    left: `${8 + ((i * 11) % 84)}%`,
                    top: `${12 + ((i * 29) % 72)}%`,
                    fontSize: `${14 + (i % 3) * 6}px`,
                    animationDelay: `${-i * 0.8}s`,
                  }}
                >
                  {symbol}
                </span>
              ))}
            </div>

            <div className="home-intro__hud hi-fi" style={{ "--d": "0.9s", "--t": "0.6s" }}>
              <span>
                <b />
                JP / Portfolio
              </span>
              <span>2026</span>
            </div>

            <div className="home-intro__stage">
              <div className="home-intro__name" aria-label="John Patrick Macaspac">
                {NAME_LETTERS.map((letter, i) => (
                  <i
                    key={i}
                    className="hi-ml"
                    aria-hidden="true"
                    style={{ "--d": `${1.5 + i * 0.045}s`, "--t": "0.6s" }}
                  >
                    {letter === " " ? "\u00a0" : letter}
                  </i>
                ))}
              </div>
              <div className="home-intro__role hi-fi" style={{ "--d": "2s", "--t": "0.5s" }}>
                {role}
              </div>
            </div>

            <div className="home-intro__log hi-fi" style={{ "--d": "1s" }}>
              {LOG_LINES.slice(0, logCount).map((line) => (
                <div key={line.text}>
                  &gt; {line.text}
                  <em>{line.text === "ready" ? "" : "ok"}</em>
                </div>
              ))}
            </div>

            <div className="home-intro__pct hi-fi" style={{ "--d": "1s" }}>
              <span>{percent}</span>
              <small>%</small>
            </div>

            <div className="home-intro__bar hi-fi" style={{ "--d": "1s" }}>
              <i ref={barRef} />
            </div>
          </div>
        </div>
      )}

      {/* The logo is its own layer so it can fly to the navbar and then stay there */}
      <svg
        ref={logoRef}
        id="home-intro-logo"
        className={`home-intro__logo${exiting ? " home-intro__logo--move home-intro__logo--exit" : ""}`}
        style={{ "--intro-speed": SPEED }}
        viewBox="0 0 200 200"
        width="140"
        height="140"
        fill="none"
        onTransitionEnd={handleLogoTransitionEnd}
      >
        <g className="home-intro__ring">
          <circle
            className="hi-dr"
            pathLength={1}
            style={{ strokeDasharray: 1, "--d": "0.4s", "--t": "1.2s" }}
            cx="100"
            cy="100"
            r="92"
            stroke="url(#home-intro-ring-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
        </g>
        <g
          className="home-intro__brackets"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            className="hi-dr"
            pathLength={1}
            style={{ strokeDasharray: 1, "--d": "0.6s", "--t": "1s" }}
            d="M 78 38 L 32 100 L 78 162"
          />
          <path
            className="hi-dr"
            pathLength={1}
            style={{ strokeDasharray: 1, "--d": "0.6s", "--t": "1s" }}
            d="M 122 38 L 168 100 L 122 162"
          />
        </g>
        <text
          className="hi-fi"
          style={{ "--d": "1.4s", "--t": "0.5s" }}
          x="100"
          y="112"
          textAnchor="middle"
          fontFamily="ui-monospace, Consolas, monospace"
          fontWeight="bold"
          fontSize="32"
          fill="#dcf0ff"
        >
          JP
        </text>
        <defs>
          <linearGradient id="home-intro-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff8c1a" />
            <stop offset="1" stopColor="#5bc0ff" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}