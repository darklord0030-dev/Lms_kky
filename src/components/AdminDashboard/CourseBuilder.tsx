import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  MoreHorizontal,
  Printer,
  Edit3,
  Eye,
  Copy,
  Settings,
  FileText,
  Volume2,
  Monitor,
  X,
  Menu,
  MessageSquare,
  Trash2,
  Sparkles,
  ClipboardCheck,
  PenTool,
  GraduationCap,
  FileCheck,
  Package,
  Quote,
  Link2,
  ChevronRight,
  Globe,
  PlayCircle,
  Presentation,
  Award,
  Calculator,
  MonitorCheck,
  Network,
  FolderOpen,
  Hand,
  Share2,
  BookOpen,
  Paperclip,
  Play,
  FolderEdit,
  Files,  
  ListOrderedIcon,
} from "lucide-react";

// Unit content pages (must exist)
import TestUnitContent from "./TestUnitContent";
import SurveyUnitContent from "./SurveyUnitContent";
import AssignmentUnitContent from "./AssignmentUnit";
import IltUnitContent from "./IltUnitContent";
import ContentUnitContent from "./CourseStructure";
import VideoUnitContent from "./VideoUnitContent";
import ScormUnitContent from "./ScormUnitContent";
import FrameUnitContent from "./FrameUnitContent";
import WebContent from "./WebContent";
import UnitOptionsPanel from "./UnitOptionsPanel";



interface ContentItem {
  id: number;
  type: string;
  title: string;
}

interface DropdownItem {
  icon: React.ReactNode;
  title: string;
  description?: string;
  hasSubmenu?: boolean;
  items?: DropdownItem[];
  type?: string;
}

interface Unit {
  id: string;
  name: string;
  type:
    | "test"
    | "survey"
    | "assignment"
    | "ilt"
    | "content"
    | "video"
    | "scorm"
    | "frame"
    | "web"
    | string;
}

