import { faBook, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@tanstack/react-router";

export const Gutter = () => {
  const linkClass =
    "px-2.5 py-2 rounded hover:bg-gray-800/50 data-[status=active]:bg-gray-800/50";

  return (
    <div className="flex flex-col gap-3 px-2 py-3 text-xs text-gray-300">
      <Link to="/" className={linkClass}>
        <FontAwesomeIcon icon={faHome} />
      </Link>

      <Link to="/documents" className={linkClass}>
        <FontAwesomeIcon icon={faBook} />
      </Link>
    </div>
  );
};
