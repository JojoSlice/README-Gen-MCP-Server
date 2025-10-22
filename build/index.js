#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { readdir, readFile } from "fs/promises";
import { join, parse } from "path";
const README_TEMPLATE = {
    sections: [
        {
            name: "Project Title",
            description: "The main title/name of the project",
            required: true,
        },
        {
            name: "Description",
            description: "A brief overview of what the project does",
            required: true,
        },
        {
            name: "Features",
            description: "Key features and capabilities of the project",
            required: false,
        },
        {
            name: "Installation",
            description: "Steps to install and set up the project",
            required: true,
        },
        {
            name: "Usage",
            description: "How to use the project, including examples",
            required: true,
        },
        {
            name: "Project Structure",
            description: "Directory/file structure overview",
            required: false,
        },
        {
            name: "Technologies Used",
            description: "List of technologies, frameworks, and tools used",
            required: false,
        },
        {
            name: "Configuration",
            description: "Configuration options, environment variables, etc.",
            required: false,
        },
        {
            name: "Contributing",
            description: "Guidelines for contributing to the project",
            required: false,
        },
        {
            name: "License",
            description: "License information",
            required: false,
        },
    ],
};
// Helper function to read directory structure recursively
async function getDirectoryStructure(dirPath, maxDepth = 3, currentDepth = 0, ignorePatterns = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
]) {
    if (currentDepth >= maxDepth) {
        return null;
    }
    try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        const structure = {
            type: "directory",
            name: parse(dirPath).base || dirPath,
            children: [],
        };
        for (const entry of entries) {
            if (ignorePatterns.some((pattern) => entry.name.includes(pattern))) {
                continue;
            }
            const fullPath = join(dirPath, entry.name);
            if (entry.isDirectory()) {
                const subStructure = await getDirectoryStructure(fullPath, maxDepth, currentDepth + 1, ignorePatterns);
                if (subStructure) {
                    structure.children.push(subStructure);
                }
            }
            else {
                structure.children.push({
                    type: "file",
                    name: entry.name,
                    path: fullPath,
                });
            }
        }
        return structure;
    }
    catch (error) {
        throw new Error(`Failed to read directory: ${error}`);
    }
}
// Helper function to analyze project and return structured data
async function analyzeProject(projectPath) {
    try {
        const structure = await getDirectoryStructure(projectPath);
        let packageJson = null;
        try {
            const packagePath = join(projectPath, "package.json");
            const packageContent = await readFile(packagePath, "utf-8");
            packageJson = JSON.parse(packageContent);
        }
        catch {
            // package.json might not exist
        }
        const files = await readdir(projectPath);
        const detectedTechnologies = [];
        const configFiles = [];
        if (files.includes("package.json")) {
            detectedTechnologies.push("Node.js");
            configFiles.push("package.json");
        }
        if (files.includes("tsconfig.json")) {
            detectedTechnologies.push("TypeScript");
            configFiles.push("tsconfig.json");
        }
        if (files.includes("requirements.txt")) {
            detectedTechnologies.push("Python");
            configFiles.push("requirements.txt");
        }
        if (files.includes("setup.py")) {
            detectedTechnologies.push("Python");
            configFiles.push("setup.py");
        }
        if (files.includes("Cargo.toml")) {
            detectedTechnologies.push("Rust");
            configFiles.push("Cargo.toml");
        }
        if (files.includes("go.mod")) {
            detectedTechnologies.push("Go");
            configFiles.push("go.mod");
        }
        if (files.includes("pom.xml")) {
            detectedTechnologies.push("Java");
            configFiles.push("pom.xml");
        }
        if (files.includes("build.gradle")) {
            detectedTechnologies.push("Java/Gradle");
            configFiles.push("build.gradle");
        }
        if (files.includes("Dockerfile")) {
            detectedTechnologies.push("Docker");
            configFiles.push("Dockerfile");
        }
        if (files.includes(".env.example") || files.includes(".env.template")) {
            configFiles.push(files.find((f) => f === ".env.example") || ".env.template");
        }
        const structureString = formatDirectoryStructure(structure, 0);
        return {
            template: README_TEMPLATE,
            projectData: {
                projectName: packageJson?.name || parse(projectPath).base,
                description: packageJson?.description || null,
                version: packageJson?.version || null,
                author: packageJson?.author || null,
                license: packageJson?.license || null,
                homepage: packageJson?.homepage || null,
                repository: packageJson?.repository || null,
                scripts: packageJson?.scripts || {},
                dependencies: packageJson?.dependencies
                    ? Object.keys(packageJson.dependencies)
                    : [],
                devDependencies: packageJson?.devDependencies
                    ? Object.keys(packageJson.devDependencies)
                    : [],
                detectedTechnologies,
                configFiles,
                directoryStructure: structure,
                directoryStructureFormatted: structureString,
                rootFiles: files,
            },
        };
    }
    catch (error) {
        throw new Error(`Failed to analyze project: ${error}`);
    }
}
function formatDirectoryStructure(node, depth) {
    const indent = "  ".repeat(depth);
    let result = "";
    if (node.type === "directory") {
        result += `${indent}${node.name}/\n`;
        if (node.children) {
            for (const child of node.children) {
                result += formatDirectoryStructure(child, depth + 1);
            }
        }
    }
    else {
        result += `${indent}${node.name}\n`;
    }
    return result;
}
// Helper function to generate a visually appealing README
function generateReadme(projectData) {
    const { projectName, description, version, author, license, homepage, repository, scripts, dependencies, devDependencies, detectedTechnologies, configFiles, directoryStructureFormatted, } = projectData;
    let readme = "";
    // Header with title
    readme += `# ${projectName}\n\n`;
    // Badges section
    const badges = [];
    if (version)
        badges.push(`![Version](https://img.shields.io/badge/version-${version}-blue.svg)`);
    if (license)
        badges.push(`![License](https://img.shields.io/badge/license-${license}-green.svg)`);
    if (detectedTechnologies.includes("Node.js"))
        badges.push(`![Node.js](https://img.shields.io/badge/node.js-✓-brightgreen.svg)`);
    if (detectedTechnologies.includes("TypeScript"))
        badges.push(`![TypeScript](https://img.shields.io/badge/typescript-✓-blue.svg)`);
    if (detectedTechnologies.includes("Python"))
        badges.push(`![Python](https://img.shields.io/badge/python-✓-yellow.svg)`);
    if (detectedTechnologies.includes("Rust"))
        badges.push(`![Rust](https://img.shields.io/badge/rust-✓-orange.svg)`);
    if (detectedTechnologies.includes("Go"))
        badges.push(`![Go](https://img.shields.io/badge/go-✓-00ADD8.svg)`);
    if (badges.length > 0) {
        readme += badges.join(" ") + "\n\n";
    }
    // Description
    if (description) {
        readme += `## 📝 Description\n\n${description}\n\n`;
    }
    // Technologies Used
    if (detectedTechnologies.length > 0) {
        readme += `## 🛠️ Technologies Used\n\n`;
        detectedTechnologies.forEach((tech) => {
            readme += `- ${tech}\n`;
        });
        readme += `\n`;
    }
    // Installation
    readme += `## 📦 Installation\n\n`;
    if (dependencies.length > 0 || devDependencies.length > 0) {
        readme += `\`\`\`bash\n`;
        if (detectedTechnologies.includes("Node.js")) {
            readme += `npm install\n`;
        }
        else if (detectedTechnologies.includes("Python")) {
            readme += `pip install -r requirements.txt\n`;
        }
        else if (detectedTechnologies.includes("Rust")) {
            readme += `cargo build\n`;
        }
        else if (detectedTechnologies.includes("Go")) {
            readme += `go mod download\n`;
        }
        readme += `\`\`\`\n\n`;
    }
    else {
        readme += `Clone the repository and follow the setup instructions.\n\n`;
    }
    // Usage / Scripts
    const scriptKeys = Object.keys(scripts);
    if (scriptKeys.length > 0) {
        readme += `## 🚀 Usage\n\n`;
        readme += `Available scripts:\n\n`;
        scriptKeys.forEach((script) => {
            readme += `\`\`\`bash\nnpm run ${script}\n\`\`\`\n`;
            readme += `${scripts[script]}\n\n`;
        });
    }
    // Project Structure
    if (directoryStructureFormatted) {
        readme += `## 📁 Project Structure\n\n`;
        readme += `\`\`\`\n${directoryStructureFormatted}\`\`\`\n\n`;
    }
    // Dependencies
    if (dependencies.length > 0) {
        readme += `## 📚 Dependencies\n\n`;
        dependencies.forEach((dep) => {
            readme += `- ${dep}\n`;
        });
        readme += `\n`;
    }
    // Dev Dependencies
    if (devDependencies.length > 0) {
        readme += `## 🔧 Dev Dependencies\n\n`;
        devDependencies.forEach((dep) => {
            readme += `- ${dep}\n`;
        });
        readme += `\n`;
    }
    // License
    if (license) {
        readme += `## 📄 License\n\n`;
        readme += `This project is licensed under the ${license} License.\n\n`;
    }
    // Author
    if (author) {
        readme += `## 👤 Author\n\n`;
        readme += `${typeof author === 'string' ? author : JSON.stringify(author)}\n\n`;
    }
    // Links
    if (homepage || repository) {
        readme += `## 🔗 Links\n\n`;
        if (homepage)
            readme += `- [Homepage](${homepage})\n`;
        if (repository) {
            const repoUrl = typeof repository === 'string' ? repository : repository.url;
            readme += `- [Repository](${repoUrl})\n`;
        }
        readme += `\n`;
    }
    // Footer
    readme += `---\n\n`;
    readme += `*Generated with ❤️ by README Generator MCP Server*\n`;
    return readme;
}
const server = new Server({
    name: "readme-generator-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_project_structure",
                description: "Read the directory structure of a project. Returns a tree-like structure of files and folders.",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "The absolute path to the project directory",
                        },
                        maxDepth: {
                            type: "number",
                            description: "Maximum depth to traverse (default: 3)",
                            default: 3,
                        },
                    },
                    required: ["path"],
                },
            },
            {
                name: "read_file",
                description: "Read the contents of a file",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "The absolute path to the file to read",
                        },
                    },
                    required: ["path"],
                },
            },
            {
                name: "analyze_project",
                description: "Analyze a project directory and return structured data about the project along with a README template. " +
                    "Returns: (1) A template structure with recommended README sections (some required, some optional), " +
                    "and (2) Detailed project analysis including detected technologies, package.json data, directory structure, scripts, dependencies, and configuration files. " +
                    "The LLM should use this information to construct a comprehensive README following the template structure as a guide, " +
                    "adapting sections based on what's relevant for the specific project.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectPath: {
                            type: "string",
                            description: "The absolute path to the project directory",
                        },
                    },
                    required: ["projectPath"],
                },
            },
            {
                name: "generate_readme",
                description: "Generate a well-formatted, visually appealing README.md file for a project. " +
                    "This tool analyzes the project directory and automatically creates a comprehensive README with: " +
                    "badges, emojis, proper sections (description, installation, usage, project structure, dependencies, etc.), " +
                    "code blocks, and professional formatting. The generated README is ready to use and follows best practices.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectPath: {
                            type: "string",
                            description: "The absolute path to the project directory",
                        },
                    },
                    required: ["projectPath"],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        switch (name) {
            case "read_project_structure": {
                const { path, maxDepth = 3 } = args;
                const structure = await getDirectoryStructure(path, maxDepth);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(structure, null, 2),
                        },
                    ],
                };
            }
            case "read_file": {
                const { path } = args;
                const content = await readFile(path, "utf-8");
                return {
                    content: [
                        {
                            type: "text",
                            text: content,
                        },
                    ],
                };
            }
            case "analyze_project": {
                const { projectPath } = args;
                const analysis = await analyzeProject(projectPath);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(analysis, null, 2),
                        },
                    ],
                };
            }
            case "generate_readme": {
                const { projectPath } = args;
                const analysis = await analyzeProject(projectPath);
                const readme = generateReadme(analysis.projectData);
                return {
                    content: [
                        {
                            type: "text",
                            text: readme,
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("README Generator MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
