# ArgosFinal - Unified SDR & Network Analysis Console

[![CI/CD Pipeline](https://github.com/yourusername/ArgosFinal/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/ArgosFinal/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/yourusername/ArgosFinal/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/ArgosFinal)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

ArgosFinal is a comprehensive web-based control center for Software Defined Radio (SDR) operations, WiFi network scanning, and GPS tracking with Team Awareness Kit (TAK) integration. Built with modern web technologies, it provides a unified interface for managing multiple radio and network analysis tools.

## 🚀 Features

- **Real-time Spectrum Analysis**: Monitor RF spectrum with live waterfall displays and signal detection
- **HackRF Integration**: Full control over HackRF SDR devices with frequency sweeping capabilities
- **WiFi Network Scanning**: Kismet-based wireless network discovery and analysis
- **GPS Tracking**: MAVLink to GPSD bridge for location services
- **TAK Integration**: Convert WiFi scan data to TAK format for tactical mapping
- **WebSocket Support**: Real-time data streaming for live updates
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **TypeScript**: Full type safety across the entire codebase

## 🛠️ Tech Stack

- **Frontend Framework**: [SvelteKit](https://kit.svelte.dev/) 2.0
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.0+
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 3.4
- **Build Tool**: [Vite](https://vitejs.dev/) 5.0
- **Package Manager**: npm
- **Runtime**: Node.js 18+

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git
- HackRF hardware (for SDR features)
- Kismet (for WiFi scanning features)
- GPSd (for GPS features)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/Graveside2022/ArgosFinal.git
cd ArgosFinal
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Build the application:

```bash
npm run build
```

5. Start the production server:

```bash
npm run preview
```

### 🐳 Docker Installation

Using Docker Compose:

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build
```

Using Docker directly:

```bash
# Build image
docker build -t argos-final:latest .

# Run container
docker run -p 3000:3000 --env-file .env argos-final:latest
```

## 💻 Development

To run the development server with hot-reloading:

```bash
npm run dev
```

For development with network access:

```bash
npm run dev -- --host
```

### Development Commands:

```bash
# Type checking
npm run check

# Linting
npm run lint
npm run lint:fix          # Auto-fix linting issues

# Formatting
npm run format            # Format all files
npm run format:check      # Check formatting without changes

# Testing
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Generate coverage report

# Pre-commit hooks setup (one-time)
npm run prepare
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and function testing with Vitest
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user flow testing with Playwright
- **Visual Regression**: UI consistency testing
- **Performance Tests**: Load and response time benchmarks

Run tests with:

```bash
npm test
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Development setup
- Code style and standards
- Testing requirements
- Pull request process

## 📦 CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Code Quality**: ESLint, Prettier, and TypeScript checks
- **Security Scanning**: npm audit and Trivy vulnerability scanning
- **Testing**: Automated test suite on multiple Node.js versions
- **Docker**: Automated image building and pushing
- **Deployment**: Automated deployment to production (when configured)

## 🗺️ Routes

### Home (`/`)

The main dashboard with navigation to all system components.

### View Spectrum (`/viewspectrum`)

Real-time spectrum analyzer interface that embeds OpenWebRX for SDR visualization.

- **Features**: Live waterfall display, frequency selection, gain control
- **Integration**: Connects to OpenWebRX on port 8073

### HackRF Sweep (`/hackrfsweep`)

Control interface for HackRF frequency sweeping operations.

- **Features**: Frequency range selection, sweep speed control, signal strength monitoring
- **Integration**: Connects to HackRF Sweep Monitor on port 3002

### WigleToTAK (`/wigletotak`)

Converts Kismet WiFi scan data to TAK format for tactical awareness.

- **Features**:
    - TAK server configuration
    - Real-time/post-collection analysis modes
    - Antenna sensitivity adjustment
    - SSID/MAC filtering (whitelist/blacklist)
    - Broadcast control

## 🔌 API Integrations

### Spectrum Analyzer API

- **Base URL**: `http://localhost:8092`
- **Endpoints**:
    - `GET /api/status` - Get current spectrum analyzer status
    - `POST /api/start` - Start spectrum analysis
    - `POST /api/stop` - Stop spectrum analysis
    - `WebSocket /ws` - Real-time spectrum data stream

### WigleToTAK API

- **Base URL**: `http://localhost:8000`
- **Endpoints**:
    - `POST /update_tak_settings` - Configure TAK server
    - `POST /update_multicast_state` - Toggle multicast
    - `POST /update_analysis_mode` - Set analysis mode
    - `POST /update_antenna_sensitivity` - Configure antenna
    - `GET /list_wigle_files` - List available CSV files
    - `POST /start_broadcast` - Start TAK broadcast
    - `POST /stop_broadcast` - Stop TAK broadcast
    - `POST /add_to_whitelist` - Add SSID/MAC to whitelist
    - `POST /add_to_blacklist` - Add SSID/MAC to blacklist

### OpenWebRX Integration

- **Base URL**: `http://localhost:8073`
- **Default Credentials**: admin/hackrf

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PUBLIC_API_BASE_URL=http://localhost:8000
PUBLIC_SPECTRUM_ANALYZER_URL=http://localhost:8092
PUBLIC_OPENWEBRX_URL=http://localhost:8073
PUBLIC_HACKRF_SWEEP_URL=http://localhost:3002
```

### SDR Configuration

Configure your SDR devices in the respective service configurations:

1. **OpenWebRX**: Edit `/etc/openwebrx/config.json`
2. **HackRF Sweep**: Configure in the service settings
3. **Kismet**: Edit `/etc/kismet/kismet.conf`

## 📁 Project Structure

```
ArgosFinal/
├── src/
│   ├── routes/          # SvelteKit routes
│   ├── lib/             # Shared components and utilities
│   │   ├── components/  # Reusable UI components
│   │   ├── stores/      # Svelte stores
│   │   └── utils/       # Helper functions
│   └── app.html         # HTML template
├── static/              # Static assets
├── tests/               # Test files
├── scripts/             # Utility scripts
├── docs/                # Documentation
└── package.json         # Project configuration
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

Build for production:

```bash
npm run build
```

The build output will be in the `build/` directory. You can deploy this to any static hosting service or run it with:

```bash
node build
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure all backend services are running and configured to allow requests from your frontend URL
2. **Connection Failed**: Verify all required services (HackRF, Kismet, GPSd) are running
3. **Permission Denied**: Some features require root access for hardware interaction

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### Commit Convention

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- HackRF team for the excellent SDR hardware
- Kismet developers for the WiFi scanning framework
- OpenWebRX project for the web-based SDR interface
- SvelteKit team for the amazing web framework

## 📞 Support

For support, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for the SDR and network analysis community
