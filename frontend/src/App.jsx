import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './utils/constants';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchRides from './pages/SearchRides';
import RideDetailsPage from './pages/RideDetailsPage';
import CreateRide from './pages/CreateRide';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';  // Add this import
import Dashboard from './pages/Dashboard';
import MyRides from './pages/MyRides';
import MyRequests from './pages/MyRequests';
import RideRequests from './pages/RideRequests';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.SEARCH} element={<SearchRides />} />
      <Route path={ROUTES.RIDE_DETAILS_PATH} element={<RideDetailsPage />} />

      {/* Profile routes - order matters! */}
      <Route path={ROUTES.PROFILE_PATH} element={<Profile />} /> {/* /profile/:id */}

      {/* Protected Routes */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      /> {/* /profile - own profile */}

      <Route
        path={ROUTES.PROFILE_EDIT}
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      /> {/* /settings/profile - edit profile */}

      <Route
        path={ROUTES.CREATE_RIDE}
        element={
          <ProtectedRoute>
            <CreateRide />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_RIDES}
        element={
          <ProtectedRoute>
            <MyRides />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_REQUESTS}
        element={
          <ProtectedRoute>
            <MyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RIDE_REQUESTS}
        element={
          <ProtectedRoute>
            <RideRequests />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default App;