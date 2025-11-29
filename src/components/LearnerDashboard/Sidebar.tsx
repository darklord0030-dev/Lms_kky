import { Home, BookOpen, Calendar, Award, BarChart2, HelpCircle } from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'catalog', label: 'Course catalog', icon: <BookOpen size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} />, badge: 1 },
    { id: 'skills', label: 'Skills', icon: <BarChart2 size={20} /> },
    { id: 'tests', label: 'Tests', icon: <BookOpen size={20} /> },
    { id: 'assignments', label: 'Assignments', icon: <Calendar size={20} /> },
    { id: 'certificates', label: 'Certificates', icon: <Award size={20} /> },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b border-blue-800">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">
          t
        </div>
        <span className="text-xl font-semibold">talentlms</span>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full px-6 py-3 flex items-center gap-3 transition-colors ${
              activeTab === item.id
                ? 'bg-blue-800 border-l-4 border-white'
                : 'hover:bg-blue-800'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-800 rounded transition-colors">
          <HelpCircle size={20} />
          <span>Help Center</span>
        </button>
      </div>
    </aside>
  );
}
