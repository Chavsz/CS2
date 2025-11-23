import RouteSelect from "./routeSelect";
import * as fiIcons from "react-icons/fi";
import { doSignOut } from "./auth";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await doSignOut();
      navigate("/login", { replace: true });
    } catch (e) {
      // no-op: Toaster in pages will show any errors triggered there if needed
    }
  };
  return (
    <div className=" text-white sticky top-0 bg-white h-screen border-r-2 border-gray-200">
      <div className="top-4 h-[calc(100vh-32px-50px)]">
      <h1 className="text-xl md:text-2xl font-bold text-center text-indigo-600 hidden md:block border-b-2 border-gray-200 px-4 py-3.5">PH Emigrants</h1>
        <div className="p-4">
          <RouteSelect />
        </div>
      </div>

      <div className="p-4">
        <button
          className="flex items-center md:justify-start justify-center gap-2 w-full rounded px-2 py-1.5 md:text-sm text-1xl hover:bg-stone-100 text-[#696969] shadow-none "
          onClick={logout}
        >
          <fiIcons.FiLogOut /> <p className="text-md font-semibold hidden md:block">Log out</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
