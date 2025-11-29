import React, { useState , useEffect} from "react";
import { Search, Eye, Edit, Trash2 } from "lucide-react";

interface Group {
  id: number;
  name: string;
  description?: string;
  branch?: string;
  price?: string;
}

const GroupInfo: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "", description: "-", branch: "-" },
  ]);

useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    setGroups(savedGroups);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Groups</h1>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Search box */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search"
            className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        </div>

        {/* Mass actions + Add group */}
        <div className="flex items-center space-x-3">
          <button className="border border-blue-500 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 flex items-center">
            Mass actions
            <span className="ml-2">▼</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Add group
          </button>
        </div>
      </div>

      {/* Groups table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-left">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-700">Group</th>
              <th className="px-6 py-3 font-medium text-gray-700">Description</th>
              <th className="px-6 py-3 font-medium text-gray-700">
                Branch <span className="ml-1">▲</span>
              </th>
              
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, index) => (
              <tr
                key={group.id}
                className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}
              >
                <td className="px-6 py-3">{group.name}</td>
                <td className="px-6 py-3">{group.description}</td>
                <td className="px-6 py-3">{group.branch}</td>
                <td className="px-6 py-3">{group.price}</td>
                <td className="px-6 py-3 flex items-center space-x-3">
                  <button className="text-gray-600 hover:text-blue-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupInfo;

            