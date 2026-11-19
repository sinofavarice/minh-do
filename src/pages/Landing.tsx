import { useCallback, useRef, useState, type MouseEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { WorkPreview } from "../components/WorkPreview";
import "./Landing.css";

const links = [
  { to: "/", label: "minh do", end: true },
  { to: "/work", label: "work", preview: true, onPhoto: true },
  { to: "/archive", label: "archive", onPhoto: true },
  { to: "/info", label: "info" },
] as const;

export function Landing() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const exitLock = useRef(false);

  const goToWork = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (exitLock.current) return;
      exitLock.current = true;
      setExiting(true);
      window.setTimeout(() => {
        navigate("/work");
      }, 780);
    },
    [navigate],
  );

  return (
    <main
      className={exiting ? "landing landing--to-work" : "landing"}
    >
      <div className="landing__stage">
        <img
          className="landing__hero"
          src="/hero.jpg"
          alt=""
          width={668}
          height={456}
          draggable={false}
        />

        <WorkPreview />

        <div className="landing__hover-bridge" aria-hidden="true" />

        <nav className="landing__nav" aria-label="Primary">
          {links.map((link) => {
            const isWork = "preview" in link && link.preview;
            const onPhoto = "onPhoto" in link && link.onPhoto;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={"end" in link ? link.end : false}
                onClick={isWork ? goToWork : undefined}
                className={({ isActive }) =>
                  [
                    "landing__link",
                    isWork ? "landing__link--work" : "",
                    onPhoto ? "landing__link--on-photo" : "",
                    isActive ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <p className="landing__signature" aria-hidden="true">
          minh do
        </p>
      </div>
    </main>
  );
}
