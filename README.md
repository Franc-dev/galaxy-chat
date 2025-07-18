# Galaxy Chat - AI-Powered Conversation Platform

A beautiful, galaxy-themed chat application with multiple AI agents, knowledge base integration, and message-based pricing. Built with Next.js, TypeScript, and the Vercel AI SDK.

## Features

- 🌌 **Galaxy-themed Glass Morphism UI** - Beautiful space-inspired design with glass morphism effects
- 🤖 **Multiple AI Agents** - Specialized agents for different tasks (General Assistant, Code Expert, Creative Writer, Data Analyst)
- 📚 **Knowledge Base** - Add custom knowledge for agents to learn from
- 💬 **Real-time Chat Streaming** - Smooth, real-time conversations with AI
- 🎯 **Message-based Pricing** - 10 free messages per day with admin controls
- 🔄 **Smart Model Switching** - Automatically switches between free models when unavailable
- 🗂️ **Conversation Management** - Save and manage chat history
- 🔐 **User Authentication** - Simple email-based user system

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenRouter API with Vercel AI SDK
- **UI Components**: Radix UI, Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- OpenRouter API account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd galaxy-chat-app
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your configuration:
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/galaxy_chat"
OPENROUTER_API_KEY="your-openrouter-api-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

4. Set up the database:
\`\`\`bash
pnpm db:push
pnpm db:generate
\`\`\`

5. Seed the database with default agents:
\`\`\`bash
# Run the SQL script in your database or use Prisma Studio
pnpm db:studio
\`\`\`

6. Start the development server:
\`\`\`bash
pnpm dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Usage

### Getting Started
1. Enter your email to create an account
2. Select an AI agent from the sidebar
3. Start chatting! You have 10 free messages per day

### Adding Knowledge
1. Click "Knowledge Base" in the sidebar
2. Add custom knowledge items with titles, content, and tags
3. Agents will use this knowledge to enhance their responses

### Managing Conversations
- View all conversations in the sidebar
- Delete conversations you no longer need
- Switch between different agents and conversations

## API Endpoints

- `POST /api/auth/user` - Create or authenticate user
- `GET /api/auth/user` - Get user information
- `GET /api/agents` - Get available AI agents
- `POST /api/agents` - Create new agent (admin)
- `GET /api/knowledge` - Get knowledge base items
- `POST /api/knowledge` - Add knowledge item
- `DELETE /api/knowledge` - Delete knowledge item
- `POST /api/chat` - Chat with AI agents
- `GET /api/conversations` - Get user conversations
- `DELETE /api/conversations` - Delete conversation

## Free Models Supported

The application automatically switches between these free models:
- Mistral 7B Instruct
- Google Gemini Flash 1.5
- Meta Llama 3.2 3B Instruct
- Microsoft Phi-3 Mini
- Hugging Face Zephyr 7B Beta
- OpenChat 7B
- Gryphe Mythomist 7B
- Undi95 Toppy M 7B

## Database Schema

The application uses Prisma with PostgreSQL and includes:
- Users with message limits and usage tracking
- Agents with custom system prompts
- Conversations and messages
- Knowledge base with tagging system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
