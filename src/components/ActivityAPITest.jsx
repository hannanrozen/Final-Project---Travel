import React, { useState } from "react";
import { getActivityById } from "../api/activity";

const ActivityAPITest = () => {
  const [activityId, setActivityId] = useState(
    "ae4ee8db-0cd9-4e94-a2d4-a9f1fce6046c"
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log("Testing API with ID:", activityId);
      const response = await getActivityById(activityId);
      console.log("API Response:", response);
      setResult(response);
    } catch (error) {
      console.error("API Error:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Activity API Test</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Activity ID:</label>
        <input
          type="text"
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder="Enter activity ID"
        />
      </div>

      <button
        onClick={testAPI}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test API"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">API Result:</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ActivityAPITest;
