import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">This route does not exist.</p>
      <Link to="/" className="mt-4 inline-block underline">
        Go Home
      </Link>
    </div>
  );
}
