import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function UnitOptionsPanel({ show, onClose, unit }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slide-over panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 p-6 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)} Options
              </h2>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Panel content */}
            <div>
              {/* Replace this with actual unit option settings */}
              <p className="text-gray-600">Configure options for this unit here.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
