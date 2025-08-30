import { logout } from "../../api/auth.js";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Travel Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.name || user?.email || "User"}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard Content
              </h2>
              <p className="text-gray-600 mb-8">
                This is a protected route. Only authenticated users can see this
                content.
              </p>

              {user && (
                <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    User Information
                  </h3>
                  <div className="space-y-2 text-left">
                    {user.name && (
                      <p>
                        <span className="font-medium">Name:</span> {user.name}
                      </p>
                    )}
                    {user.email && (
                      <p>
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                    )}
                    {user.role && (
                      <p>
                        <span className="font-medium">Role:</span> {user.role}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
