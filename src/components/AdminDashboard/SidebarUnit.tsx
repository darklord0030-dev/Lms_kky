import React from 'react';
import { Menu, Plus, FileText, MessageSquare, PenTool, Users, MoreHorizontal, Eye, Settings, Copy, Printer, Trash2, Edit3, BookOpen, Play, Package } from 'lucide-react';

interface Unit {
  id: string;
  name: string;
  type: 'test' | 'survey' | 'assignment' | 'ilt' | 'content' | 'video' | 'scorm';
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedUnit: string;
  onUnitSelect: (unitId: string) => void;
  onAddUnit: () => void;
  units: Unit[];
  activeDropdown: string | null;
  onDropdownToggle: (unitId: string | null) => void;
}

export default function SidebarUnit({ 
  isCollapsed, 
  onToggle, 
  selectedUnit, 
  onUnitSelect, 
  onAddUnit, 
  units, 
  activeDropdown, 
  onDropdownToggle 
}: SidebarProps) {
  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'test':
        return FileText;
      case 'survey':
        return MessageSquare;
      case 'assignment':
        return PenTool;
      case 'ilt':
        return Users;
      case 'content':
        return BookOpen;
      case 'video':
        return Play;
      case 'scorm':
        return Package;
      default:
        return FileText;
    }
  };

  return (
    <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    } flex-shrink-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        {!isCollapsed && (
          <button className="bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Publish
          </button>
        )}
      </div>

      <div className="p-4">
        {!isCollapsed && (
          <div className="mb-4">
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Back
            </button>
          </div>
        )}

        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New course</h2>
        )}

        <button
          onClick={onAddUnit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 mb-6 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>Add</span>}
        </button>

        <div className="space-y-2">
          {units.map((unit) => {
            const IconComponent = getUnitIcon(unit.type);
            return (
              <div key={unit.id} className="relative">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUnit === unit.id 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onUnitSelect(unit.id)}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${
                      selectedUnit === unit.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    {!isCollapsed && (
                      <span className={`text-sm font-medium ${
                        selectedUnit === unit.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {unit.name}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDropdownToggle(activeDropdown === unit.id ? null : unit.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {activeDropdown === unit.id && !isCollapsed && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <Eye className="w-4 h-4" />
                        Unpublish unit
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <Settings className="w-4 h-4" />
                        {unit.type === 'test' ? 'Test options' : 
                         unit.type === 'survey' ? 'Survey options' : 
                         unit.type === 'assignment' ? 'Assignment options' : 
                         unit.type === 'ilt' ? 'ILT options' :
                         'Unit options'}
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <Edit3 className="w-4 h-4" />
                        Rename
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <Copy className="w-4 h-4" />
                        Clone
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}