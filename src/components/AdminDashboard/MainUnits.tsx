import React from 'react';
import { Users, FileText, Settings } from 'lucide-react';
import TestUnitContent from './TestUnitContent';
import SurveyUnitContent from './SurveyUnitContent';
import AssignmentUnitContent from './AssignmentUnit';
import IltUnitContent from './IltUnitContent';
import ContentUnitContent from './CourseStructure';
import VideoUnitContent from './VideoUnitContent';
import ScormUnitContent from './ScormUnitContent';

interface Unit {
  id: string;
  name: string;
  type: 'test' | 'survey' | 'assignment' | 'ilt' | 'content' | 'video' | 'scorm';
}

interface MainContentProps {
  selectedUnit: string;
  units: Unit[];
  
}

export default function MainUnits({ 
  selectedUnit, 
  units, 
  
}: MainContentProps) {
  const currentUnit = units.find(unit => unit.id === selectedUnit);

  if (!currentUnit) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a unit to get started
      </div>
    );
  }

  const renderContent = () => {
    switch (currentUnit.type) {
      case 'test':
        return <TestUnitContent />;
      case 'survey':
        return <SurveyUnitContent />;
      case 'assignment':
        return <AssignmentUnitContent/>;
      case 'ilt':
        return <IltUnitContent  />;
      case 'content':
        return <ContentUnitContent />;
      case 'video':
        return <VideoUnitContent />;
      case 'scorm':
        return <ScormUnitContent />;
      default:
        return <div>Unknown unit type</div>;
    }
  };

  return (
    <div className="flex-1 relative">
      <div className="p-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {currentUnit.name}
              </h1>
              {currentUnit.type !== 'assignment' && (
                <p className="text-gray-500 text-sm mt-1">
                  {currentUnit.type === 'test' ? 'Add questions from the list below to create your test.' :
                   currentUnit.type === 'survey' ? 'Add questions from the list below to create your survey.' :
                   currentUnit.type === 'ilt' ? 'Add sessions from the list below to create your ILT unit.' :
                   currentUnit.type === 'content' ? 'Add content' :
                   currentUnit.type === 'video' ? 'Add content' :
                   currentUnit.type === 'scorm' ? 'Upload a SCORM, xAPI, or cmi5 file' :
                   'Add content'}
                </p>
              )}
              {currentUnit.type === 'assignment' && (
                <p className="text-gray-500 text-sm mt-1">Add content</p>
              )}
            </div>
          </div>
        </div>
        
        {renderContent()}
      </div>

     
    </div>
  );
}