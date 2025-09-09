export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🎉 React App is Working!
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          If you can see this page, your React application is running correctly.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">✅ React Router: Working</p>
          <p className="text-sm text-gray-500">✅ Tailwind CSS: Working</p>
          <p className="text-sm text-gray-500">✅ Vite Dev Server: Working</p>
        </div>
      </div>
    </div>
  );
}
