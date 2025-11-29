import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareTextIcon } from "lucide-react";

export const RealTimeMessageButton: React.FC = () => {
  const navigate = useNavigate();
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [pop, setPop] = useState(false);
  const [shake, setShake] = useState(false);
  const prevCount = useRef(0);

  // Simulate receiving new messages every 3–6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const messagesReceived = Math.floor(Math.random() * 2) + 1; // 1–2 new messages
      setNewMessagesCount((prev) => prev + messagesReceived);
    }, Math.random() * 3000 + 3000); // 3–6s random interval
    return () => clearInterval(interval);
  }, []);

  // Trigger pop + shake + ping when new messages arrive
  useEffect(() => {
    if (newMessagesCount > prevCount.current) {
      setPop(true);
      setShake(true);

      const timer = setTimeout(() => {
        setPop(false);
        setShake(false);
      }, 500); // match animation duration

      return () => clearTimeout(timer);
    }
    prevCount.current = newMessagesCount;
  }, [newMessagesCount]);

  return (
    <button
      onClick={() => setNewMessagesCount(0)} // Reset messages on click
      className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
    >
      {/* Message Icon */}
      <MessageSquareTextIcon
        className={`
          w-5 h-5 transition-transform duration-300
          hover:scale-110
          ${pop ? "animate-pop-icon" : ""}
          ${shake ? "animate-shake-icon" : ""}
        `}
      />

      {/* Notification Badge */}
      {newMessagesCount > 0 && (
        <span
          className={`
            absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full
            transition-transform duration-300
            ${pop ? "animate-ping-slow" : ""}
          `}
        />
      )}
    </button>
  );
};
