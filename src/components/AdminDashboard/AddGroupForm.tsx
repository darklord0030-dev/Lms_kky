import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import axios from "axios";

interface Group {
  id: number;
  name: string;
  description?: string;
  branch?: string;
  date?: Date;
  autoEnroll?: boolean;
  groupKey?: string;
}

interface AddGroupFormProps {
  onBack: () => void;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  editGroup?: Group;
}

const AddGroupForm: React.FC<AddGroupFormProps> = ({
  onBack,
  groups,
  setGroups,
  editGroup,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    autoEnroll: false,
    assignGroupKey: false,
    groupKey: "",
  });

  const [showKeyModal, setShowKeyModal] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editGroup) {
      setFormData({
        name: editGroup.name,
        description: editGroup.description || "",
        autoEnroll: editGroup.autoEnroll || false,
        assignGroupKey: !!editGroup.groupKey,
        groupKey: editGroup.groupKey || "",
      });
    }
  }, [editGroup]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateGroupKey = () => {
    const key = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData((prev) => ({ ...prev, groupKey: key }));
    setShowKeyModal(true);
    setTimeout(() => setShowKeyModal(false), 5000);
  };

  useEffect(() => {
    if (formData.assignGroupKey && !formData.groupKey) {
      generateGroupKey();
    } else if (!formData.assignGroupKey) {
      setFormData((prev) => ({ ...prev, groupKey: "" }));
      setShowKeyModal(false);
    }
  }, [formData.assignGroupKey]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Group name is required!");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        autoenroll: Boolean(formData.autoEnroll),
        groupkey: Boolean(formData.assignGroupKey),
      };

      if (editGroup) {
        // Update existing group
        const { data: updatedGroup } = await axios.put<Group>(
          `http://localhost:3000/api/group/${editGroup.id}`,
          payload
        );
        const updatedGroups = groups.map((g) =>
          g.id === editGroup.id ? updatedGroup : g
        );
        setGroups(updatedGroups);
        toast.success("Changes saved successfully!");
      } else {
        // Create new group
        const { data: newGroup } = await axios.post<Group>(
          "http://localhost:3000/api/group",
          payload
        );
        setGroups([...groups, newGroup]);
        toast.success("Success! New group created.");
      }

      onBack();
    } catch (error: any) {
      console.error("Error saving group:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save group. Try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center space-x-4 text-3xl">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Groups
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-normal text-gray-900 mb-8">
          {editGroup ? "Edit group" : "Add group"}
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              placeholder="Short description up to 500 characters"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="autoEnroll"
                checked={formData.autoEnroll}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
              <span className="text-gray-900 font-medium">Auto Enroll</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="assignGroupKey"
                checked={formData.assignGroupKey}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
              <span className="text-gray-900 font-medium">
                Assign Group Key
              </span>
            </label>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Group Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Generated Group Key</h2>
            <p className="text-xl font-mono">{formData.groupKey}</p>
            <p className="text-gray-500 text-sm mt-2">
              This key will be assigned to the group.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGroupForm;
