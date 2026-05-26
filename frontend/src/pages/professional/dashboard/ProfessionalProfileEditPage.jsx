import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, inputClass } from "../../../components/ui";

export default function ProfessionalProfileEditPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState(["JavaScript", "React", "Node.js", "TypeScript", "Git"]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-navy font-normal mb-1">Edit Profile</h1>
        <p className="text-sm text-gray-500">Update how businesses see you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="w-24 h-24 bg-pro-blue rounded-full flex items-center justify-center text-navy text-2xl font-semibold">
              YB
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-7 h-7 bg-navy rounded-full text-white text-xs flex items-center justify-center"
            >
              ✎
            </button>
          </div>
          <h2 className="font-serif text-xl text-navy text-center mb-1">Yacine Benali</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Software Engineer · Alger</p>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Profile completion</span>
              <span>85%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-navy rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          <section>
            <h3 className="font-semibold mb-5 pb-3 border-b border-gray-100">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First Name">
                <input defaultValue="Yacine" className={inputClass} />
              </Field>
              <Field label="Last Name">
                <input defaultValue="Benali" className={inputClass} />
              </Field>
              <Field label="Phone Number">
                <input defaultValue="+213 655 000 000" className={inputClass} />
              </Field>
              <Field label="Years of Experience">
                <input defaultValue="3–5 years" className={inputClass} />
              </Field>
              <Field label="Wilaya">
                <input defaultValue="Alger" className={inputClass} />
              </Field>
              <Field label="Work Type">
                <input defaultValue="Employee & Freelancer" className={inputClass} />
              </Field>
              <Field label="Job Title" className="md:col-span-2">
                <input defaultValue="Software Engineer" className={inputClass} />
              </Field>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-4">Skills & Expertise</h3>
            <div className={`${inputClass} flex flex-wrap gap-2 mb-4`}>
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-xs bg-pro-blue/40 text-navy px-2.5 py-1 rounded-lg">
                  {s}
                  <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))} className="opacity-60">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button type="button" className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-navy">
              + Add skill
            </button>
          </section>

          <section>
            <h3 className="font-semibold mb-4">About Me</h3>
            <textarea
              rows={4}
              defaultValue="Passionate software engineer with 3 years of experience building web applications. Specializing in React and Node.js."
              className={`${inputClass} resize-y`}
            />
          </section>

          <section>
            <h3 className="font-semibold mb-4">CV & Documents</h3>
            <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium">CV_Yacine_Freelance.pdf</p>
                  <p className="text-xs text-gray-400">Uploaded 10 Jan 2026 · 290 KB</p>
                </div>
              </div>
              <button type="button" className="text-sm text-navy font-medium hover:underline">
                Replace
              </button>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/professional/dashboard/profile")}
              className="px-5 py-2.5 border border-gray-200 rounded-full text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => navigate("/professional/dashboard/profile")}
              className="px-8 py-2.5 bg-navy text-white rounded-full text-sm font-medium hover:bg-navy/90"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
