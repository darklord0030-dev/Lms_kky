import React from 'react';
import { 
  BookOpen, 
  User, 
  Award, 
  MessageSquare,
  Clock
} from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'completion',
      user: 'Sarah Wilson',
      action: 'completed',
      target: 'React Development Fundamentals',
      time: '2 minutes ago',
      icon: Award,
      color: 'text-green-600 bg-green-50'
    },  
    {
      id: 2,
      type: 'enrollment',
      user: 'Mike Johnson',
      action: 'enrolled in',
      target: 'Digital Marketing Strategy',
      time: '15 minutes ago',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 3,
      type: 'comment',
      user: 'Emily Chen',
      action: 'commented on',
      target: 'Data Science with Python',
      time: '1 hour ago',
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 4,
      type: 'registration',
      user: 'David Rodriguez',
      action: 'joined the platform',
      target: '',
      time: '3 hours ago',
      icon: User,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      id: 5,
      type: 'completion',
      user: 'Lisa Thompson',
      action: 'completed',
      target: 'UI/UX Design Principles',
      time: '5 hours ago',
      icon: Award,
      color: 'text-green-600 bg-green-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-1 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}{' '}
                  {activity.target && (
                    <span className="font-medium text-blue-600">{activity.target}</span>
                  )}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};