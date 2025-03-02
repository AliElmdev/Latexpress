import React, { useState, createContext, useContext, useEffect } from "react";
import dynamic from "next/dynamic";
import Language from "../components/form/Language";
import Meta from "../components/meta/Meta";
import FormCP from "../components/form/FormCP";
import LoadUnload from "../components/form/LoadUnload";
import Preview from "../components/preview/Preview";
import DefaultResumeData from "../components/utility/DefaultResumeData";
import SocialMedia from "../components/form/SocialMedia";
import WorkExperience from "../components/form/WorkExperience";
import Skill from "../components/form/Skill";
import PersonalInformation from "../components/form/PersonalInformation";
import Summary from "../components/form/Summary";
import Projects from "../components/form/Projects";
import Education from "../components/form/Education";
import Certification from "../components/form/certification";
import { generateLaTeX } from "../components/utility/latexGenerator"; // Verify correct path
import { FaUserCircle } from "react-icons/fa";
import Navbar from "../components/hero/Navbar";

const getSavedResumeData = () => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem("resumeData");
    return storedData ? JSON.parse(storedData) : DefaultResumeData;
  }
  return DefaultResumeData;
};

const ResumeContext = createContext(getSavedResumeData());
// const ResumeContext = createContext(DefaultResumeData);
const Print = dynamic(() => import("../components/utility/WinPrint"), {
  ssr: false,
});

