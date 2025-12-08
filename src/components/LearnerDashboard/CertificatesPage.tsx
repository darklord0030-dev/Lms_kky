import { useEffect, useState } from 'react';
import { Award, Download, Share2 } from 'lucide-react';

export type Course = {
  id: string;
  title: string;
};

export type Certificate = {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  issue_date: string;
  certificate_url: string;
  created_at: string;
};

type CertificateWithCourse = Certificate & {
  course: Course;
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = "USER_ID_HERE"; // ← Replace with auth user

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/certificates/${userId}`);
      const data = await res.json();
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateId: string, title: string) => {
    alert(`Downloading certificate: ${title}`);
  };

  const handleShare = (certificateId: string, title: string) => {
    alert(`Sharing certificate: ${title}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Certificates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white text-center">
              <Award size={48} className="mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Certificate of Completion
              </h3>
              <p className="text-sm opacity-90">
                {certificate.course?.title || "Course"}
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Issued on</div>
                <div className="font-medium">
                  {new Date(certificate.issue_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(certificate.id, certificate.title)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>

                <button
                  onClick={() => handleShare(certificate.id, certificate.title)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {certificates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Award size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-500">
              Complete courses to earn certificates of completion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
  