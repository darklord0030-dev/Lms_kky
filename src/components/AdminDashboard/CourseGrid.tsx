import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import emptyIllustration from "../assets/course.png";

interface Course {
  id: number;
  title: string;
  code?: string;
  category?: string;
  price?: string;
  lastUpdated?: string;
}

export const CourseGrid: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [courses, setCourses] = useState<Course[]>([]); // Empty initially
 

 
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
<div className="min-h-screen bg-white px-5 py-10">
  <div className="max-w-7xl mx-auto">
    <h1 className="text-3xl font-semibold text-gray-900">Courses</h1>
    {filteredCourses.length > 0 ? (
      <>
        {/* Header (only shown when courses exist) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Search + Filter + Add Course */}
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <button className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex">
              <button
                onClick={() => navigate('/coursebuilder')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-l-lg font-medium transition-colors"
              >
                Add course
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-lg border-l border-blue-500 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-700">
              <div className="col-span-1 flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </div>
              <div className="col-span-4 flex items-center gap-2">
                <span>Course</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="col-span-1">Code</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-2">Last updated on</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {filteredCourses.map((course) => (
            <div key={course.id} className="grid grid-cols-12 gap-4 px-6 py-3 text-sm text-gray-700 border-b border-gray-100 items-center">
              <div className="col-span-1">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </div>
              <div className="col-span-4">{course.title}</div>
              <div className="col-span-1">{course.code}</div>
              <div className="col-span-2">{course.category}</div>
              <div className="col-span-1">{course.price}</div>
              <div className="col-span-2">{course.lastUpdated}</div>
              <div className="col-span-1"></div>
            </div>
          ))}
        </div>
      </>
    ) : (
      // Empty State (no header, no search/filter)
      <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto mt-10">
        <img
          src={emptyIllustration}
          alt="No courses"
          className="w-80 mb-4"
        />
        <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
          There are no courses yet!
        </h2>
        <p className="text-gray-500 mb-8 text-lg text-center">
          Time to craft a new course.
        </p>
        <button
          onClick={() => navigate('/coursebuilder')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add course
        </button>
      </div>
    )}
  </div>
</div>
  );
};
