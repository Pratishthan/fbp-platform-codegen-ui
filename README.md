# FBP Platform Codegen UI

A Next.js application for creating OpenAPI and Entity specifications for the FBP Platform.

## Features

- Multi-step UI for feature creation
- OpenAPI YAML editor with Monaco
- Entity specification form
- Vendor extension configuration
- GitHub integration for feature branch creation
- Logging of feature creation

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cursor-fbp-platform-codegen-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   GITHUB_TOKEN=your_github_token
   DATABASE_URL=your_database_url
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── editor/            # Editor page
│   ├── review/            # Review page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   ├── EntityForm.tsx    # Entity form component
│   └── VendorExtensionForm.tsx
├── config/               # Configuration files
├── hooks/               # Custom hooks
├── lib/                 # Utility functions
├── store/               # Zustand store
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Adding New Features

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `npm test`
4. Commit changes: `git commit -m "Add your feature"`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 