import { 
  Plus, 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  Upload,
  Settings,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Action = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  textColor: string;
  onClick: () => void;
};

export default function QuickActions() {
  const navigate = useNavigate();

  const quickActions: Action[] = [
    {
      id: 'create-course',
      label: 'Create Course',
      description: 'Add a new course',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600',
      onClick: () => navigate(`/coursebuilder`),
    },
    {
      id: 'add-user',
      label: 'Add User',
      description: 'Invite new learner',
      icon: UserPlus,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600',
      onClick: () => navigate(`/adduser`),
    },
    {
      id: 'create-report',
      label: 'Generate Report',
      description: 'Create analytics report',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600',
      onClick: () => navigate(`/reports/custom`),
    },
    {
      id: 'schedule-event',
      label: 'Schedule Event',
      description: 'Add calendar event',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-600',
      onClick: () => navigate(`/calendar`),
    },
    {
      id: 'send-message',
      label: 'Send Message',
      description: 'Broadcast to users',
      icon: MessageSquare,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      textColor: 'text-indigo-600',
      onClick: () => navigate("/messages?modal=AddEvent"),
    },
    {
      id: 'groups',
      label: 'Add groups',
      description: 'Create Groups',
      icon: Upload,
      color: 'bg-teal-500 hover:bg-teal-600',
      textColor: 'text-teal-600',
      onClick: () => navigate("/addgroupform"),
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
    
      </div>
      
      <div className="grid grid-cols-2 gap-4 ">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group flex items-center space-x-3 p-4 rounded-lg  hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} transition-colors`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
