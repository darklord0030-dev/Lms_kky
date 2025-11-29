import React from 'react';
import { Play, Upload, Video, Monitor } from 'lucide-react';

const videoOptions = [
  { 
    id: 'youtube', 
    name: 'Use a YouTube video', 
    icon: Play, 
    description: 'Embed a YouTube video' 
  },
  { 
    id: 'upload', 
    name: 'Upload a file', 
    subtitle: 'or Drag-n-Drop here',
    icon: Upload, 
    description: 'Upload your own video file' 
  },
  { 
    id: 'record', 
    name: 'Record a video', 
    icon: Video, 
    description: 'Record using your camera' 
  },
  { 
    id: 'screen', 
    name: 'Record your screen', 
    icon: Monitor, 
    description: 'Create a screen recording' 
  },
];

export default function VideoUnitContent() {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {videoOptions.map((option) => (
          <button
            key={option.id}
            className="p-8 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                <option.icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                  {option.name}
                </h3>
                {option.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{option.subtitle}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <div className="min-h-32 bg-white border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">Add content</p>
          </div>
        </div>
      </div>
    </div>
  );
}