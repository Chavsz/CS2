import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar";
import Login from "./auth/login";
import Register from "./auth/register";
import Header from "./header";
import TimeSeries from "./Time-Series"
import { useAuth } from "./contexts/authContexts/auth";
import type { AuthContextType } from "./contexts/authContexts/auth";

// Pages
import Records from "./Records";
import Dashboard from "./dashboard";
import AddRecords from "./addRecords"

const App = () => {
  const { userLoggedIn } = (useAuth() as AuthContextType);
  const containerClass = userLoggedIn
    ? "grid grid-cols-[80px_1fr] md:grid-cols-[240px_1fr] transition-width duration-300 bg-[#fafafc] min-h-screen"
    : "bg-[#fafafc] min-h-screen";
  return (
    <div className={containerClass}>
      {userLoggedIn && <Sidebar />}
      <div className="min-w-0 w-full">
        <Routes>
          <Route path="/" element={userLoggedIn ? (
            <>
              <Header />
              <Dashboard />
            </>
          ) : <Login />} />
          <Route path="/addRecords" element={userLoggedIn ? (
            <>
              <Header />
              <AddRecords />
            </>
          ) : <Login />} />
          <Route path="/records" element={userLoggedIn ? (
            <>
              <Header />
              <Records />
            </>
          ) : <Login />} />
          <Route path="/timeseries" element={userLoggedIn ? (
            <>
              <Header />
              <TimeSeries />
            </>
          ) : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  )
}

export default App