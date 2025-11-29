import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  List,
  Grid2x2 as Grid,
  ChevronDown,
  Eye,
  BookOpen,
  UserMinus,
  X,
  UserPlus,
  Trash2,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import emptyIllustration from '../assets/add-group.png';
import emptyCoursesIllustration from '../assets/addcourse.png';
import emptyFilesIllustration from '../assets/files.png';
import { FaArrowDownUpAcrossLine } from 'react-icons/fa6';

type Tab = 'Users' | 'Courses' | 'Files' | 'Info';

interface Course {
  id: string;
  name: string;
  code: string;
  category: string;
  price: string;
}

interface FileItem {
  id: string;
  name: string;
  tags: string;
  type: string;
  size: string;
  uploadDate: string;
  shared: boolean;
}

interface User {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  isOwner: boolean;
  userType: string;
  lastLogin: string;
  groupCoursesAdded: string;
}

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface GroupInfo {
  id: number;
  name?: string;
  Name?: string;
  description?: string;
}

const SlideOutPanel = ({ isOpen, onClose, title, children }: SlideOutPanelProps) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShow(true);
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={`flex-1 bg-black bg-opacity-50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`w-full max-w-md bg-white shadow-xl h-full flex flex-col transform transition-transform duration-300 ${show ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default function GroupsMainPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Users');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [userSortAsc, setUserSortAsc] = useState(true);

  const [showAddUserPanel, setShowAddUserPanel] = useState(false);
  const [showAddCoursePanel, setShowAddCoursePanel] = useState(false);
  const [showUploadFilesPanel, setShowUploadFilesPanel] = useState(false);

  const [groupName, setGroupName] = useState('Group 1');
  const [groupDescription, setGroupDescription] = useState('');
  // fixed the broken state destructuring and init from groupName
  const [editGroupName, setEditGroupName] = useState(groupName);
  const [editDescription, setEditDescription] = useState(groupDescription);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [panelSearch, setPanelSearch] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const navigate = useNavigate();

  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>({ id: 1, name: 'Group 1' });
  const selectedGroupId = selectedGroup?.id;

  useEffect(() => {
    if (!selectedGroupId) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/usergroup/all');
        const usersArray = res.data || [];
        const usersData: User[] = usersArray.map((u: any) => {
          const userObj = u.user || u;
          const first = (userObj.firstname || '').trim();
          const last = (userObj.lastname || '').trim();
          const displayName = [first, last].filter(Boolean).join(' ') || userObj.username || `User-${userObj.id}`;

          return {
            id: String(userObj.id),
            firstname: first,
            lastname: last,
            name: displayName,
            userType: userObj.usertype || userObj.userType || 'User',
            isOwner: Boolean(u.isOwner || userObj.isOwner),
            lastLogin: userObj.lastLogin ? new Date(userObj.lastLogin).toLocaleString() : '-',
            groupCoursesAdded: u.groupCoursesAdded?.toString() || '0',
          };
        });

        setAllUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [selectedGroupId]);

  const filteredAvailableUsers = allUsers
    .filter((u) => !users.some((gu) => gu.id === u.id))
    .filter((u) => {
      const q = panelSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.firstname.toLowerCase().includes(q) || u.lastname.toLowerCase().includes(q);
    });

  const filteredAvailableCourses = courses.filter((c) => c.name.toLowerCase().includes(panelSearch.toLowerCase()));

  const handleAddUser = (userId: string) => {
    const userToAdd = allUsers.find((u) => u.id === userId);
    if (!userToAdd) return;
    setUsers((prev) => [...prev, userToAdd]);
    setShowAddUserPanel(false);
    setPanelSearch('');
  };

  const handleRemoveUser = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const handleAddCourse = (courseId: string) => {
    const existingCourse = courses.find((c) => c.id === courseId);
    if (!existingCourse) return;
    setCourses((prev) => [...prev, existingCourse]);
    setShowAddCoursePanel(false);
    setPanelSearch('');
  };

  const handleRemoveCourse = (id: string) => setCourses((prev) => prev.filter((c) => c.id !== id));
  const handleToggleFileShared = (id: string) => setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, shared: !f.shared } : f)));
  const handleRemoveFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSaveInfo = () => {
    setGroupName(editGroupName);
    setGroupDescription(editDescription);
    setActiveTab('Users');
  };
  const handleCancelInfo = () => {
    setEditGroupName(groupName);
    setEditDescription(groupDescription);
  };

  // allow optional filter param
  const handleFilterSelect = (filter?: string) => {
    // you can use the 'filter' string if needed to apply filtering logic
    setFilterOpen(false);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const mapped = newFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      tags: '',
      type: f.type,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toLocaleDateString(),
      shared: false,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const confirmDeleteFile = (id: string) => {
    setFileToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete !== null) {
      handleRemoveFile(fileToDelete);
      setFileToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setFileToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const mapped = droppedFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      tags: '',
      type: f.type,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toLocaleDateString(),
      shared: false,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error('Please select files before uploading.');
      return;
    }
    toast.success('Files uploaded successfully!');
    // close panel shortly after success
    setTimeout(() => {
      setShowUploadFilesPanel(false);
    }, 500);
  };

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return;
        const parsed = JSON.parse(storedToken);
        const groupIdFromToken = parsed?.data?.groupId || parsed?.groupId;
        if (!groupIdFromToken) return;
        const response = await axios.get(`http://localhost:3000/api/group/${groupIdFromToken}`);
        const groupData = response.data || {};
        const normalizedGroup: GroupInfo = {
          id: Number(groupIdFromToken),
          name: groupData.name || groupData.Name || '',
          description: groupData.description || '',
        };
        setGroup(normalizedGroup);
        // also sync the group name/description states used in the UI
        setGroupName(normalizedGroup.name || '');
        setEditGroupName(normalizedGroup.name || '');
        setGroupDescription(normalizedGroup.description || '');
        setEditDescription(normalizedGroup.description || '');
      } catch (error) {
        console.error('Error loading Group:', error);
        toast.error('Failed to load Group info');
      }
    };
    loadGroup();
    // empty deps => run once on mount
  }, []);

  const groupname = group?.name?.trim() || 'Guest Group';

  return (
    <>
      <div className="max-h-screen bg-white">
        <div className="max-w-screen mx-auto px-8 py-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <button className="text-blue-500" onClick={() => navigate('/dashboard')}>
                Groups
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{groupname}</h2>
            </div>
            <button onClick={() => setActiveTab('Info')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium">
              Edit group
            </button>
          </div>

          <div className="border-b border-gray-200 mb-5">
            <div className="flex gap-8">
              {(['Users', 'Courses', 'Files', 'Info'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 font-medium text-sm relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {users.length > 0 && (
                    <>
                      <div className="relative flex-1 min-w-[300px]">
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-4 pr-10 py-2 bg-gray-200 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium">
                        Mass actions
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <div className="relative inline-block text-left" ref={filterRef}>
                        <button onClick={() => setFilterOpen((prev) => !prev)} className="rounded-md px-3 py-3 flex items-center text-gray-600 hover:bg-blue-200">
                          <Filter className="w-5 h-5 text-gray-600" />
                        </button>
                        {filterOpen && (
                          <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <li>
                              <button onClick={() => handleFilterSelect('Active')} className="flex w-full items-center px-3 py-2 text-sm hover:bg-blue-50">
                                👤 Active
                              </button>
                            </li>
                            <li>
                              <button onClick={() => handleFilterSelect('Inactive')} className="flex w-full items-center px-3 py-2 text-sm hover:bg-blue-50">
                                👤 Inactive
                              </button>
                            </li>
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {activeTab === 'Users' && (
                  <button onClick={() => setShowAddUserPanel(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    <Plus className="w-5 h-5" />
                    Add users
                  </button>
                )}

                {activeTab === 'Courses' && (
                  <button onClick={() => setShowAddCoursePanel(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    <Plus className="w-5 h-5" />
                    Add courses
                  </button>
                )}

                {activeTab === 'Files' && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowUploadFilesPanel(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                      <Upload className="w-5 h-5" />
                      Upload files
                    </button>
                    <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
                      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white' : 'hover:bg-blue-100'}`}>
                        <List className="w-5 h-5 text-black" />
                      </button>
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white' : 'hover:bg-blue-100'}`}>
                        <Grid className="w-5 h-5 text-black" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {activeTab === 'Courses' && (courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-5">
                <img src={emptyCoursesIllustration} alt="No courses" className="w-80 mb-4" />
                <h2 className="text-xl font-medium">There are no courses yet!</h2>
                <p className="text-gray-500">Time to add some courses.</p>
                <button onClick={() => setShowAddCoursePanel(true)} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">
                  Add courses
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 px-6 py-3 bg-white border-b border-gray-50 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1">Course <ChevronDown className="w-4 h-4" /></div>
                  <div>Code</div>
                  <div>Category</div>
                  <div>Price</div>
                  <div className="w-10" />
                </div>
                {courses.map((course) => (
                  <div key={course.id} className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 px-6 py-2 hover:bg-blue-100 text-sm">
                    <div className="text-gray-900">{course.name}</div>
                    <div className="text-gray-700">{course.code}</div>
                    <div className="text-gray-700">{course.category}</div>
                    <div className="text-gray-700">{course.price}</div>
                    <div className="flex items-center gap-2">
                      <div className="relative group/icon inline-flex">
                        <button className="p-1 hover:bg-blue-200 rounded"><Eye className="w-5 h-5 text-black" /></button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 pointer-events-none transition-opacity">View</span>
                      </div>
                      <div className="relative group/icon inline-flex">
                        <button onClick={() => handleRemoveCourse(course.id)} className="p-1 hover:bg-blue-200 rounded"><Trash2 className="w-5 h-5 text-black" /></button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 pointer-events-none transition-opacity">Delete</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ))}

            {activeTab === 'Files' && (files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-5">
                <img src={emptyFilesIllustration} alt="No files" className="w-80 mb-4" />
                <h2 className="text-xl font-medium">There are no files yet!</h2>
                <p className="text-gray-500">Add some files.</p>
                <button onClick={() => setShowUploadFilesPanel(true)} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">
                  Upload files
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1.2fr,1fr,auto] gap-10 px-6 py-3 bg-white border-b border-gray-200 text-sm font-medium text-gray-700">
                  <div>File</div>
                  <div>Tags</div>
                  <div>Type</div>
                  <div>Size</div>
                  <div className="flex items-center gap-1">Upload date <ChevronDown className="w-4 h-4" /></div>
                  <div>Shared</div>
                  <div className="w-10" />
                </div>
                {files.map((file) => (
                  <div key={file.id} className="grid grid-cols-[2fr,1fr,1fr,1fr,1.2fr,1fr,auto] px-7 py-2 border-b border-gray-100 hover:bg-blue-100 text-sm">
                    <div className="text-gray-900">{file.name}</div>
                    <div className="text-gray-700">{file.tags}</div>
                    <div className="text-gray-700">{file.type}</div>
                    <div className="text-gray-700">{file.size}</div>
                    <div className="text-gray-700">{file.uploadDate}</div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={file.shared} onChange={() => handleToggleFileShared(file.id)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded"><Eye className="w-5 h-5 text-gray-600" /></button>
                      <button onClick={() => confirmDeleteFile(file.id)} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="w-5 h-5 text-gray-600" /></button>
                    </div>
                  </div>
                ))}
              </>
            ))}

            <div className="bg-white">
              {activeTab === 'Users' && (users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-5">
                  <img src={emptyIllustration} alt="No users" className="w-80 mb-4" />
                  <h2 className="text-xl font-medium">Looks like there are no users yet!</h2>
                  <p className="text-gray-500 text-lg">No users have been added yet.</p>
                  <button onClick={() => setShowAddUserPanel(true)} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">Add users</button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-[2fr,1.5fr,1.5fr,1.5fr,auto] gap-4 px-6 py-3 bg-white border-b border-gray-200 text-sm font-medium text-gray-700">
                    <div>User</div>
                    <div>User type</div>
                    <div>Last login</div>
                    <div>Group courses added</div>
                    <div className="w-32" />
                  </div>
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-[2fr,1.5fr,1.5fr,1.5fr,auto] gap-4 px-6 py-2 hover:bg-blue-50 text-sm items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900">{user.name}</span>
                        {user.isOwner && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Owner</span>}
                      </div>
                      <div className="text-gray-700">{user.userType}</div>
                      <div className="text-gray-700">{user.lastLogin}</div>
                      <div className="text-gray-700">{user.groupCoursesAdded}</div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-blue-200 rounded" title="View User Details" onClick={(e) => { e.stopPropagation(); navigate(`/userdetails/user/${user.id}`); }}>
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-1.5 hover:bg-blue-200 rounded" title="Courses">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </button>
                        <button onClick={() => handleRemoveUser(user.id)} className="p-1.5 hover:bg-blue-200 rounded" title="Remove">
                          <UserMinus className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {activeTab === 'Info' && (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                    <input type="text" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter group description..." />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={handleCancelInfo} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSaveInfo} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* SlideOutPanel for Adding Users */}
        <SlideOutPanel isOpen={showAddUserPanel} onClose={() => setShowAddUserPanel(false)} title="Add Users">
          <div className="relative mb-4">
            <Search className="absolute top-2.5 left-2.5 w-5 h-5 text-gray-400" />
            <input value={panelSearch} onChange={(e) => setPanelSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400" />
          </div>
          {filteredAvailableUsers.length === 0 ? (
            <div className="text-gray-500 text-center mt-6">No users found</div>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAvailableUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded">
                  <span>{u.name}</span>
                  <button onClick={() => handleAddUser(u.id)} className="text-blue-600 hover:underline flex items-center gap-1">
                    <UserPlus size={16} /> Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SlideOutPanel>

        {/* Add Course Panel */}
        <SlideOutPanel isOpen={showAddCoursePanel} onClose={() => setShowAddCoursePanel(false)} title="Add Course">
          <div className="relative mb-4">
            <Search className="absolute top-2.5 left-2.5 w-5 h-5 text-gray-400" />
            <input value={panelSearch} onChange={(e) => setPanelSearch(e.target.value)} placeholder="Search courses..." className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400" />
          </div>
          {filteredAvailableCourses.length === 0 ? (
            <div className="text-gray-500 text-center mt-6">No courses found</div>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAvailableCourses.map((course) => (
                <li key={course.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded">
                  <div>
                    <span className="font-medium">{course.name}</span>
                    {course.category && <span className="ml-2 text-sm text-gray-500">({course.category})</span>}
                  </div>
                  <button onClick={() => handleAddCourse(course.id)} className="text-blue-600 hover:underline flex items-center gap-1">
                    <BookOpen size={16} /> Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SlideOutPanel>

        {/* Upload Files Panel */}
        <SlideOutPanel isOpen={showUploadFilesPanel} onClose={() => setShowUploadFilesPanel(false)} title="Upload Files">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition" onDrop={handleDrop} onDragOver={handleDragOver}>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag &amp; drop your files here or{' '}
                <label className="text-blue-600 hover:underline cursor-pointer">
                  browse
                  <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                </label>
              </p>
            </div>
            <p className="text-xs text-gray-500">Supported formats: PDF, DOCX, PPTX, Images (Max size: 10MB each)</p>
            <div className="flex justify-end">
              <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload</button>
            </div>
          </div>
        </SlideOutPanel>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center relative">
            <button onClick={handleCancelDelete} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-3">Delete File</h2>
            <p className="text-gray-600 mb-5">Are you sure you want to delete this file?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleCancelDelete} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
