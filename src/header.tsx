import { useAuth } from "./contexts/authContexts/auth";
import type { AuthContextType } from "./contexts/authContexts/auth";

import { IoPerson } from "react-icons/io5";

const Header = () => {
  const { currentUser } = (useAuth() as AuthContextType);

  return (
    <div className="w-full bg-white border-b-2 border-gray-200 py-4 px-8">
      <div className="flex justify-end items-center">
        {currentUser?.email && (
          <div className="flex items-center gap-2 border-l-2 border-gray-400 pl-4">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <IoPerson className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{currentUser.email}</span>

          </div>
        )}
      </div>
    </div>
  )
}

export default Header