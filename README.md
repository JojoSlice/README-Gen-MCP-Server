# README Generator MCP Server

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-ISC-green.svg) ![Node.js](https://img.shields.io/badge/node.js-✓-brightgreen.svg) ![TypeScript](https://img.shields.io/badge/typescript-✓-blue.svg)

## 📝 Description

A Model Context Protocol (MCP) server that enables LLMs to automatically analyze project structures and generate comprehensive, well-formatted README files. This server provides intelligent project analysis, technology detection, and README generation capabilities that help developers quickly create professional documentation.

## 🛠️ Technologies Used

- Node.js
- TypeScript
- MCP SDK (@modelcontextprotocol/sdk)

## ✨ Features

- **Automatic Technology Detection**: Identifies Node.js, TypeScript, Python, Rust, Go, Java, Docker, and more
- **Smart Project Analysis**: Extracts metadata from package.json, dependencies, scripts, and configuration files
- **Directory Structure Scanning**: Recursive traversal with configurable depth and intelligent ignore patterns
- **Rich README Generation**: Creates professional READMEs with badges, emojis, proper sections, and code blocks
- **Flexible Template System**: Predefined structure with required and optional sections
- **Multi-language Support**: Works with various programming languages and frameworks

## 📦 Installation

```bash
npm install
```

## 🔧 Setup

### 1. Build the server

```bash
npm run build
```

### 2. Configure Claude Desktop

Add this server to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "readme-generator": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/build/index.js"]
    }
  }
}
```

### 3. Restart Claude Desktop

After adding the configuration, restart Claude Desktop to load the MCP server.

## 🚀 Usage

### Available Scripts

```bash
npm run build
```
Compiles TypeScript and makes the output executable

```bash
npm run watch
```
Watches for changes and recompiles automatically

```bash
npm run prepare
```
Runs build automatically before npm publish

### Available MCP Tools

The server provides four tools for LLMs:

#### 1. `read_project_structure`
Reads the directory structure of a project and returns a tree-like structure.

**Example:**
```json
{
  "path": "/home/user/my-project",
  "maxDepth": 3
}
```

#### 2. `read_file`
Reads the contents of a specific file.

**Example:**
```json
{
  "path": "/home/user/my-project/package.json"
}
```

#### 3. `analyze_project`
Analyzes a project directory and returns structured data including detected technologies, dependencies, scripts, and directory structure.

**Example:**
```json
{
  "projectPath": "/home/user/my-project"
}
```

#### 4. `generate_readme`
Automatically generates a complete, professional README.md file for a project.

**Example:**
```json
{
  "projectPath": "/home/user/my-project"
}
```

## 💡 Usage Examples

### Quick README Generation

Once the MCP server is configured in Claude Desktop, simply ask:

```
"Generate a README for my project at /home/user/my-awesome-app"
```

The server will:
1. Analyze the project directory
2. Detect technologies (Node.js, Python, Rust, etc.)
3. Extract metadata from configuration files
4. Generate a professional README with appropriate sections

### Detailed Project Analysis

For more control over the process:

```
"Analyze the project at /home/user/my-awesome-app and show me what you found"
```

Review the analysis, then request:

```
"Now generate a README emphasizing the API documentation and deployment sections"
```

### Step-by-Step Workflow

For complex projects requiring customization:

1. **Explore the structure:**
   ```
   "Read the project structure of /home/user/my-app with depth 4"
   ```

2. **Review specific files:**
   ```
   "Read the package.json and show me the available scripts"
   ```

3. **Get comprehensive analysis:**
   ```
   "Analyze the entire project and tell me what technologies you detected"
   ```

4. **Generate customized README:**
   ```
   "Create a README with extra focus on the testing and contribution guidelines"
   ```

### Real-World Example

```
User: "I have a TypeScript Express API project at /home/user/projects/api-server.
       Can you create a README for it?"

Claude: [Uses the MCP server to analyze the project]
        "I've analyzed your project and found:
        - TypeScript with Express.js
        - PostgreSQL database integration
        - Jest for testing
        - Docker configuration

        I'll create a comprehensive README with sections for setup,
        API endpoints, database configuration, and deployment."
```

The generated README will automatically include:
- Proper badges for TypeScript, Node.js, etc.
- Installation instructions based on package.json
- All available npm scripts with descriptions
- Project structure visualization
- Dependencies and dev dependencies
- API usage examples (if detected)
- Docker deployment instructions (if Dockerfile exists)

## 📁 Project Structure

```
mcp/
  package-lock.json
  package.json
  src/
    index.ts
  tsconfig.json
```

## 🎨 Customization

### Modify the README Template

Edit the `README_TEMPLATE` in `src/index.ts:12-66` to customize sections:

```typescript
const README_TEMPLATE = {
  sections: [
    {
      name: "Project Title",
      description: "The main title/name of the project",
      required: true,
    },
    {
      name: "Your Custom Section",
      description: "Description of what this section should contain",
      required: false,
    },
    // Add more sections as needed
  ],
};
```

### Add Technology Detection

Extend the `analyzeProject` function in `src/index.ts:126-214` to detect additional frameworks:

```typescript
if (files.includes("docker-compose.yml")) {
  detectedTechnologies.push("Docker Compose");
  configFiles.push("docker-compose.yml");
}
```

After making changes, rebuild:
```bash
npm run build
```

## 📚 Dependencies

- @modelcontextprotocol/sdk

## 🔧 Dev Dependencies

- @types/node
- typescript

## 📖 How It Works

1. **Project Scanning**: Recursively reads the project directory (ignoring node_modules, .git, dist, build)
2. **Technology Detection**: Identifies technologies based on config files (package.json, tsconfig.json, Cargo.toml, etc.)
3. **Metadata Extraction**: Pulls information from package.json including scripts, dependencies, author, license
4. **Template Application**: Uses a predefined template structure with required and optional sections
5. **README Generation**: Creates a formatted README with badges, proper sections, code blocks, and professional styling

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add my feature'`
5. Push to the branch: `git push origin feature/my-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

*This README was generated using the README Generator MCP Server itself! 🎉*