export default function CourseBuilder() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [description, setDescription] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const [courseContents, setCourseContents] = useState<ContentItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const [activeSection, setActiveSection] = useState("info");
  const [activateStatus, setActivateStatus] = useState(false);
  const [activateCoach, setActivateCoach] = useState(false);
  const [videoType, setVideoType] = useState("youtube");
  const [publicSharing, setPublicSharing] = useState(false);
  const [enrollmentRequest, setEnrollmentRequest] = useState(false);
  const [timeType, setTimeType] = useState("time-limit");
  const [timeDays, setTimeDays] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [contentLock, setContentLock] = useState(false);
  const [accessRetention, setAccessRetention] = useState(false);
  const [unitsOrdering, setUnitsOrdering] = useState("sequential");
  const [completionRule, setCompletionRule] = useState("all-units");
  const [scoreCalculations, setScoreCalculations] = useState("all-tests");
  const [certificate, setCertificate] = useState("fancy");
  const [capacity, setCapacity] = useState("");
  const [courseVisibility, setCourseVisibility] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [title, setTitle] = useState("New course");

  const units: Unit[] = courseContents.map((c) => ({
    id: c.id.toString(),
    name: c.title,
    type: c.type as Unit["type"],
  }));

  // Panel mount / animate-out manager
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    if (settingsOpen) {
      setPanelMounted(true);
      // ensure next tick so transitions apply
      requestAnimationFrame(() => setPanelVisible(true));
    } else {
      // start closing animation
      setPanelVisible(false);
      // unmount after animation duration (match CSS duration: 300ms)
      const t = setTimeout(() => setPanelMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [settingsOpen]);

  const dropdownSections: DropdownItem[] = [
    {
      title: "Standard Content",
      icon: <FileText className="w-5 h-5" />,
      description: "Add Text, Video, Presentation, etc",
      hasSubmenu: true,
      items: [
        { icon: <FileText className="w-4 h-4" />, title: "Content" },
        { icon: <Globe className="w-4 h-4" />, title: "Web content" },
        { icon: <PlayCircle className="w-4 h-4" />, title: "Video" },
        { icon: <Volume2 className="w-4 h-4" />, title: "Audio" },
        { icon: <Presentation className="w-4 h-4" />, title: "Presentation | Document" },
        { icon: <Monitor className="w-4 h-4" />, title: "iFrame" },
      ],
    },
    {
      title: "Learning Activities",
      icon: <ClipboardCheck className="w-5 h-5" />,
      description: "Add Test, Scorm, Survey, ILT etc",
      hasSubmenu: true,
      items: [
        { icon: <FileCheck className="w-4 h-4" />, title: "Test" },
        { icon: <ClipboardCheck className="w-4 h-4" />, title: "Survey" },
        { icon: <PenTool className="w-4 h-4" />, title: "Assignment" },
        { icon: <GraduationCap className="w-4 h-4" />, title: "Instructor-led training" },
        { icon: <Package className="w-4 h-4" />, title: "SCORM | xAPI | cmi5" },
      ],
    },
    {
      title: "More",
      icon: <Menu className="w-5 h-5" />,
      description: "Add section, clone units, etc",
      hasSubmenu: true,
      items: [
        { icon: <Quote className="w-4 h-4" />, title: "Section" },
        { icon: <Copy className="w-4 h-4" />, title: "Clone from another course" },
        { icon: <Link2 className="w-4 h-4" />, title: "Link from another course" },
      ],
    },
  ];

  


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setActiveSubmenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.hasSubmenu) {
      setActiveSubmenu(activeSubmenu === item.title ? null : item.title);
    } else {
      addContentItem(item.title);
      setIsDropdownOpen(false);
      setActiveSubmenu(null);
    }
  };

  const handleSubitemClick = (subitem: DropdownItem) => {
    addContentItem(subitem.title);
    setIsDropdownOpen(false);
    setActiveSubmenu(null);
  };

  const addContentItem = (label: string) => {
    const type = label.toLowerCase().replace(/\s+/g, "-");
    setCourseContents([
      ...courseContents,
      { id: nextId, type, title: `${label} #${nextId}` },
    ]);
    setNextId(nextId + 1);
  };

  const removeContentItem = (id: number) => {
    setCourseContents(courseContents.filter((c) => c.id !== id));
    if (selectedUnit === id.toString()) setSelectedUnit(null);
  };

  const renameContentItem = (id: number) => {
    setCourseContents(courseContents.filter((c) => c.id !== id));
    if (selectedUnit === id.toString()) setSelectedUnit(null);
  };

  const cloneContentItem = (id: number) => {
    setCourseContents(courseContents.filter((c) => c.id !== id));
    if (selectedUnit === id.toString()) setSelectedUnit(null);
  };

  const printContentItem = (id: number) => {
    setCourseContents(courseContents.filter((c) => c.id !== id));
    if (selectedUnit === id.toString()) setSelectedUnit(null);
  };

  const currentUnit = units.find((u) => u.id === selectedUnit);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  // Drop area
  const [hover, setHover] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fl: FileList | null) => {
    if (!fl) return;
    setFiles((s) => [...s, ...Array.from(fl)]);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHover(false);
    handleFiles(e.dataTransfer.files);
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'test':
        return FileText;
      case 'survey':
        return MessageSquare;
      case 'assignment':
        return PenTool;
      case 'ilt':
      case 'instructor-led-training':
        return Users;
      case 'content':
        return BookOpen;
      case 'video':
        return Play;
      case 'scorm':
        return Package;
      case 'frame':
        return Monitor;
      case 'Presentation | Document':
        return Presentation;
      case 'Web content':
        return Globe;
      case 'audio':
        return Volume2;
      case 'Section':
        return Quote;
      case 'Link from another course':
        return Link2;
      case 'Clone from another course':
        return Copy;
      default:
        return FileText;
    }
  };

  const renderUnitContent = () => {
    if (!currentUnit) return <div className="text-gray-500 min-h-screen">Select a unit to get started</div>;
    switch (currentUnit.type) {
      case "test": return <TestUnitContent />;
      case "survey": return <SurveyUnitContent />;
      case "assignment": return <AssignmentUnitContent />;
      case "instructor-led-training":
      case "ilt": return <IltUnitContent />;
      case "content": return <ContentUnitContent />;
      case "video": return <VideoUnitContent />;
      case "scorm": return <ScormUnitContent />;
      case "frame": return <FrameUnitContent />;
      case "web": return <WebContent />;
      default: return <div className="p-4 text-gray-500">No content available</div>;
    }
  };

  return (
    <div className="flex h-screen bg-red-100 relative">
      {/* Sidebar */}
      <div
        className={`fixed lg:static z-30 h-full bg-white border-r border-gray-200 w-80 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
          <button id="menu-toggle" className="lg:hidden p-1 hover:bg-blue-800 rounded">
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 6h16"></path>
    <path d="M4 12h16"></path>
    <path d="M4 18h16"></path>
  </svg>
</button>
           <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-blue-800 rounded"
          >
            <Menu className="w-5 h-5" />
          </button> 
          <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium">
            Publish
            </button>
        </div>

        {/* Back */}
        <div className="p-1 border-b border-gray-200 bg-gray-200 font-medium">
          <button
            onClick={() => navigate("/courses")}
            className="text-blue-600 mb-1 hover:underline"
          >
            Back
          </button>
        </div>

        {/* Add Buttons */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New course</h2>
          <div className="flex gap-2">
            {/* Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-96">
                  {dropdownSections.map((section) => (
                    <div key={section.title} className="relative group">
                      <button
                        onClick={() => handleItemClick(section)}
                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 ${
                          section.type === "standard content" ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-md ${
                              section.type === "Standard content"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {section.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {section.title}
                            </div>
                            {section.description && (
                              <div className="text-sm text-gray-500">
                                {section.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {section.hasSubmenu && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {/* Submenu on hover */}
                      {section.hasSubmenu && (
                        <div className="absolute top-0 left-full ml-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
                          {section.items?.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSubitemClick(item)}
                              className="w-full px-4 py-2 text-left hover:bg-blue-100 flex items-center space-x-3 text-gray-700"
                            >
                              {item.icon} <span className="text-sm">{item.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="border border-gray-300 px-3 py-2 rounded hover:bg-blue-50"
              title="users"
            >
              <Users
                onClick={() => navigate(`/users`)}
                className="w-4 h-4"
  
  />
            </button>
            <button
            
              title="Files"
              className="border border-gray-300 px-3 py-2 rounded hover:bg-blue-50"
            >
              <Files className="w-4 h-4" />
            </button>
            <button
              title="options"
              onClick={() => setSettingsOpen(true)}
              className="border border-gray-300 px-3 py-2 rounded hover:bg-blue-50"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Units */}
        <div>
          {units.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setHover(true);
              }}
              onDragLeave={() => setHover(false)}
              onDrop={onDrop}
              className={`max-w-md mx-auto p-6 rounded-lg  ${
                hover ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
              } flex flex-col items-center text-center`}
            >         
                 <button
            onClick={() => fileRef.current && fileRef.current.click()}
            className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
          >
            <FolderEdit className="h-4 w-4" /> 
          </button>


              <button
                onClick={() => fileRef.current && fileRef.current.click()}
                className="text-blue-600 font-medium underline mb-2"
              >
                Add content to your course
              </button>

              <p className="text-sm text-gray-500 mb-4">
                Drag and drop files here, or click the Add button above, to build your course.
              </p>
              <input
                ref={fileRef}
                type="file"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <div className="w-full mt-2">
                {files.length > 0 && (
                  <div className="text-left text-sm">
                    
                    <ul className="mt-1 list-disc list-inside text-gray-600">
                      {files.map((f, i) => (
                        <li key={i}>
                          {f.name} — {(f.size / 1024).toFixed(1)} KB
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            units.map((unit) => {
              const IconComponent = getUnitIcon(unit.type);
              return (
                <div key={unit.id} className="relative mb-2">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUnit === unit.id
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedUnit(unit.id)}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-5 h-5 ${
                          selectedUnit === unit.id
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          selectedUnit === unit.id
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}
                      >
                        {unit.name}
                      </span>
                    </div>
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === unit.id ? null : unit.id
                        );
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {activeDropdown === unit.id && (
                    <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                      <div className="py-1">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3">
                          <Eye className="w-4 h-4" />
                          Unpublish unit
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3">
                          <Settings
                          onClick={() => setShowOptions(true)}
                          className="w-4 h-4" />
                          {unit.type === 'test'
                            ? 'Test options'
                            : unit.type === 'survey'
                            ? 'Survey options'
                            : unit.type === 'assignment'
                            ? 'Assignment options'
                            : unit.type === 'ilt'
                            ? 'ILT options'
                            : unit.type === 'web'
                            ? 'Web options'
                            : unit.type === 'frame'
                            ? 'Frame options'
                            : 'Unit options'}
                        </button>
                        <button
                        onClick={() => renameContentItem(parseInt(unit.id))}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                          <Edit3 className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                        onClick={() => cloneContentItem(parseInt(unit.id))}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                          <Copy className="w-4 h-4" />
                          Clone 
                        </button>
                        <button
                        onClick={() => printContentItem(parseInt(unit.id))}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                        <button
                          onClick={() => removeContentItem(parseInt(unit.id))}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Header */}
        <div className="relative h-64 bg-gradient-to-r from-blue-900 via-blue-800 to-orange-500 flex items-center justify-center">
          <h1
            className="text-4xl font-bold text-white"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setTitle(e.target.textContent || "New course")}
          >
            {title}
          </h1>
        </div>

        <div className="flex-1 bg-gray-50 p-6">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a course description up to 5000 characters"
            className="w-full h-24 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 mb-6"
            maxLength={5000}
          />

          <div className="bg-white rounded-lg border border-gray-200 min-h-96">
            {/* Tabs */}
            <div className="border-b border-gray-200 flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-6 py-3 font-medium text-sm border-b-2 ${
                    activeTab === "content"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-6 py-3 font-medium text-sm border-b-2 ${
                    activeTab === "files"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Files
                </button>
              </div>
              <div className="px-6 py-3 text-sm text-gray-600">
                All units must be completed
              </div>
              </div>
     
            
<div className="p-8"
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      console.log("Dropped files:", fileArray);
      alert(`${fileArray.length} file(s) uploaded successfully!`);
    }
  }}
>

  {activeTab === "content" && !selectedUnit && (
    <div
      className="text-center py-16 text-gray-600 rounded-xl hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => document.getElementById("fileInput")?.click()}
    >
      <input
        id="fileInput"
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            const fileArray = Array.from(files);
            console.log("Selected files:", fileArray);
            alert(`${fileArray.length} file(s) selected!`);
          }
        }}
      />

      <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-blue-600 mb-2">
        This course is empty
      </h3>
      <p>Drag and drop files here, or click to upload and build your course.</p>
    </div>
  )}


{activeTab === "content" && selectedUnit && (
  <div className="fixed inset-0 bg-white z-50 overflow-auto p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold">{currentUnit?.name}</h2>
      <button
        onClick={() => setSelectedUnit(null)} // or however you close it
        className="text-gray-600 hover:text-gray-900 text-xl"
      >
        ✕
      </button>
    </div>
    {renderUnitContent()}
  </div>
)}

  {activeTab === "files" && (
    <div
      className="text-center py-16 text-gray-600  rounded-xl hover:border-gray-500 transition-colors cursor-pointer"
      onClick={() => document.getElementById("fileInputFiles")?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          const fileArray = Array.from(files);
          console.log("Dropped files:", fileArray);
          alert(`${fileArray.length} file(s) uploaded!`);
        }
      }}
    >
      <input
        id="fileInputFiles"
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            const fileArray = Array.from(files);
            console.log("Selected files:", fileArray);
            alert(`${fileArray.length} file(s) selected!`);
          }
        }}
      />

      <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-blue-600 mb-2">
        No files uploaded
      </h3>
      <p>Drag and drop files here, or click to upload.</p>
    </div>
  )}
</div>
</div>



      {/* Settings Panel (mount + animate) */}
      {panelMounted && (
        <div className="fixed inset-0 right-0 z-50 flex">
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${panelVisible ? "opacity-50" : "opacity-0 pointer-events-none"}`}
            onClick={() => setSettingsOpen(false)}
          />

          {/* Sliding Panel */}
          <div
            className={`ml-auto h-full w-1/3 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${
              panelVisible ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Course Options</h2>
              <button onClick={() => setSettingsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
                
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex gap-1">
                {["info", "availability", "limits", "completion"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSection(tab)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 ${
                      activeSection === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-10 text-gray-600 space-y-4">
              {activeSection === "info" && (
                <div className="space-y-20">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Activate Course</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Activate course to publish it and allow learners to enroll.
                    </p>

                    <label className="flex items-center gap-3">
                      <div className="flex items-center gap-5 space-y-2">
                        <span className="text-sm font-medium text-gray-700">
                          {activateStatus ? "" : ""}
                        </span>

                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => setActivateStatus(!activateStatus)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            activateStatus ? "bg-green-500" : "bg-gray-300"
                          }`}
                          aria-pressed={activateStatus}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              activateStatus ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">Activate course</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Activate Coach</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Coach offers content summarization, question generation, and interactive support to help learners progress faster.
                    </p>

                    <label className="flex items-center gap-3">
                      <div className="flex items-center gap-5 space-y-2">
                        <span className="text-sm font-medium text-gray-700">
                          {activateCoach ? "" : ""}
                        </span>

                        <button
                          type="button"
                          onClick={() => setActivateCoach(!activateCoach)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            activateCoach ? "bg-green-500" : "bg-gray-300"
                          }`}
                          aria-pressed={activateCoach}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              activateCoach ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">Activate coach</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ListOrderedIcon className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Code</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Assign a unique identifier to sort courses in an alphabetical order.
                   </p>

                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 space--2"
                      placeholder="Insert Code"
                    />
                  </div>

                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-gray-700" />
                        <h3 className="font-medium text-gray-900">Intro Video Type</h3>
                      </div>

                      <div className="max-w-xl mx-auto p-4">
                        <div className="grid grid-cols-2 gap-4 ">
                          <button
                            onClick={() => setVideoType("youtube")}
                            className={`px-6 py-2 text-sm font-medium rounded-md border ${
                              videoType === "youtube"
                                ? "bg-blue-50 text-blue-700 border-blue-300"
                                : "bg-white text-gray-800 border-gray-300"
                            }`}
                          >
                            Youtube Video
                          </button>
                          <button
                            onClick={() => setVideoType("custom")}
                            className={`px-6 py-2 text-sm font-medium rounded-md border ${
                              videoType === "custom"
                                ? "bg-blue-50 text-blue-700 border-blue-300"
                                : "bg-white text-gray-800 border-gray-300"
                            }`}
                          >
                            Custom Video
                          </button>
                        </div>

                        {videoType === "custom" && (
                          <label className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition">
                            <Paperclip className="w-6 h-6 text-blue-500 mb-2" />
                            {file ? (
                              <span className="text-sm text-gray-700">{file.name}</span>
                            ) : (
                              <>
                                <span className="text-blue-600 font-medium">
                                  Select a file to upload
                                </span>
                                <span className="text-gray-500 text-sm">
                                  or <strong>drag and drop</strong> your file here.
                                </span>
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        Display a YouTube video preview video as part of the course description.
                      </p>

                      <h3 className="font-medium text-gray-900">URL</h3>
                      <input
                        type="text"
                        onChange={(e) => setVideoURL(e.target.value)}
                        value={videoURL}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Insert Url"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Content</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Assign a certificate to be issued upon course completion.
                    </p>

                    <label className="flex items-center gap-3">
                      <div className="flex items-center gap-5 space-y-2">
                        <span className="text-sm font-medium text-gray-700">
                          {contentLock ? "" : ""}
                        </span>

                        <button
                          type="button"
                          onClick={() => setContentLock(!contentLock)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            contentLock ? "bg-green-500" : "bg-gray-300"
                          }`}
                          aria-pressed={contentLock}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              contentLock ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">
                        Lock Content
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Availability Section */}
              {activeSection === "availability" && (
                <div className="space-y-20">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">
                        Course Visibility
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Set whether learners can see this course.
                    </p>

                    <label className="flex items-center gap-3">
                      <div className="flex items-center gap-5 space-y-2">
                        <span className="text-sm font-medium text-gray-700">
                          {courseVisibility ? "" : ""}
                        </span>

                        <button
                          type="button"
                          onClick={() => setCourseVisibility(!courseVisibility)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            courseVisibility ? "bg-green-500" : "bg-gray-300"
                          }`}
                          aria-pressed={courseVisibility}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              courseVisibility ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">Course Visibility</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Course Capacity</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Set a maximum number of learners allowed to self-enroll in the course. Once maximum enrollment is reached, the
                    </p>

                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 space--2"
                      placeholder="Set Maximum Number"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Public Sharing</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Make this course public and share it with non-registered users with a link. Users can complete the course anonymously and save their progress upon signing up.
                    </p>

                    <label className="flex items-center gap-3">
                      <div className="flex items-center gap-5 space-y-2">
                        <span className="text-sm font-medium text-gray-700">
                          {publicSharing ? "" : ""}
                        </span>

                        <button
                          type="button"
                          onClick={() => setPublicSharing(!publicSharing)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            publicSharing ? "bg-green-500" : "bg-gray-300"
                          }`}
                          aria-pressed={publicSharing}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              publicSharing ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">Enable Public Sharing</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hand className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Enrollment Request</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Learners must wait for Instructor's approval before gaining access to the course.
                    </p>

                    <label className="flex items-center gap-3">
                      <div className="flex items-center gap-5 space-y-2">
                        <span className="text-sm font-medium text-gray-700">
                          {enrollmentRequest ? "" : ""}
                        </span>

                        <button
                          type="button"
                          onClick={() => setEnrollmentRequest(!enrollmentRequest)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enrollmentRequest ? "bg-green-500" : "bg-gray-300"
                          }`}
                          aria-pressed={enrollmentRequest}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enrollmentRequest ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">Enable Enrollment Request</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Limits Section */}
              {activeSection === "limits" && (
                <div className="space-y-20">
                  <div>
                    <label className="block mb-1">Access Duration Type</label>
                    <select
                      value={timeType}
                      onChange={(e) => setTimeType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="time-limit">Time limit</option>
                      <option value="always">Always available</option>
                    </select>
                  </div>

                  {timeType === "time-limit" && (
                    <div>
                      <label className="block mb-1">Days of access</label>
                      <input
                        type="number"
                        value={timeDays}
                        onChange={(e) => setTimeDays(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="30"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Access Retention</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Set if users retain access to course materials after completing the course.
                    </p>

                    <label className="flex items-center gap-3">
                      <div className="flex items-center gap-5 space-y-2">
                        <span className="text-sm font-medium text-gray-700">{accessRetention ? "" : ""}</span>

                        <button
                          type="button"
                          onClick={() => setAccessRetention(!accessRetention)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            accessRetention ? "bg-green-500" : "bg-gray-300"
                          }`}
                          aria-pressed={accessRetention}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              accessRetention ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700">Activate Access Retention</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Completion Section */}
              {activeSection === "completion" && (
                <div className="space-y-20">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">Units Ordering</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Set the order in which course units must be completed.
                    </p>
                    <h3 className="font-medium text-gray-900">Show Units</h3>
                    <select
                      value={unitsOrdering}
                      onChange={(e) => setUnitsOrdering(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="sequential">In a Sequential Order</option>
                      <option value="any">In Any Order</option>
                    </select>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MonitorCheck className="w-5 h-5 text-gray-700" />
                        <h3 className="font-medium text-gray-900">Completion Rule</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Define the conditions required for the course to be marked as completed.
                      </p>
                      <h3 className="font-medium text-gray-900">Course is completed when</h3>
                      <select
                        value={completionRule}
                        onChange={(e) => setCompletionRule(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="all-units">All units must be completed</option>
                        <option value="percentage">Percentage of units completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-gray-700" />
                        <h3 className="font-medium text-gray-900">Score Calculation</h3>
                      </div>
                      <p className="text-sm text-gray-600">Choose how the average course score is calculated.</p>
                      <h2 className="font-medium text-gray-900">Calculate Score by</h2>
                      <select
                        value={scoreCalculations}
                        onChange={(e) => setScoreCalculations(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="all-tests">All Tests and Assignments</option>
                        <option value="tests">Tests</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-gray-700" />
                        <h3 className="font-medium text-gray-900">Certificate</h3>
                      </div>
                      <p className="text-sm text-gray-600">Assign a certificate to be issued upon course completion.</p>
                      <h2 className="font-medium text-gray-900">Type</h2>
                      <select
                        value={certificate}
                        onChange={(e) => setCertificate(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="Classic">Classic</option>
                        <option value="Fancy">Fancy</option>
                        <option value="Simple">Simple</option>
                        <option value="Modern">Modern</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors">
                Save
              </button>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}
