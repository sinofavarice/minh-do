import { NavLink } from "react-router-dom";
import "./SiteHeader.css";

const links = [
  { to: "/", label: "minh do", end: true },
  { to: "/work", label: "work" },
  { to: "/archive", label: "archive" },
  { to: "/info", label: "info" },
] as const;

type SiteHeaderProps = {
  animateIn?: boolean;
};

export function SiteHeader({ animateIn = false }: SiteHeaderProps) {
  return (
    <header
      className={
        animateIn ? "site-header site-header--in" : "site-header"
      }
    >
      <nav className="site-header__nav" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={"end" in link ? link.end : false}
            className={({ isActive }) =>
              isActive
                ? "site-header__link is-active"
                : "site-header__link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
