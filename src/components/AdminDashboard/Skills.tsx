import React, { useState } from "react";
import { X, Plus } from "lucide-react";

interface UserType {
  id: number;
  name: string;
  email: string;
  skills: string[];
}

interface SkillType {
  id: number;
  name: string;
}

const allSkills: SkillType[] = [
  { id: 1, name: "React" },
  { id: 2, name: "Node.js" },
  { id: 3, name: "UI/UX Design" },
  { id: 4, name: "Digital Marketing" },
  { id: 5, name: "Data Science" },
];

const initialUsers: UserType[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", skills: ["React"] },
  { id: 2, name: "Bob Smith", email: "bob@example.com", skills: [] },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com", skills: ["Node.js"] },
];

export const Skills: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [modalUser, setModalUser] = useState<UserType | null>(null);
  const [modalSkill, setModalSkill] = useState<number | null>(null);

  // Bulk user selection
  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Bulk skill assignment
  const assignSkillBulk = () => {
    if (!selectedSkill) return;
    const skillName = allSkills.find((s) => s.id === selectedSkill)?.name;
    if (!skillName) return;

    setUsers((prev) =>
      prev.map((user) =>
        selectedUsers.includes(user.id) && !user.skills.includes(skillName)
          ? { ...user, skills: [...user.skills, skillName] }
          : user
      )
    );
    setSelectedUsers([]);
    setSelectedSkill(null);
  };

  // Open modal for individual assignment
  const openModal = (user: UserType) => {
    setModalUser(user);
    setModalSkill(null);
  };

  // Assign skill individually
  const assignSkillModal = () => {
    if (!modalUser || !modalSkill) return;
    const skillName = allSkills.find((s) => s.id === modalSkill)?.name;
    if (!skillName) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === modalUser.id && !user.skills.includes(skillName)
          ? { ...user, skills: [...user.skills, skillName] }
          : user
      )
    );
    setModalUser(null);
  };

  const removeSkill = (userId: number, skillName: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, skills: user.skills.filter((s) => s !== skillName) }
          : user
      )
    );
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Assign Skills to Users</h1>
      <p className="text-gray-600 mb-6">
        Assign skills individually or in bulk to enhance user development.
      </p>

      {/* Bulk Assignment */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Bulk Assignment</h2>
        <div className="flex items-center space-x-4 mb-4">
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            onChange={(e) => setSelectedSkill(Number(e.target.value))}
          >
            <option value="">Select Skill</option>
            {allSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={assignSkillBulk}
          >
            Assign Skill
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={() =>
                      setSelectedUsers(
                        selectedUsers.length === users.length
                          ? []
                          : users.map((u) => u.id)
                      )
                    }
                  />
                </th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Skills</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-200">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                    />
                  </td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(user.id, skill)}
                          className="p-0.5 rounded hover:bg-green-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </td>
                  <td className="p-3">
                    <button
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      onClick={() => openModal(user)}
                    >
                      <Plus className="w-4 h-4" /> Assign Skill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for individual assignment */}
      {modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setModalUser(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Assign Skill to {modalUser.name}
            </h3>
            <select
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full mb-4"
              onChange={(e) => setModalSkill(Number(e.target.value))}
            >
              <option value="">Select Skill</option>
              {allSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              onClick={assignSkillModal}
            >
              Assign Skill
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
