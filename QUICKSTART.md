# Zinchy Quickstart Guide 🦞

Follow these steps to get Zinchy up and running in less than 5 minutes.

## 1. Prerequisites

Ensure you have the following installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with Compose)
- An API key from a supported provider (e.g., [OpenAI](https://platform.openai.com/) or [Anthropic](https://console.anthropic.com/))

## 2. Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/zinchy.git
   cd zinchy
   ```

2. **Configure Environment:**
   Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
   *Note: For a quickstart, the default values in `.env.example` are usually sufficient, but ensure `NEXTAUTH_SECRET` is set to a random string.*

## 3. Launching Zinchy

Start the core services (Database, Web UI, and Agent Runtimes):

```bash
docker compose up -d
```

Verify the containers are running:
```bash
docker compose ps
```

## 4. Accessing the Dashboard

1. Open your browser to [http://localhost:7777](http://localhost:7777).
2. **Admin Setup**: On the first visit, you will be prompted to create an administrative account.
3. **Provider Configuration**: Go to **Settings > Providers** and enter your API key for OpenAI or Anthropic.

## 5. Creating Your First Agent

1. Click on **"New Agent"** in the sidebar.
2. **Name**: Give your agent a name (e.g., "Research Assistant").
3. **Model**: Select the model you want to use (e.g., `gpt-4o` or `claude-3-5-sonnet`).
4. **Personality**: Choose a preset or write a custom system prompt.
5. **Permissions**: Grant the agent access to specific tools (like `zinchy_ls` for file access).
6. Click **Create Agent**.

## 6. Chatting

1. Select your new agent from the sidebar.
2. Type a message in the chat box.
3. Observe the **Audit Logs** (in Settings) to see the agent's internal tool usage and "thinking" process.

## 7. Switching Runtimes (Advanced)

Zinchy supports both **OpenClaw** (Node.js) and **ZeptoClaw** (Rust).

- **To use OpenClaw (Default)**: Ensure `OPENCLAW_WS_URL` is set in your `.env`.
- **To use ZeptoClaw**: Ensure `ZEPTOCLAW_API_URL` is set in your `.env`.

Zinchy's unified API layer will automatically route messages to the active runtime without changing your agent configurations.

---

### Troubleshooting
- **Connection Errors**: Ensure the runtime containers (`openclaw` or `zeptoclaw`) have finished their initial startup.
- **Database Issues**: Check logs with `docker compose logs db`.
- **Resetting**: To start fresh, run `docker compose down -v` to clear all data.
