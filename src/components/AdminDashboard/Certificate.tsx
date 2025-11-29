import React, { useState, useEffect } from "react";
import { Bell, Plus, Trash } from "lucide-react";

interface Certificate {
  id: number;
  user: string;
  course: string;
  issuedOn: string; // ISO date
  expiryDate: string; // ISO date
}

export const Certificate: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: 1,
      user: "Alice Johnson",
      course: "React Basics",
      issuedOn: "2025-01-01",
      expiryDate: "2026-01-01",
    },
    {
      id: 2,
      user: "Bob Smith",
      course: "Data Science 101",
      issuedOn: "2025-02-15",
      expiryDate: "2025-09-01",
    },
  ]);

  const [reminders, setReminders] = useState<string[]>([]);

  // Highlight certificates expiring within 30 days
  const isExpiringSoon = (expiry: string) => {
    const today = new Date();
    const expiryDate = new Date(expiry);
    const diffDays = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && diffDays >= 0;
  };

  // Update reminders whenever certificates change
  useEffect(() => {
    const expiringCerts = certificates
      .filter((cert) => isExpiringSoon(cert.expiryDate))
      .map((cert) => `${cert.user} - ${cert.course} certificate expiring soon`);
    setReminders(expiringCerts);
  }, [certificates]);

  const addCertificate = () => {
    const newCert: Certificate = {
      id: certificates.length + 1,
      user: "New User",
      course: "New Course",
      issuedOn: new Date().toISOString().split("T")[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
    };
    setCertificates([...certificates, newCert]);
  };

  const deleteCertificate = (id: number) => {
    setCertificates(certificates.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-20" >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl space-x-10 font-bold text-gray-900">Certificates</h1>
        <button
          onClick={addCertificate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certificate</span>
        </button>
      </div>

      {/* Renewal Reminders */}
      {reminders.length > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg flex flex-col space-y-2">
          <h3 className="font-medium">Renewal Reminders</h3>
          {reminders.map((msg, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issued On
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {certificates.map((cert) => (
              <tr key={cert.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cert.user}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cert.course}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cert.issuedOn}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cert.expiryDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isExpiringSoon(cert.expiryDate) ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Bell className="w-3 h-3 mr-1" /> Expiring Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Valid
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteCertificate(cert.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
