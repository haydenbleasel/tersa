![Tersa image](/app/opengraph-image.png)

# Tersa

A visual AI playground. Tersa is an open source canvas for building AI workflows. Drag, drop connect and run nodes to build your own workflows powered by various industry-leading AI models.

## Features

- **Visual Workflow Builder**: Create AI workflows by connecting nodes in an intuitive drag-and-drop interface
- **Multiple AI Models**: Seamlessly integrate with leading AI models from various providers
- **Multimedia Processing**: Process images, text, audio, and video content through your workflows
- **Automatic Saving**: Changes are automatically saved to your projects
- **Cloud Storage**: All workflows are securely stored in Supabase with Row Level Security enabled
- **Modern UI**: Clean, responsive interface built with Next.js, React, and Tailwind CSS

## Technologies

- [Next.js 15](https://nextjs.org/) with App Router and Turbopack
- [React 19](https://react.dev/)
- [Supabase](https://supabase.com/) for authentication and data storage
- [Vercel AI SDK](https://sdk.vercel.ai/) for AI model integration
- [ReactFlow](https://reactflow.dev/) for the visual canvas
- [TipTap](https://tiptap.dev/) for rich text editing
- [Drizzle ORM](https://orm.drizzle.team/) for database queries
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/), [Kibo UI](https://www.kibo-ui.com/) and [Radix UI](https://www.radix-ui.com/) for accessible UI components

## Getting Started

### Prerequisites

- Node.js (v20+)
- PNPM package manager
- Supabase account and project
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) installed
- [Stripe CLI](https://docs.stripe.com/stripe-cli) installed

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/haydenbleasel/tersa.git
   cd tersa
   ```

2. Install dependencies
   ```sh
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with your environment variables. Check the `lib/env.ts` file for all the variables you need to set.

4. Run the development server
   ```sh
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Login or create an account
2. Create a new project or open an existing one
3. Add nodes to your canvas by clicking the toolbar buttons
4. Connect nodes by dragging from one node's output to another node's input
5. Configure node settings as needed
6. Run your workflow to process data through the AI models

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ and 🤖 by [Hayden Bleasel](https://x.com/haydenbleasel).
