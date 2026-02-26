# Zinchy 🦞

**Zinchy** is an enterprise-grade AI agent orchestration platform. It provides a secure, multi-user layer on top of high-performance agent runtimes like **ZeptoClaw** and **OpenClaw**, adding essential features for business environments: authentication, granular permissions, audit trails, and centralized governance.

## Inspiration
Zinchy is inspired by [Pinchy](https://example.com/pinchy), the minimalist agent UI, and aims to bring that same intuitive experience to the enterprise.

## Features

- 🚀 **Dual-Runtime Support**: Compatible with both OpenClaw (Node.js) and the ultra-lightweight ZeptoClaw (Rust).
- 👥 **Multi-User & RBAC**: Manage users with an invite system and control agent access via an allow-list model.
- 📜 **Audit Trails**: Comprehensive logging of all tool executions and agent interactions for compliance and security.
- 📂 **Knowledge Base Integration**: Scoped file access for agents through the `zinchy-files` plugin.
- 🛠️ **Customizable Personalities**: Define and assign unique personalities and system prompts to your agents.
- 🐳 **Docker Native**: Easy deployment with Docker Compose, including ready-to-use runtime images.
- 🔒 **Secure by Design**: Local-first architecture with optional encryption and robust session management.

## Assets

### Current Assets
- `zinchy-logo.png`: Original project logo.
- `smithers-avatar.png`: Default agent avatar.
- `favicon.ico`: Standard browser icon.

### New Assets (ZeptoClaw-Inspired)
Created with a minimalist "Rust & Lobster" aesthetic to align with the ZeptoClaw runtime.
- `zinchy-logo-new.svg`: A modern, stylized lobster-themed logo representing connectivity and precision.
- `favicon-new.svg`: Minimalist pincer-based icon for browser tabs.

## Installation

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [pnpm](https://pnpm.io/) (for local development)

### Step-by-Step Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/zinchy.git
   cd zinchy
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env to set your encryption keys and provider API tokens
   ```

3. **Start the platform:**
   ```bash
   docker compose up -d
   ```

## Usage

1. **Access the Dashboard**: Open your browser and navigate to `http://localhost:7777`.
2. **Initial Setup**: Create your admin account and configure your AI providers (e.g., OpenAI, Anthropic).
3. **Create an Agent**: Use the "New Agent" wizard to define a name, model, and personality.
4. **Chat**: Start a conversation with your agent directly from the sidebar.
5. **Monitor**: Check the audit logs in the settings panel to see what tools your agents are using.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
