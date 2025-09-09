import { useState, useEffect } from "react";

export default function APITest() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint, name) => {
    try {
      const baseURL = `${import.meta.env.VITE_API_BASE_URL}/api/${
        import.meta.env.VITE_API_VERSION
      }`;
      const fullURL = `${baseURL}${endpoint}`;

      console.log(`Testing ${name}: ${fullURL}`);

      const response = await fetch(fullURL, {
        headers: {
          apiKey: import.meta.env.VITE_API_KEY,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      setResults((prev) => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          url: fullURL,
          data: response.ok
            ? `${data?.data?.length || 0} items`
            : data?.message || "Error",
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          status: "Error",
          ok: false,
          url: `${import.meta.env.VITE_API_BASE_URL}/api/${
            import.meta.env.VITE_API_VERSION
          }${endpoint}`,
          data: error.message,
        },
      }));
    }
  };

  useEffect(() => {
    const runTests = async () => {
      setLoading(true);
      setResults({});

      const tests = [
        ["/banners", "Banners"],
        ["/activities", "Activities"],
        ["/promos", "Promos"],
        ["/categories", "Categories"],
      ];

      for (const [endpoint, name] of tests) {
        await testAPI(endpoint, name);
      }

      setLoading(false);
    };

    runTests();
  }, []);

  const runAllTests = async () => {
    setLoading(true);
    setResults({});

    const tests = [
      ["/banners", "Banners"],
      ["/activities", "Activities"],
      ["/promos", "Promos"],
      ["/categories", "Categories"],
    ];

    for (const [endpoint, name] of tests) {
      await testAPI(endpoint, name);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto m-8">
      <h2 className="text-2xl font-bold mb-4">API Integration Test</h2>

      <div className="mb-4">
        <p>
          <strong>Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}
        </p>
        <p>
          <strong>API Version:</strong> {import.meta.env.VITE_API_VERSION}
        </p>
        <p>
          <strong>API Key:</strong>{" "}
          {import.meta.env.VITE_API_KEY ? "Present" : "Missing"}
        </p>
      </div>

      <button
        onClick={runAllTests}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Run Tests"}
      </button>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]) => (
          <div
            key={name}
            className={`p-4 border rounded ${
              result.ok
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <h3 className="font-semibold">{name}</h3>
            <p>
              <strong>Status:</strong> {result.status}
            </p>
            <p>
              <strong>URL:</strong> {result.url}
            </p>
            <p>
              <strong>Result:</strong> {result.data}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
