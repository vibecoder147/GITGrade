import { GoogleGenAI } from "@google/genai";
import { AuditRequest, AuditResponse } from "../types";

const SYSTEM_INSTRUCTION = `
Role:
You are an elite Senior Software Architect and Technical Interviewer at a top-tier tech company (like Google or Microsoft). You are acting as a judge for a Student Developer Hackathon.

Objective:
Your goal is to analyze a student's GitHub repository data and provide a "tough love" but constructive audit. You must ignore your knowledge of "famous" repos and treat this as a student submission. You must generate a Score, a Summary, and a Personalized Roadmap.

Evaluation Criteria (The "Dimensions"):
Structure: Is the project modular? (e.g., uses src/, components/, or separates logic from UI).
Documentation: Does the README.md exist? Does it explain how to run the project?
Best Practices: Are there comments? Is there a .gitignore? Are there unit tests?
Completeness: Does it look like a finished prototype or a half-baked script?

Strict Output Format (Markdown):
# 🛡️ GitHub Repository Audit

## 📊 GitGrade Score: [0-100]/100
*(Rate strictly. 90+ is production-ready. 70-80 is good student work. <50 needs serious help.)*

## 📝 Executive Summary
[Write a 2-3 sentence professional summary. Be honest.]

## 🔍 Deep Dive Analysis
* **✅ Strengths:** [Bullet point 1], [Bullet point 2]
* **⚠️ Weaknesses:** [Bullet point 1], [Bullet point 2]
* **📂 Structure:** [Comment on file organization]
* **📘 Documentation:** [Comment on README quality]

## 🗺️ Personalized Roadmap to Success
*This is the most important section. Give 4-5 specific, actionable steps for THIS STUDENT to improve THIS SPECIFIC PROJECT.*
1.  **[Action Item 1]:** [Description specifically related to their code]
2.  **[Action Item 2]:** [Description]
3.  **[Action Item 3]:** [Description]
4.  **[Action Item 4]:** [Description]
`;

export const analyzeRepository = async (data: AuditRequest): Promise<AuditResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const userPrompt = `
      Repository Name/Description: ${data.repoName}

      File Tree (Folder Structure):
      ${data.fileTree}

      Key File Contents:
      ${data.fileContents}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const markdown = response.text || "Error: No response generated.";
    
    const scoreMatch = markdown.match(/GitGrade Score: (\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    return {
      markdown,
      score
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze repository. Please check your inputs and try again.");
  }
};

export const generateReadme = async (data: AuditRequest): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are an expert developer. Based on the following file structure and contents, generate a professional, production-ready README.md.
      
      Requirements:
      - Title and Description
      - Features List
      - Tech Stack Badge/List
      - Getting Started (Installation & Usage)
      - Project Structure overview
      
      Repo Name: ${data.repoName}
      Files: ${data.fileTree}
      Content Snippets: ${data.fileContents}
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Failed to generate README.";
  } catch (error) {
    console.error("Error generating README:", error);
    return "Error generating README. Please try again.";
  }
};

export const generateUnitTests = async (data: AuditRequest): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are a QA Engineer. Based on the code provided, generate a basic unit test file (e.g., test_main.py or App.test.tsx) using the most appropriate testing framework for the primary language detected.
      
      - If Python: Use unittest or pytest.
      - If JavaScript/TypeScript: Use Jest or Vitest.
      - If Go: Use testing package.
      
      Provide code only, wrapped in markdown code blocks.
      
      Repo Name: ${data.repoName}
      Files: ${data.fileTree}
      Content Snippets: ${data.fileContents}
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Failed to generate tests.";
  } catch (error) {
    console.error("Error generating tests:", error);
    return "Error generating tests. Please try again.";
  }
};