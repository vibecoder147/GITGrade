import { AuditRequest, LanguageStat } from "../types";

const GITHUB_API_BASE = "https://api.github.com/repos";

// Helper to check if a file is text based on extension
const isTextFile = (filename: string): boolean => {
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', 
    '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.php', 
    '.rb', '.txt', '.xml', '.yaml', '.yml', '.sql', '.gitignore', 'package.json'
  ];
  return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

// Helper to decode base64 content safely
const decodeContent = (base64: string): string => {
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
  } catch (e) {
    return "Error decoding file content.";
  }
};

export const fetchGithubRepoData = async (repoUrl: string): Promise<AuditRequest> => {
  // 1. Parse Owner and Repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL. Please use format: https://github.com/owner/repo");
  }
  const [, owner, repo] = match;

  // 2. Fetch Repo Details (Default branch, description)
  const repoDetailsResp = await fetch(`${GITHUB_API_BASE}/${owner}/${repo}`);
  if (!repoDetailsResp.ok) {
    if (repoDetailsResp.status === 404) throw new Error("Repository not found (or is private).");
    if (repoDetailsResp.status === 403) throw new Error("GitHub API rate limit exceeded. Please try again later.");
    throw new Error("Failed to fetch repository details.");
  }
  const repoDetails = await repoDetailsResp.json();
  const defaultBranch = repoDetails.default_branch;
  const description = repoDetails.description || "No description provided.";
  
  const repoName = `${owner}/${repo} - ${description}`;

  // 3. Fetch File Tree (Recursive)
  const treeResp = await fetch(`${GITHUB_API_BASE}/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
  if (!treeResp.ok) throw new Error("Failed to fetch file tree.");
  
  const treeData = await treeResp.json();
  
  // Limit tree size for the prompt
  const allFiles = treeData.tree || [];

  // Calculate Language Distribution
  const extensionMap: Record<string, number> = {};
  allFiles.forEach((file: any) => {
    if (file.type === 'blob') {
      const parts = file.path.split('.');
      if (parts.length > 1) {
        const ext = '.' + parts.pop()?.toLowerCase();
        // Basic mapping for cleaner names
        let lang = ext;
        if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) lang = 'JavaScript';
        else if (['.ts', '.tsx'].includes(ext)) lang = 'TypeScript';
        else if (['.py'].includes(ext)) lang = 'Python';
        else if (['.html'].includes(ext)) lang = 'HTML';
        else if (['.css', '.scss', '.less'].includes(ext)) lang = 'CSS';
        else if (['.json'].includes(ext)) lang = 'JSON';
        else if (['.md'].includes(ext)) lang = 'Markdown';
        else if (['.go'].includes(ext)) lang = 'Go';
        else if (['.rs'].includes(ext)) lang = 'Rust';
        else if (['.java'].includes(ext)) lang = 'Java';
        else if (['.c', '.cpp', '.h'].includes(ext)) lang = 'C/C++';
        else lang = ext; // Fallback to extension

        extensionMap[lang] = (extensionMap[lang] || 0) + 1;
      }
    }
  });

  const languageDistribution: LanguageStat[] = Object.entries(extensionMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 languages
  
  // Generate File Tree String (Visual representation)
  // We'll take top 100 files to avoid massive prompts
  const filesToDisplay = allFiles.slice(0, 100);
  const fileTree = filesToDisplay.map((f: any) => f.path).join('\n') + (allFiles.length > 100 ? `\n... (${allFiles.length - 100} more files)` : '');

  // 4. Identify Important Files to Fetch
  // We prioritize config files and entry points
  const importantFiles = [
    'README.md', 
    'package.json', 
    'tsconfig.json',
    'requirements.txt',
    'Cargo.toml',
    'go.mod',
    'src/App.tsx', 
    'src/App.js',
    'src/index.tsx',
    'src/main.ts',
    'src/main.py',
    'main.py',
    'index.js',
    'server.js'
  ];

  // Filter the tree to find matches, sort by importance
  const filesToFetch = allFiles
    .filter((f: any) => f.type === 'blob' && isTextFile(f.path))
    .sort((a: any, b: any) => {
        const scoreA = importantFiles.indexOf(a.path) !== -1 ? importantFiles.indexOf(a.path) : 999;
        const scoreB = importantFiles.indexOf(b.path) !== -1 ? importantFiles.indexOf(b.path) : 999;
        return scoreA - scoreB;
    })
    .slice(0, 5); // Limit to top 5 files to preserve token context and bandwidth

  // 5. Fetch Content for selected files
  let fileContents = "";
  
  await Promise.all(filesToFetch.map(async (file: any) => {
    try {
      const contentResp = await fetch(file.url); // Uses the blob URL from the tree API
      if (contentResp.ok) {
        const data = await contentResp.json();
        const content = decodeContent(data.content);
        fileContents += `\n--- START OF FILE ${file.path} ---\n${content.substring(0, 5000)}\n`; // Limit per file characters
      }
    } catch (e) {
      console.warn(`Failed to fetch content for ${file.path}`);
    }
  }));

  if (!fileContents) {
    fileContents = "// No accessible code files found to analyze.";
  }

  return {
    repoName,
    fileTree,
    fileContents,
    languageDistribution
  };
};