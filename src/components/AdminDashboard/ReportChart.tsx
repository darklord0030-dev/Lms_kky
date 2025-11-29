
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

const userData = [
  { label: 'Active Users', value: 847, percentage: 68, color: '#3B82F6' },
  { label: 'Inactive Users', value: 203, percentage: 16, color: '#EF4444' },
  { label: 'New Users', value: 156, percentage: 12, color: '#10B981' },
  { label: 'Pending Users', value: 49, percentage: 4, color: '#F59E0B' }
];

const totalUsers = userData.reduce((sum, item) => sum + item.value, 0);

export default function ReportChart() {
  // Calculate cumulative percentages for SVG path
  let cumulativePercentage = 0;
  const dataWithAngles = userData.map(item => {
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees
    cumulativePercentage += item.percentage;
    const endAngle = cumulativePercentage * 3.6;
    return {
      ...item,
      startAngle,
      endAngle
    };
  });

  // Function to create SVG path for pie slice
  const createPath = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", 100, 100,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getIcon = (label: string) => {
    switch (label) {
      case 'Active Users': return UserCheck;
      case 'Inactive Users': return UserX;
      case 'New Users': return Users;
      case 'Pending Users': return Clock;
      default: return Users;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
        <div className="text-sm text-gray-500">
          Total: {totalUsers.toLocaleString()} users
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        {/* Pie Chart SVG */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {dataWithAngles.map((item, index) => (
              <path
                key={index}
                d={createPath(item.startAngle, item.endAngle)}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {userData.map((item, index) => {
          const Icon = getIcon(item.label);
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{item.percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">84%</p>
            <p className="text-xs text-gray-600">Engagement Rate</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">+12%</p>
            <p className="text-xs text-gray-600">Growth This Month</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
          View Detailed User Report
        </button>
      </div>
    </div>
  );
}