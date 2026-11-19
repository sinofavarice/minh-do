import { SiteHeader } from "../components/SiteHeader";
import "./Placeholder.css";

type PlaceholderProps = {
  title: string;
};

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <main className="placeholder">
      <SiteHeader />
      <div className="placeholder__body">
        <p className="placeholder__brand">minh do</p>
        <h1 className="placeholder__title">{title}</h1>
      </div>
    </main>
  );
}
