export default function ApiUnavailable() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-orange-500 text-6xl mb-4">🌐</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          API Unavailable
        </h1>
        <p className="text-gray-600 mb-4">
          The application is running, but it can't connect to the backend server.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          This is normal for frontend-only deployments. The app will work for UI demonstration purposes.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full"
          >
            Continue to App
          </button>
          
          <div className="text-xs text-gray-500">
            <p>To enable full functionality:</p>
            <p>1. Deploy your backend server</p>
            <p>2. Set VITE_API_URL environment variable</p>
          </div>
        </div>
      </div>
    </div>
  )
} 