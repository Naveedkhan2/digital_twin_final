import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-white/70 mb-6">Page not found</p>
        <Link to="/dashboard" className="text-cyan-400 hover:text-cyan-300 underline font-medium">
          Back to System Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
