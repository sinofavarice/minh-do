import { NavLink } from "react-router-dom";
import "./SiteNav.css";

const links = [
  { to: "/", label: "minh do", end: true },
  { to: "/work", label: "work" },
  { to: "/archive", label: "archive" },
  { to: "/info", label: "info" },
] as const;

type SiteNavProps = {
  overlay?: boolean;
};

export function SiteNav({ overlay = false }: SiteNavProps) {
  return (
    <nav
      className={overlay ? "site-nav site-nav--overlay" : "site-nav"}
      aria-label="Primary"
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={"end" in link ? link.end : false}
          className={({ isActive }) =>
            isActive ? "site-nav__link is-active" : "site-nav__link"
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
