export function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Holmen Skole 4C Trafikkvakt
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">P</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Parents</div>
              <div className="text-2xl font-bold text-gray-900">24</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">C</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Crossings</div>
              <div className="text-2xl font-bold text-gray-900">5</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">W</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Active Weeks</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">D</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Duties</div>
              <div className="text-2xl font-bold text-gray-900">150</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <a
                href="/parents"
                className="block w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="font-medium">Add New Parent</div>
                <div className="text-sm text-primary-600">Register a new parent volunteer</div>
              </a>
              <a
                href="/crossings"
                className="block w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="font-medium">Manage Crossings</div>
                <div className="text-sm text-green-600">Add or edit traffic crossings</div>
              </a>
              <a
                href="/duties"
                className="block w-full text-left px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="font-medium">Generate Duty Schedule</div>
                <div className="text-sm text-yellow-600">Create assignments for a new week</div>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-900">John Smith added to Main Street crossing</div>
                  <div className="text-gray-500">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-900">Week 42 duties generated</div>
                  <div className="text-gray-500">1 day ago</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-900">Sarah Johnson requested duty swap</div>
                  <div className="text-gray-500">2 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}