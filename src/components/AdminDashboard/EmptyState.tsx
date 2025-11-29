import React from "react";
import { useNavigate } from "react-router-dom";

// 🖼️ Illustrations
import noresultIllustration from "../assets/noresult.png";
import emptyCoursesIllustration from "../assets/addcourse.png";
import emptyGroupsIllustration from "../assets/add-group.png";
import emptyFilesIllustration from "../assets/files.png";

// 🧩 Types
interface EmptyStateProps {
  type: "courses" | "groups" | "files";
  searchTerm?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchTerm = "" }) => {
  const navigate = useNavigate();

  // --- Select illustration + message dynamically ---
  let illustration = noresultIllustration;
  let message = "";
  let buttonLabel = "";
  let buttonPath = "";

  switch (type) {
    case "courses":
      illustration = searchTerm ? noresultIllustration : emptyCoursesIllustration;
      message = searchTerm
        ? "No courses found."
        : "No courses available. Enroll to a course!";
      buttonLabel = "Enroll Now";
      buttonPath = "/courses";
      break;

    case "groups":
      illustration = searchTerm ? noresultIllustration : emptyGroupsIllustration;
      message = searchTerm
        ? "No groups found."
        : "No groups available. Create one to get started!";
      buttonLabel = "Create Group";
      buttonPath = "/groups";
      break;

    case "files":
      illustration = searchTerm ? noresultIllustration : emptyFilesIllustration;
      message = searchTerm
        ? "No files found."
        : "No files uploaded yet. Upload one to get started!";
      buttonLabel = "Upload File";
      buttonPath = "/files";
      break;

    default:
      message = "No data available.";
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <img src={illustration} alt={`${type} illustration`} className="w-80 mb-4" />
      <p className="text-gray-500 text-center mb-4">{message}</p>

      {!searchTerm && buttonLabel && (
        <button
          onClick={() => navigate(buttonPath)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
