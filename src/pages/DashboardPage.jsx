import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const { profile, profileLoading, logout } = useAuth();
  console.log(profile);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={() => (window.location.href = "/Config")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            ⚙️ Configure
          </button>
          <button
            onClick={() => (window.location.href = "/Search")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            ⚙️ Search
          </button>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {profile && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Name:</span>{" "}
              <span className="text-gray-900">{profile?.data?.name}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span>{" "}
              <span className="text-gray-900">{profile?.data?.email}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">ID:</span>{" "}
              <span className="text-gray-900">{profile?.data?.id}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
