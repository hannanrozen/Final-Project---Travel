export default function SimpleHome() {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          Welcome to Explora Travel
        </h1>

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-gray-600 mb-8">
            Your travel adventure starts here. Book amazing activities and
            experiences around the world.
          </p>

          <div className="space-y-4">
            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              Login
            </a>
            <a
              href="/register"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
