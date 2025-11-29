import React from 'react';
import { Upload } from 'lucide-react';

export default function ScormUnitContent() {
  return (
    <div className="mt-6">
      <div className="bg-blue-600 rounded-lg p-16 flex flex-col items-center justify-center text-white min-h-96">
        <div className="mb-6">
          <Upload className="w-16 h-16 text-white" />
        </div>
        <h3 className="text-xl font-medium mb-2">Upload a SCORM, xAPI, or cmi5 file</h3>
        <p className="text-blue-100">or Drag-n-Drop here</p>
      </div>
    </div>
  );
}