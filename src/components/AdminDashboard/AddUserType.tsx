import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                TYPES & DATA                                */
/* -------------------------------------------------------------------------- */

export type Role = "Administrator" | "Instructor" | "Learner" | "General";

export interface PermissionCategory {
  name: string;
  permissions: string[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  { name: "Users", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Courses", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Learning paths", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Groups", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Categories", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Branches", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Skills", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "AI", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Events engine", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Import - Export", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "User types", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Account & Settings", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Reports", permissions: ["View", "Create", "Update", "Delete"] },
  { name: "Files", permissions: ["View", "Create", "Update", "Delete"] },
];

export const AVAILABLE_ROLES: Role[] = ["Administrator", "Instructor", "Learner", "General"];

/* -------------------------------------------------------------------------- */
/*                              PERMISSION CHECKBOX                            */
/* -------------------------------------------------------------------------- */

interface PermissionCheckboxProps {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  isParent?: boolean;
}

const PermissionCheckbox: React.FC<PermissionCheckboxProps> = ({
  label,
  checked,
  indeterminate = false,
  onChange,
  isParent = false,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1 px-2 rounded">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
      />
      <span className={`${isParent ? "font-medium" : ""} text-sm`}>{label}</span>
    </label>
  );
};

/* -------------------------------------------------------------------------- */
/*                               ADD USER TYPE                                */
/* -------------------------------------------------------------------------- */

interface AddUserTypeProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

interface RolePermissions {
  [role: string]: {
    [category: string]: {
      [permission: string]: boolean;
    };
  };
}

const AddUserType: React.FC<AddUserTypeProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [defaultRole, setDefaultRole] = useState<Role>("Administrator");
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());
  const [expandedRoles, setExpandedRoles] = useState<Set<Role>>(new Set());
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [isSaving, setIsSaving] = useState(false);

  /* --------------------------- Role Handlers --------------------------- */
  const toggleRole = (role: Role) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
      setExpandedRoles((prev) => {
        const copy = new Set(prev);
        copy.delete(role);
        return copy;
      });
    } else newRoles.add(role);
    setSelectedRoles(newRoles);
  };

  const toggleRoleExpansion = (role: Role) => {
    const newExpanded = new Set(expandedRoles);
    newExpanded.has(role) ? newExpanded.delete(role) : newExpanded.add(role);
    setExpandedRoles(newExpanded);
  };

  const isRoleChecked = (role: Role): boolean => selectedRoles.has(role);

  /* --------------------------- Category / Permission Logic --------------------------- */

  const isCategoryChecked = (role: Role, category: string): boolean => {
    const perms = rolePermissions[role]?.[category];
    if (!perms) return false;
    return Object.values(perms).every(Boolean);
  };

  const isCategoryIndeterminate = (role: Role, category: string): boolean => {
    const perms = rolePermissions[role]?.[category];
    if (!perms) return false;
    const vals = Object.values(perms);
    return vals.some(Boolean) && !vals.every(Boolean);
  };

  const isPermissionChecked = (role: Role, category: string, permission: string) =>
    rolePermissions[role]?.[category]?.[permission] === true;

  const toggleCategoryPermissions = (role: Role, category: string, checked: boolean) => {
    setRolePermissions((prev) => {
      const copy = structuredClone(prev);
      if (!copy[role]) copy[role] = {};
      if (!copy[role][category]) copy[role][category] = {};
      const categoryData = PERMISSION_CATEGORIES.find((c) => c.name === category);
      if (categoryData) {
        categoryData.permissions.forEach((perm) => {
          copy[role][category][perm] = checked;
        });
      }
      return copy;
    });
  };

  const togglePermission = (role: Role, category: string, permission: string, checked: boolean) => {
    setRolePermissions((prev) => {
      const copy = structuredClone(prev);
      if (!copy[role]) copy[role] = {};
      if (!copy[role][category]) copy[role][category] = {};
      copy[role][category][permission] = checked;
      return copy;
    });
  };

  /* ------------------------------- Save ------------------------------- */

const handleSave = () => {
  if (!name.trim()) return alert("Please enter a user type name");
  if (selectedRoles.size === 0) return alert("Select at least one role");

  setIsSaving(true);

  const payload = {
    name: name.trim(),
    defaultRole,
    roles: Array.from(selectedRoles),
    permissions: rolePermissions,
  };

  // ✅ Save multiple user types instead of overwriting
  const existingData = JSON.parse(localStorage.getItem("createdUserTypes") || "[]");
  existingData.push(payload);  


  localStorage.setItem("createdUserTypes", JSON.stringify(existingData));

  
  // ✅ Trigger optional callback
  onSave?.(payload);

  setTimeout(() => {
    alert("✅ User type saved locally!");
    setIsSaving(false);
    // Don’t clear form until after save confirmed
    handleCancel();
    onCancel?.();
  }, 500);
};

  const handleCancel = () => {
    setName("");
    setDefaultRole("Administrator");
    setSelectedRoles(new Set());
    setExpandedRoles(new Set());
    setRolePermissions({});
  };

  /* ------------------------------- UI ------------------------------- */

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-8">Add User Type</h1>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Manager"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Default Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Default Role</label>
            <select
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value as Role)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {AVAILABLE_ROLES.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-2">
              Default role applies when user logs in for the first time.
            </p>
          </div>

          {/* Roles */}
          <div className="pt-4">
            {AVAILABLE_ROLES.map((role) => (
              <div key={role} className="mb-2">
                <PermissionCheckbox
                  label={role}
                  checked={isRoleChecked(role)}
                  onChange={() => toggleRole(role)}
                  isParent
                />
                {isRoleChecked(role) && (
                  <div className="ml-6 mt-2">
                    <button
                      onClick={() => toggleRoleExpansion(role)}
                      className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-1"
                    >
                      {expandedRoles.has(role) ? (
                        <ChevronDown className="w-4 h-4 inline" />
                      ) : (
                        <ChevronRight className="w-4 h-4 inline" />
                      )}
                      Permissions
                    </button>

                    {expandedRoles.has(role) && (
                      <div className="ml-4 border-l border-gray-200 pl-3">
                        {PERMISSION_CATEGORIES.map((category) => (
                          <div key={category.name} className="mb-1">
                            <PermissionCheckbox
                              label={category.name}
                              checked={isCategoryChecked(role, category.name)}
                              indeterminate={isCategoryIndeterminate(role, category.name)}
                              onChange={(checked) =>
                                toggleCategoryPermissions(role, category.name, checked)
                              }
                              isParent
                            />
                            <div className="ml-5">
                              {category.permissions.map((permission) => (
                                <PermissionCheckbox
                                  key={permission}
                                  label={permission}
                                  checked={isPermissionChecked(role, category.name, permission)}
                                  onChange={(checked) =>
                                    togglePermission(role, category.name, permission, checked)
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserType;