export default function Builder() {
  const [resumeData, setResumeData] = useState(getSavedResumeData());
  const [formClose, setFormClose] = useState(false);
  const [viewMode, setViewMode] = useState("builder");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [kpiScore, setKpiScore] = useState(null);
  const [isFetchingKpi, setIsFetchingKpi] = useState(false);
  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(resumeData));
  }, [resumeData]);

  // State for Smart Analysis
  // Now generatedKeywords is a JSON object with keys for each category.
  const [analysisText, setAnalysisText] = useState("");
  const [generatedKeywords, setGeneratedKeywords] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeData({ ...resumeData, profilePicture: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  const handleKeywordClick = (keyword, category) => {
    setResumeData((prev) => {
      // Create a copy of the skills array to modify
      const updatedSkills = [...prev.skills];
  
      // Function to find the correct category index
      const categoryIndex = updatedSkills.findIndex((item) => item.title === category);
  
      if (categoryIndex !== -1) {
        // Check if the skill already exists
        if (!updatedSkills[categoryIndex].skills.includes(keyword)) {
          updatedSkills[categoryIndex] = {
            ...updatedSkills[categoryIndex],
            skills: [...updatedSkills[categoryIndex].skills, keyword],
          };
        }
      }
  
      return { ...prev, skills: updatedSkills };
    });
  };
  

  const fetchKpiScore = async () => {
    setIsFetchingKpi(true);
    try {
      const response = await fetch("/api/kpi-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annonce: analysisText,
          competences: resumeData.summary || "",
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch KPI score");
      const data = await response.json();
      setKpiScore(data.score || 0);
    } catch (error) {
      console.error("Error fetching KPI score:", error);
      setKpiScore(null);
    } finally {
      setIsFetchingKpi(false);
    }
  };

  const getFullResumeText = (resumeData) => {
    let text = "";
    // Summary
    if (resumeData.summary) {
      text += `Summary: ${resumeData.summary}\n`;
    }
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      text += "Education:\n";
      resumeData.education.forEach((edu) => {
        text += `- ${edu.school} - ${edu.degree} (${edu.startYear} to ${edu.endYear})\n`;
      });
    }
    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      text += "Work Experience:\n";
      resumeData.workExperience.forEach((work) => {
        text += `- ${work.company} - ${work.position} (${work.startYear} to ${work.endYear})\n`;
        text += `  Description: ${work.description}\n`;
        text += `  Achievements: ${work.keyAchievements}\n`;
      });
    }
    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      text += "Projects:\n";
      resumeData.projects.forEach((project) => {
        text += `- ${project.name}: ${project.description}\n`;
      });
    }
    // Technical Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      text += "Technical Skills:\n";
      resumeData.skills.forEach((skill) => {
        text += `- ${skill.title} (Level: ${skill.level})\n`;
      });
    }
    // Relational Skills
    if (resumeData.relationalSkills && resumeData.relationalSkills.length > 0) {
      text += "Relational Skills:\n";
      text += `- ${resumeData.relationalSkills.join(", ")}\n`;
    }
    // Personal Strengths
    if (resumeData.personalStrengths && resumeData.personalStrengths.length > 0) {
      text += "Personal Strengths:\n";
      text += `- ${resumeData.personalStrengths.join(", ")}\n`;
    }
    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      text += "Certifications:\n";
      text += `- ${resumeData.certifications.join(", ")}\n`;
    }
    // Languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      text += "Languages:\n";
      text += `- ${resumeData.languages.join(", ")}\n`;
    }
    return text;
  };

  // This function calls the API to extract keywords and then sets the generatedKeywords state.
  const handleTextAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const fullResumeText = getFullResumeText(resumeData);
      const response = await fetch("/api/extract-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annonce: analysisText,
          summary: fullResumeText || "",
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch keywords");
      const data = await response.json();
      // Expecting data.keywords to be a JSON object with categories
      setGeneratedKeywords(data.keywords || {});
      await fetchKpiScore();
    } catch (error) {
      setAnalysisError("An error occurred while analyzing the text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ResumeContext.Provider
      value={{ resumeData, setResumeData, handleProfilePicture, handleChange }}
    >
      <Meta
        title="ATSResume | Get hired with an ATS-optimized resume"
        description="ATSResume is a cutting-edge resume builder that helps job seekers create a professional, ATS-friendly resume in minutes."
        keywords="resume builder, ATS resume, job search, resume optimization"
      />
      <Navbar viewMode={viewMode} setViewMode={setViewMode} />

      {/* <div className="left-0 w-full bg-white shadow-lg p-4 flex justify-between items-center mb-2 exclude-print">
        <img src="assets/CVLogo.png" alt="Logo" className="h-10 w-10" />
        <div className="flex space-x-4">
          <button
            className={`px-6 py-3 rounded-lg transition-all ${
              viewMode === "builder"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:bg-blue-50"
            }`}
            onClick={() => setViewMode("builder")}
          >
            📝 Resume Builder
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-all ${
              viewMode === "latex"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:bg-blue-50"
            }`}
            onClick={() => setViewMode("latex")}
          >
            ✨ LaTeX Code
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-all ${
              viewMode === "smart"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:bg-blue-50"
            }`}
            onClick={() => setViewMode("smart")}
          >
            🤖 AI Assistant
          </button>
        </div>
        <div className="relative">
          <button
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaUserCircle className="text-2xl" />
            <span>Ali</span>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg overflow-hidden">
              <a
                href="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                Profile
              </a>
              <a
                href="/logout"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div> */}

      <div className="f-col gap-4 md:flex-row justify-evenly max-w-7xl md:mx-auto md:h-screen md:overflow-y-auto">
        {viewMode === "builder" ? (
          <div className="exclude-print">
            {!formClose && (
              <form className="p-4 bg-blue-400 md:max-w-[100%] md:h-screen md:overflow-y-scroll">
                <LoadUnload />
                <PersonalInformation />
                <SocialMedia />
                <Summary />
                <Education />
                <WorkExperience />
                <Projects />
                {resumeData.skills.map((skill, index) => (
                  <Skill key={index} title={skill.title} />
                ))}
                <Language />
                <Certification />
              </form>
            )}
          </div>
        ) : viewMode === "smart" ? (
          <div className="p-4 bg-white min-h-screen exclude-print">
            <h2 className="text-2xl font-bold mb-4">Smart Analysis</h2>
            <div className="max-w-2xl mx-auto">
              <textarea
                className="w-full h-48 p-4 border rounded-lg mb-4"
                placeholder="Paste your job description here..."
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
              />
              <button
                onClick={handleTextAnalysis}
                disabled={isAnalyzing}
                className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isAnalyzing ? "Analyzing..." : "Generate Keywords"}
              </button>
              {analysisError && (
                <div className="text-red-500 mb-4">{analysisError}</div>
              )}
              {Object.keys(generatedKeywords).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">
                    Suggested Keywords:
                  </h3>
                  {Object.entries(generatedKeywords).map(
                    ([category, keywords]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-bold">{category}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {keywords.map((keyword, index) => (
                            <span
                              key={index}
                              onClick={() =>
                                handleKeywordClick(keyword, category)
                              }
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              {!isFetchingKpi && kpiScore !== null && (
                <div className="flex justify-center mt-6">
                  <div className="relative w-24 h-24">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="text-gray-300"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-blue-500"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset={(100 - kpiScore) * 2.512}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-500">
                      {kpiScore}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-blue-400 md:max-w-[100%] md:h-screen md:overflow-y-scroll exclude-print">
            <div className="bg-white p-4 rounded shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-600 font-semibold">LaTeX Code</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateLaTeX(resumeData));
                  }}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="relative">
                <pre className="text-sm font-mono overflow-auto max-h-96 bg-gray-50 p-4 rounded">
                  <code>
                    {generateLaTeX(resumeData)
                      .split("\n")
                      .map((line, index) => (
                        <div key={index} className="flex">
                          <span className="text-gray-400 pr-4 select-none w-8 text-right">
                            {index + 1}
                          </span>
                          <span className="flex-1 text-gray-700">{line}</span>
                        </div>
                      ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}
        <Preview />
      </div>
      <FormCP formClose={formClose} setFormClose={setFormClose} />
      <Print />
    </ResumeContext.Provider>
  );
}

export { ResumeContext };
