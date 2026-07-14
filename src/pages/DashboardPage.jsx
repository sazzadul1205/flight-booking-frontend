import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { profile, profileLoading, logout } = useAuth();

  if (profileLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="page">
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        {profile && (
          <div className="profile-info">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>ID:</strong> {profile.id}</p>
          </div>
        )}
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default DashboardPage;