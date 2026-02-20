![Tersa](/app/opengraph-image.png)

# Tersa

A visual AI playground. Drag, drop, connect and run nodes to build AI workflows powered by the [Vercel AI SDK Gateway](https://sdk.vercel.ai/docs/ai-sdk-core/gateway).

## Features

- **Visual Workflow Builder**: Create AI workflows by connecting nodes in a drag-and-drop canvas
- **Multi-Model Support**: Access text, image and video models from 25+ providers through Vercel AI SDK Gateway
- **Cost Indicators**: See relative pricing across models at a glance
- **Reasoning Extraction**: View model reasoning for supported providers
- **Streaming Responses**: Real-time text generation with streaming support
- **Local Storage**: Canvas state persists in the browser automatically

## Technologies

- [Next.js 15](https://nextjs.org/) with App Router and Turbopack
- [React 19](https://react.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/) with [AI SDK Gateway](https://sdk.vercel.ai/docs/ai-sdk-core/gateway)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for media storage
- [ReactFlow](https://reactflow.dev/) for the visual canvas
- [TipTap](https://tiptap.dev/) for rich text editing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/), [Kibo UI](https://www.kibo-ui.com/) and [Radix UI](https://www.radix-ui.com/) for UI components

## Getting Started

### Prerequisites

- Node.js (v20+)
- PNPM package manager

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/vercel-labs/tersa.git
   cd tersa
   ```

2. Install dependencies
   ```sh
   pnpm install
   ```

3. Create a `.env.local` file with your [AI SDK Gateway](https://sdk.vercel.ai/docs/ai-sdk-core/gateway) credentials and any provider API keys you want to use.

4. Run the development server
   ```sh
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Add nodes to the canvas using the toolbar
2. Connect nodes by dragging from one node's output to another's input
3. Select a model from any supported provider
4. Run your workflow to process data through the AI models

## License

This project is licensed under the MIT License - see the [LICENSE](license.md) file for details.

---

Made with ❤️ and 🤖 by [Hayden Bleasel](https://x.com/haydenbleasel).
