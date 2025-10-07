import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import AddRecords from "./addRecords";

const App = () => {
  return (
    <div className="grid grid-cols-[80px_1fr] md:grid-cols-[240px_1fr] transition-width duration-300 bg-white min-h-screen">
      <Sidebar />
      <div className="p-4">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/addRecords" element={<AddRecords />} />
        </Routes>
      </div>
    </div>
  )
}

export default App