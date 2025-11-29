import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  Copy, 
  Settings, 
  ChevronRight,
  FileText,
  Cloud,
  Play,
  Volume2,
  Monitor,
  Code,
  FileCheck,
  BarChart3,
  Edit,
  GraduationCap,
  BookOpen,
  Quote,
  Link,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function CourseSidebar({ isOpen, onToggle }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [showActivitiesMenu, setShowActivitiesMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const contentItems = [
    { icon: FileText, label: 'Content' },
    { icon: Cloud, label: 'Web content' },
    { icon: Play, label: 'Video' },
    { icon: Volume2, label: 'Audio' },
    { icon: Monitor, label: 'Presentation | Document' },
    { icon: Code, label: 'iFrame' },
  ];

  const activityItems = [
    { icon: FileCheck, label: 'Test' },
    { icon: BarChart3, label: 'Survey' },
    { icon: Edit, label: 'Assignment' },
    { icon: GraduationCap, label: 'Instructor-led training' },
    { icon: BookOpen, label: 'SCORM | xAPI | cmi5' },
  ];

  const moreItems = [
    { icon: Quote, label: 'Section' },
    { icon: Copy, label: 'Clone from another course' },
    { icon: Link, label: 'Link from another course' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto w-80`}>
        
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
          <button 
            onClick={onToggle}
            className="p-1 hover:bg-blue-800 rounded lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors">
            Publish
          </button>
        </div>

        {/* Back button */}
        <div className="p-4 border-b border-gray-200">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Back
          </button>
        </div>

        {/* Course title and actions */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New course</h2>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Add
            </button>
            <button className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded transition-colors">
              <Users className="w-4 h-4" />
            </button>
            <button className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content sections */}
        <div className="flex-1 overflow-y-auto">
          {/* TalentCraft */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">TalentCraft</div>
                <div className="text-sm text-gray-600">Create rich content, with the power of AI</div>
              </div>
            </div>
          </div>

          {/* Standard Content */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => {
                toggleSection('content');
                setShowContentMenu(!showContentMenu);
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Standard Content</div>
                  <div className="text-sm text-gray-600">Add Text, Video, Presentation, etc</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showContentMenu ? 'rotate-90' : ''}`} />
            </button>
            
            {showContentMenu && (
              <div className="bg-white border-l-2 border-blue-500 ml-4">
                {contentItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Learning Activities */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => {
                toggleSection('activities');
                setShowActivitiesMenu(!showActivitiesMenu);
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Learning Activities</div>
                  <div className="text-sm text-gray-600">Add Test, Scorm, Survey, ILT etc</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showActivitiesMenu ? 'rotate-90' : ''}`} />
            </button>
            
            {showActivitiesMenu && (
              <div className="bg-white border-l-2 border-blue-500 ml-4">
                {activityItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => {
                toggleSection('more');
                setShowMoreMenu(!showMoreMenu);
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">More</div>
                  <div className="text-sm text-gray-600">Add section, clone units, etc</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showMoreMenu ? 'rotate-90' : ''}`} />
            </button>
            
            {showMoreMenu && (
              <div className="bg-white border-l-2 border-blue-500 ml-4">
                {moreItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add content section */}
          <div className="p-4">
            <div className="text-center">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-blue-600 mb-1">Add content to your course</div>
              <div className="text-sm text-gray-600">
                Drag and drop files here, or click the Add button above, to build your course.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}