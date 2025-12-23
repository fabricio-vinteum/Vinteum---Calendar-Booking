# Documentation

Welcome to the Vinteum Calendar documentation! This guide will help you understand, configure, deploy, and contribute to the project.

---

## 📚 Documentation Index

### Getting Started
- **[README](../README.md)** - Project overview and quick start
- **[Quick Start Guide](#quick-start)** - Get up and running in 5 minutes

### Core Documentation
- **[API Reference](./API.md)** - Complete API documentation
- **[Architecture Guide](./ARCHITECTURE.md)** - System design and architecture
- **[Configuration Guide](./CONFIGURATION.md)** - Environment and settings
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

### Deployment
- **[General Deployment](../DEPLOYMENT.md)** - Deploy to Vercel, Railway, VPS
- **[cPanel Deployment](../CPANEL-DEPLOYMENT.md)** - Deploy to shared hosting

### Contributing
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute
- **[Code of Conduct](#code-of-conduct)** - Community guidelines

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Pizlo/vinteumcalendar.git
cd vinteumcalendar

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Configure Environment

**Backend (`server/.env`):**
```env
HUBSPOT_ACCESS_TOKEN=your_token
HUBSPOT_MOCK_MODE=true

ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_MOCK_MODE=true

PORT=3000
NODE_ENV=development
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

### 4. Open Browser

```
http://localhost:5173/?name=John&email=john@example.com
```

---

## 📖 Documentation Guides

### For Users

**Getting Started:**
1. Read the [README](../README.md) for project overview
2. Follow [Quick Start](#quick-start) to run locally
3. Review [Configuration Guide](./CONFIGURATION.md) for customization

**Deploying:**
1. Choose deployment method:
   - [Vercel + Railway](../DEPLOYMENT.md#option-1-vercel-frontend--railway-backend)
   - [cPanel](../CPANEL-DEPLOYMENT.md)
   - [VPS](../DEPLOYMENT.md#option-3-vpscl oud-server)
2. Configure production environment
3. Test thoroughly before going live

**Troubleshooting:**
1. Check [Common Issues](./TROUBLESHOOTING.md#common-issues)
2. Review error messages
3. Enable debug logging
4. Test with mock mode

### For Developers

**Understanding the System:**
1. Read [Architecture Guide](./ARCHITECTURE.md)
2. Review [API Reference](./API.md)
3. Explore codebase structure

**Making Changes:**
1. Read [Contributing Guide](../CONTRIBUTING.md)
2. Set up development environment
3. Follow coding standards
4. Write tests
5. Submit pull request

**Adding Features:**
1. Understand existing architecture
2. Plan your changes
3. Update documentation
4. Add tests
5. Submit for review

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   User Browser  │
│  (React + Vite) │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Server │
│   (Orchestrator)│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│HubSpot │ │  Zoom  │
│  API   │ │  API   │
└────────┘ └────────┘
```

**Key Concepts:**
- **Stateless Design** - No database required
- **Atomic Transactions** - All-or-nothing booking
- **Capacity Management** - Limit bookings per slot
- **Mock Mode** - Test without real APIs

Learn more in the [Architecture Guide](./ARCHITECTURE.md).

---

## 🔌 API Overview

### Endpoints

**GET `/api/availability`**
- Get available time slots
- Query params: `date`, `timezone`
- Returns: Array of ISO 8601 timestamps

**POST `/api/bookings`**
- Create new booking
- Body: `email`, `firstname`, `date`, `timezone`
- Returns: `contactId`, `dealId`, `meetingId`, `joinUrl`

See [API Reference](./API.md) for complete documentation.

---

## ⚙️ Configuration

### Environment Variables

**Required:**
- `HUBSPOT_ACCESS_TOKEN` - HubSpot Private App token
- `ZOOM_ACCOUNT_ID` - Zoom account ID
- `ZOOM_CLIENT_ID` - Zoom client ID
- `ZOOM_CLIENT_SECRET` - Zoom client secret

**Optional:**
- `PORT` - Server port (default: 3000)
- `ALLOWED_ORIGINS` - CORS origins
- `HUBSPOT_MOCK_MODE` - Enable mock mode
- `ZOOM_MOCK_MODE` - Enable mock mode

See [Configuration Guide](./CONFIGURATION.md) for all options.

---

## 🐛 Troubleshooting

### Common Issues

1. **"Unable to Load Times"**
   - Backend not running
   - CORS error
   - Wrong API URL

2. **HubSpot API Errors**
   - Invalid access token
   - Missing scopes
   - Rate limit exceeded

3. **Zoom API Errors**
   - Invalid credentials
   - Missing scopes
   - Meeting creation failed

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for solutions.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a branch:** `git checkout -b feature/your-feature`
3. **Make changes** following our coding standards
4. **Write tests** for new functionality
5. **Submit pull request**

Read the [Contributing Guide](../CONTRIBUTING.md) for detailed guidelines.

---

## 📝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Other unprofessional conduct

---

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, email: security@yourdomain.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

1. Never commit API keys
2. Use HTTPS in production
3. Validate all inputs
4. Implement rate limiting
5. Monitor for unusual activity
6. Keep dependencies updated
7. Rotate credentials regularly

---

## 📊 Project Status

### Current Version: 1.0.0

**Features:**
- ✅ Capacity management
- ✅ HubSpot integration
- ✅ Zoom integration
- ✅ Atomic transactions
- ✅ Mock mode
- ✅ Responsive UI

**Roadmap:**
- 🔄 Email notifications
- 🔄 Calendar sync
- 🔄 Database integration
- 🔄 Analytics dashboard
- 🔄 Team management

---

## 📞 Support

### Self-Service

1. **Search documentation** - Most questions are answered here
2. **Check troubleshooting** - Common issues and solutions
3. **Enable mock mode** - Test without real APIs
4. **Review logs** - Check for error details

### Community Support

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Questions and community help
- **Documentation** - Comprehensive guides

### Professional Support

For enterprise support, contact: support@yourdomain.com

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- React
- TypeScript
- Node.js
- Express
- Tailwind CSS
- HubSpot API
- Zoom API

Special thanks to all contributors!

---

## 📚 Additional Resources

### External Documentation

- [HubSpot API Docs](https://developers.hubspot.com/docs/api/overview)
- [Zoom API Docs](https://marketplace.zoom.us/docs/api-reference/introduction)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tutorials

- [Setting up HubSpot Private Apps](https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key)
- [Creating Zoom Server-to-Server OAuth Apps](https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app/)
- [Deploying to Vercel](https://vercel.com/docs)
- [Deploying to Railway](https://docs.railway.app/)

---

**Happy coding! 🚀**
