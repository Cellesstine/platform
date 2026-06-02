import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "../../../components/ui";
import { listApplications, syncIndividualProfileId } from "../../../services/applicationsApi";
import { getMyProfileDetails } from "../../../services/profilesApi";
import { parseApiError } from "../../../services/auth";

export default function ProfessionalApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchApplications = async () => {
      try {
        // Resolve profile ID first
        let profileId = await syncIndividualProfileId();
        if (!profileId) {
          // If not cached, load profile directly to resolve
          const profile = await getMyProfileDetails();
          profileId = profile.id;
        }

        if (profileId) {
          const data = await listApplications({ applicant: profileId });
          if (!cancelled) {
            setApplications(data);
          }
        } else {
          if (!cancelled) {
            setApplications([]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(parseApiError(err, "Unable to load your applications."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchApplications();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter application list
  const filteredApps = applications.filter((app) => {
    if (filterStatus === "ALL") return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <Tag variant="new">Offered / Accepted</Tag>;
      case "REJECTED":
        return <span className="text-xs px-2.5 py-1 rounded-linkio font-medium bg-red-50 text-red-700 border border-red-100">Not Selected</span>;
      case "REVIEWED":
        return <Tag variant="remote">Reviewed</Tag>;
      default:
        return <Tag variant="default">Pending Review</Tag>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-4xl text-navy font-normal mb-1">My Applications</h1>
          <p className="text-sm text-gray-500">Track and manage your job submissions</p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-gray-150/50 shadow-sm gap-1">
          {["ALL", "PENDING", "REVIEWED", "ACCEPTED", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200
                ${filterStatus === st 
                  ? "bg-navy text-white shadow-sm" 
                  : "text-gray-500 hover:text-navy hover:bg-gray-50"
                }`}
            >
              {st === "ALL" ? "All Submissions" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-150 text-red-700 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-150/50 shadow-sm text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-pro-blue/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            💼
          </div>
          <h3 className="font-serif text-2xl text-navy mb-2">No applications found</h3>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            {filterStatus === "ALL" 
              ? "You haven't applied to any job postings yet. Explore active opportunities to kickstart your next application!" 
              : `You do not have any applications matching the "${filterStatus.toLowerCase()}" status filter.`
            }
          </p>
          <button
            type="button"
            onClick={() => navigate("/professional/dashboard/announcements")}
            className="px-6 py-3 bg-navy text-white rounded-full text-sm font-semibold hover:bg-navy/95 transition-all shadow cursor-pointer"
          >
            Explore Announcements →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isExpanded = expandedId === app.id;
            return (
              <div 
                key={app.id}
                className="bg-white rounded-3xl border border-gray-150/50 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header Card Row */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {app.announcement_company_avatar ? (
                      <img
                        src={app.announcement_company_avatar}
                        alt={app.announcement_company}
                        className="w-12 h-12 rounded-2xl object-cover flex-shrink-0 border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                        style={{ background: "linear-gradient(135deg, #0B1E36 0%, #1d3d63 100%)" }}
                      >
                        {(app.announcement_company || "CO").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="font-serif text-lg text-navy-deep font-normal">{app.announcement_title}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.announcement_company} · Applied on {new Date(app.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    {getStatusBadge(app.status)}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="px-4 py-2 border border-gray-200 hover:border-navy text-navy rounded-xl text-xs font-semibold transition-all cursor-pointer bg-white"
                    >
                      {isExpanded ? "Hide Details" : "View Application"}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details Drawer */}
                {isExpanded && (
                  <div className="bg-gray-50/60 border-t border-gray-100 p-6 space-y-5 transition-all duration-300">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sent Cover Letter</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white rounded-2xl p-4 border border-gray-100 shadow-sm leading-relaxed">
                        {app.cover_letter || "No cover letter was included in this application."}
                      </p>
                    </div>

                    {app.resume_file && (
                      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="text-sm font-semibold text-navy">Submitted Resume</p>
                            <p className="text-xs text-gray-400">PDF Document</p>
                          </div>
                        </div>
                        <a
                          href={app.resume_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-navy text-white rounded-xl text-xs font-semibold hover:bg-navy/95 transition-all"
                        >
                          View Document →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
