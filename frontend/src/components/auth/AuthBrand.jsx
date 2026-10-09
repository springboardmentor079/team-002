import { Link } from "react-router-dom";

// Shared BuildTrack brand for every auth screen. Renders the exact same
// markup/classnames as before, wrapped in a react-router <Link> so clicking
// the logo navigates to the public landing page without a full page reload.
function AuthBrand({ variant = "desktop" }) {
  const className =
    variant === "mobile" ? "mobile-brand" : "brand";

  return (
    <Link
      to="/"
      className={className}
      aria-label="BuildTrack home"
    >
      <div className="logo">
        BT
      </div>

      <h2>
        BuildTrack
      </h2>
    </Link>
  );
}

export default AuthBrand;
