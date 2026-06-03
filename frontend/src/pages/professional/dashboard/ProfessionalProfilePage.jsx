import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "../../../components/ui";
import { getMyProfileDetails } from "../../../services/profilesApi";
import { parseApiError } from "../../../services/auth";

export default function ProfessionalProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfileDetails();
        setProfile(data);
      } catch (err) {
        setError(parseApiError(err, "Unable to load profile."));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-150 rounded-2xl p-6 text-center text-red-700 max-w-lg mx-auto">
        <p className="font-medium mb-3">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/professional/onboarding/profile")}
          className="px-6 py-2 bg-navy text-white rounded-full text-xs font-semibold hover:opacity-90"
        >
          Set up your profile →
        </button>
      </div>
    );
  }

  if (!profile) return null;

  // Format initials for avatar placeholder (first two letters of the full name)
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  const initials = fullName.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "YB";

  // Helper to format Wilaya nicely
  const formatWilaya = (w) => {
    if (!w) return "";
    return w.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

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

      {/* Header Info card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={`${profile.first_name} ${profile.last_name}`}
            className="w-20 h-20 rounded-full object-cover flex-shrink-0 border border-gray-100"
          />
        ) : (
          <div className="w-20 h-20 bg-pro-blue rounded-full flex items-center justify-center text-navy text-xl font-semibold flex-shrink-0">
            {initials || "YB"}
          </div>
        )}
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">{profile.first_name} {profile.last_name}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {profile.professional_title || "Professional"} · {formatWilaya(profile.wilaya)}
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Tag variant="success">
              {profile.availability === "AVAILABLE" ? "Available Now" : profile.availability === "OPEN" ? "Open to Opportunities" : "Not Available"}
            </Tag>
          </div>
        </div>
      </div>

      {/* Basic Info and Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-navy mb-5 pb-3 border-b border-gray-100">Personal Information</h3>
          <dl className="space-y-4">
            {[
              ["Email", profile.email],
              ["Phone", profile.phone || "Not provided"],
              ["Wilaya", formatWilaya(profile.wilaya)],
              ["Address", profile.address || "Not provided"],
              ["Experience", `${profile.years_experience} years`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-3 last:border-0">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-navy mb-5 pb-3 border-b border-gray-100">Skills</h3>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, idx) => (
                <Tag key={idx} variant="skill">
                  {s.skill_name}
                </Tag>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No skills added yet.</p>
          )}
        </div>
      </div>

      {/* Experience, Education and Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Experience Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-navy mb-5 pb-3 border-b border-gray-100">Work Experience</h3>
          {profile.work_experiences && profile.work_experiences.length > 0 ? (
            <div className="space-y-4">
              {profile.work_experiences.map((exp, idx) => (
                <div key={idx} className="border-b border-gray-50 pb-3 last:border-0">
                  <h4 className="font-medium text-sm text-gray-900">{exp.job_role}</h4>
                  <p className="text-xs text-gray-500 mt-1">{exp.company_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No work experience added yet.</p>
          )}
        </div>

        {/* Education Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-navy mb-5 pb-3 border-b border-gray-100">Education</h3>
          {profile.educations && profile.educations.length > 0 ? (
            <div className="space-y-4">
              {profile.educations.map((edu, idx) => (
                <div key={idx} className="border-b border-gray-50 pb-3 last:border-0">
                  <h4 className="font-medium text-sm text-gray-900">{edu.degree} in {edu.field}</h4>
                  <p className="text-xs text-gray-500 mt-1">{edu.institution}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No education details added yet.</p>
          )}
        </div>
      </div>

      {/* Bio, CV, and Links */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-navy mb-4 pb-3 border-b border-gray-100">About Me</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {profile.bio || "No biography provided yet. Edit your profile to tell businesses about yourself."}
          </p>
        </div>

        {(profile.resume_file || (profile.portfolios && profile.portfolios.length > 0)) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-navy mb-4 pb-3 border-b border-gray-100">Links & Documents</h3>
            <div className="space-y-4">
              {profile.resume_file && (
                <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-navy">CV / Resume Document</p>
                      <p className="text-xs text-gray-400">PDF Document</p>
                    </div>
                  </div>
                  <a
                    href={profile.resume_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-navy font-semibold hover:underline"
                  >
                    View Document →
                  </a>
                </div>
              )}

              {profile.portfolios && profile.portfolios.map((port, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔗</span>
                    <div>
                      <p className="text-sm font-medium text-navy">Portfolio Link</p>
                      <p className="text-xs text-gray-400">{port.url}</p>
                    </div>
                  </div>
                  <a
                    href={port.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-navy font-semibold hover:underline"
                  >
                    Visit Link →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
