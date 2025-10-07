
import { Link } from "react-router-dom";

const RouteSelect = () => {
  return <div className="space-y-1">
    <p className="text-[13px] font-extralight text-[#696969] hidden md:block">MENU</p>
    <Link to="/dashboard">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-extralight text-[#696969]">Total</p>
      </div>
    </Link>
    <Link to="/addRecords">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-extralight text-[#696969]">Add Records</p>
      </div>
    </Link>
  </div>;
};

export default RouteSelect;
