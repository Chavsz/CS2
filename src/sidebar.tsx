import RouteSelect from "./routeSelect";

const Sidebar = () => {
  return (
    <div className="p-4 text-white sticky top-0 bg-[#f0faf3] h-screen">
      <div className="top-4 h-[calc(100vh-32px-50px)]">
      <h1 className="text-xl md:text-2xl font-bold text-center text-green-600 mb-9 hidden md:block">PH Emigrants</h1>
        <RouteSelect />
      </div>
    </div>
  );
};

export default Sidebar;
