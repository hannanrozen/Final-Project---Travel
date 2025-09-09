import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function SimpleLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [testResult, setTestResult] = useState("");

  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTestResult("Testing login...");

    try {
      const result = await login(formData);
      setTestResult(`Login successful: ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      setTestResult(`Login failed: ${err.message}`);
    }
  };

  const testAPIConnection = async () => {
    setTestResult("Testing API connection...");

    try {
      const response = await fetch(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/banners",
        {
          headers: {
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTestResult(
          `API Connection successful: ${data.data?.length || 0} banners found`
        );
      } else {
        setTestResult(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`Network Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Simple Login Test
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password:
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Test Login"}
          </button>
        </form>

        <button
          onClick={testAPIConnection}
          className="w-full mt-4 bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Test API Connection
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
            Auth Error: {error}
          </div>
        )}

        {testResult && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded text-blue-700">
            <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
