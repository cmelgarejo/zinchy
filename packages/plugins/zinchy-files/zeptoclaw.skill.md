# Zinchy Files Skill

Scoped read-only file access for Zinchy Knowledge Base agents.

## Tools

### zinchy_ls

List files and directories in a scoped path.

**Parameters:**
- `path` (string): Directory path to list.

**Implementation:**
This tool uses the native ZeptoClaw file system access, scoped by the agent's workspace or allowed paths.

### zinchy_read

Read a file's content in a scoped path.

**Parameters:**
- `path` (string): File path to read.

**Implementation:**
Reads the file content if it is within the allowed paths and below the size limit.
