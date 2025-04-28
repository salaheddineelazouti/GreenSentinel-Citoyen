# GreenSentinel Citoyen

An interactive React application for reporting and visualizing environmental issues with geolocation, quick reporting, and gamified user levels.

## Prerequisites

- Node.js v18.x or higher
- npm v9.x or higher

## Installation

```bash
# Clone the repository
git clone https://github.com/salaheddineelazouti/GreenSentinel-Citoyen.git
cd GreenSentinel-Citoyen

# Install dependencies
npm install
```

## Usage

```bash
# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test
``` 

## Environment Variables

Create a `.env.local` file in the project root and define:

```dotenv
REACT_APP_API_URL=https://api.greensentinel.org/v1
``` 

## Available Scripts

- **start**: Run app in development mode
- **build**: Create production build
- **test**: Launch test runner
- **eject**: Eject CRA configuration (irreversible)

## Project Structure

```
├── public/            # Static assets and index.html
├── src/               # React source code
│   ├── components/    # UI components
│   ├── services/      # API and utility services
│   ├── assets/        # Images and media
│   ├── index.js       # Entry point
│   └── App.js         # App layout
├── .gitignore         # Ignored files
├── package.json       # Dependencies & scripts
└── tailwind.config.js # Tailwind CSS config
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

© 2025 GreenSentinel Citoyen
