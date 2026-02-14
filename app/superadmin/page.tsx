export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Super Admin Dashboard
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, Super Admin!</h2>
          <p className="text-gray-600 mb-4">
            This is your super admin dashboard. From here you can manage all clients.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              ✅ Authentication system is working
            </p>
            <p className="text-sm text-gray-500">
              🚧 Client management features coming next
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
