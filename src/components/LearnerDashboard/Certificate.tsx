import { Award, CalendarDays, Download, Signature } from "lucide-react";
import html2canvas from "html2canvas";
import { useRef } from "react";

function Certificate({
  name = "Student Name",
  course = "Full Stack Web Development",
  issueDate = "1 December 2025",
  instructor = "Instructor Name",
}) {
  const certificateRef = useRef(null);

  const downloadCertificate = async () => {
    const canvas = await html2canvas(certificateRef.current, {
      scale: 3,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `${name}-certificate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-10">
      {/* Download Button */}
      <button
        onClick={downloadCertificate}
        className="mb-6 flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-lg shadow hover:bg-slate-700 transition"
      >
        <Download size={18} />
        Download Certificate
      </button>

      {/* Certificate */}
      <div
        ref={certificateRef}
        className="relative w-full max-w-3xl aspect-[1.414/1] bg-white shadow-2xl overflow-hidden border-[6px] border-slate-700 rounded-xl hover:shadow-3xl transition"
      >
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-br-full -translate-x-24 -translate-y-24"></div>
        {/* <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-bl from-slate-700 to-slate-800 transform skew-x-[-15deg] translate-x-20 opacity-90"></div> */}
      {/* /  <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-bl from-slate-700 to-slate-800 transform skew-x-[-15deg] translate-x-20 opacity-90"></div> */}
        {/* <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-bl from-slate-700 to-slate-800 transform skew-x-[-15deg] translate-x-20 opacity-90"></div> */}
        <div className="absolute top-10 right-0 w-full h-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60 transform -rotate-12"></div>
        <div className="absolute top-10 right-0 w-full h-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60 transform -rotate-12"></div>        
        <div className="absolute top-10 right-0 w-full h-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60 transform -rotate-12"></div>
        <div className="absolute bottom-16 right-0 w-full h-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60 transform -rotate-12"></div>
        <div className="absolute bottom-16 right-0 w-full h-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60 transform -rotate-12"></div>
        <div className="absolute bottom-16 right-0 w-full h-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60 transform -rotate-12"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-slate-800 to-slate-900 rounded-tl-full translate-x-24 translate-y-24"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-16 py-12">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-serif tracking-wider text-slate-800 mb-3">
              CERTIFICATE
            </h1>
            <p className="text-sm tracking-widest text-slate-700 flex items-center justify-center gap-3">
              <Award size={16} /> OF ACHIEVEMENT <Award size={16} />
            </p>
          </div>

          {/* Body */}
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm mb-6">
              This certificate is proudly awarded to
            </p>

            <h2 className="text-5xl font-serif italic text-slate-900 mb-6">
              {name}
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Successfully completed the{" "}
              <span className="font-semibold">{course}</span>
              <br />
              under XYZ Company
            </p>
          </div>

          {/* Footer */}
          <div className="mt-auto w-full flex justify-between px-10">
            {/* Instructor */}
            <div className="text-center">
              <div className="h-px w-40 bg-black mx-auto mb-2"></div>
              <p className="font-semibold text-slate-800 text-lg flex items-center justify-center gap-2">
                <Signature size={18} /> {instructor}
              </p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>

            {/* Issue Date */}
            <div className="text-center">
              <div className="h-px w-40 bg-black mx-auto mb-2"></div>
              <p className="font-semibold text-black text-lg flex items-center justify-center gap-2">
               {issueDate}
              </p>
              <p className="text-xs text-black">Date Issued</p>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute bottom-24 left-5 z-10">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-xl">
              <Award className="w-12 h-12 text-amber-700" strokeWidth={2.4} />
            </div>
            
          </div>
        </div>
      </div>

      {/* Ribbon Clip Path */}
    
    </div>
  );
}

export default Certificate;
