import { useNavigate } from "react-router-dom";
import { Tag } from "../../../components/ui";

export default function ProfessionalProfilePage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-serif text-4xl text-navy font-normal mb-1">My Profile</h1>
          <p className="text-sm text-gray-500">How businesses see you</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/professional/dashboard/profile/edit")}
          className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90"
        >
          Edit profile
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 flex items-start gap-6">
        <div className="w-20 h-20 bg-pro-blue rounded-full flex items-center justify-center text-navy text-xl font-semibold flex-shrink-0">
          YB
        </div>
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">Yacine Benali</h2>
          <p className="text-sm text-gray-500 mb-4">Software Engineer · Alger</p>
          <div className="flex flex-wrap gap-2">
            <Tag variant="warning">Pending Verification</Tag>
            <Tag variant="success">Open to Remote</Tag>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-5 pb-3 border-b border-gray-100">Personal Information</h3>
          <dl className="space-y-4">
            {[
              ["Phone", "+213 655 000 000"],
              ["Wilaya", "Alger"],
              ["Experience", "3 years"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-3 last:border-0">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-5 pb-3 border-b border-gray-100">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {["JavaScript", "React", "Node.js"].map((s) => (
              <Tag key={s} variant="skill">
                {s}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 pb-3 border-b border-gray-100">About Me</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Passionate software engineer with 3 years of experience building web applications. Specializing in React
          and Node.js.
        </p>
      </div>
    </div>
  );
}
