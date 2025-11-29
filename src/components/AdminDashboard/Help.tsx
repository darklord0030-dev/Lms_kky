import React, { useState } from "react";
import {
  Search,
  HelpCircle,
  Mail,
  MessageSquare,
  BookOpen,
  Award,
  Settings,
} from "lucide-react";

export const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer:
        "Go to the Courses page, select a course, and click the Enroll button.",
      category: "Courses",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Navigate to Account Settings > Security and click Reset Password.",
      category: "Account & Settings",
    },
    {
      question: "Where can I download my certificate?",
      answer:
        "After completing a course, go to Certificates and click Download.",
      category: "Certificates",
    },
    {
      question: "How are quizzes graded?",
      answer:
        "Quizzes are auto-graded instantly. Results are visible on the Assessments page.",
      category: "Assessments",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex justify-center items-center gap-2">
          <HelpCircle className="w-8 h-8 text-blue-500" />
          Help & Support
        </h1>
        <p className="text-gray-600">
          Find answers, FAQs, and support for using the LMS
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center border rounded-2xl shadow-sm p-3 mb-8 bg-white">
        <Search className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search help articles..."
          className="flex-1 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>


      {/* FAQ Section */}
      <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="font-medium text-lg">{faq.question}</p>
              <p className="text-gray-600 mt-1">{faq.answer}</p>
              <span className="text-xs text-blue-500">{faq.category}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            No results found. Try a different search.
          </p>
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-10 p-6 border rounded-xl shadow-md bg-white text-center">
        <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
        <p className="text-gray-600 mb-4">
          Contact our support team for further assistance.
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="mailto:support@yourlms.com"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            <Mail className="w-5 h-5" />
            Email Support
          </a>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 transition">
            <MessageSquare className="w-5 h-5" />
            Live Chat
          </button>
        </div>
      </div>
    </div>
  );
};
