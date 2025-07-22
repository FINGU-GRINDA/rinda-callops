# Contributing to RINDA CallOps

First off, thank you for considering contributing to RINDA CallOps! It's people like you that make RINDA CallOps such a great tool for businesses worldwide. 🎉

## 🤝 Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node version, Python version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the setup instructions** in the README
3. **Make your changes** following our coding standards
4. **Add tests** if applicable
5. **Ensure all tests pass**
6. **Update documentation** as needed
7. **Submit your PR** with a comprehensive description

## 💻 Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git
- API Keys (OpenAI, LiveKit, Twilio) - see `.env.example`

### Local Development

```bash
# Clone your fork
git clone https://github.com/your-username/callops.git
cd callops

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
uv sync
cd ..

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

# Run the development servers
npm run dev           # Frontend on http://localhost:3000
cd server && uv run run.py  # Backend on http://localhost:8000
```

### Testing

```bash
# Frontend tests
npm test

# Backend tests
cd server
pytest

# Linting
npm run lint
cd server && ruff check .
```

## 📝 Coding Standards

### Frontend (TypeScript/React)

- Use TypeScript for all new code
- Follow the existing component structure
- Use React hooks and functional components
- Keep components small and focused
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Backend (Python)

- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings for all classes and functions
- Keep functions small and focused
- Use meaningful variable names
- Handle errors appropriately

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when relevant

Format:
```
<type>: <subject>

<body>

<footer>
```

Types:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc)
- **refactor**: Code refactoring
- **test**: Test additions or modifications
- **chore**: Maintenance tasks

### Example Areas to Contribute

#### Frontend
- New node types for the visual builder
- UI/UX improvements
- Mobile responsiveness enhancements
- New business templates
- Internationalization (i18n)
- Performance optimizations
- Documentation and examples

#### Backend
- New integration connectors
- Voice processing improvements
- Performance optimizations
- Security enhancements
- API endpoint additions
- Testing coverage
- Documentation

#### AI/Voice
- New language support
- Voice quality improvements
- Conversation flow enhancements
- Context handling improvements
- Tool execution optimizations

## 🎯 First-Time Contributors

Looking for a good first issue? Check out issues labeled:
- `good first issue` - Simple fixes to get you started
- `help wanted` - Issues where we need community help
- `documentation` - Help improve our docs

## 📚 Documentation

- Update the README.md if you change functionality
- Add JSDoc/docstrings to your code
- Update API documentation for endpoint changes
- Include examples where appropriate

## 🔍 Review Process

1. A maintainer will review your PR within 2-3 business days
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be included in the next release!

## 🎊 Recognition

Contributors are recognized in our:
- README.md acknowledgments
- Release notes
- Contributors page (coming soon)

## 💬 Questions?

Feel free to:
- Open an issue for questions
- Join our [Discord community](https://discord.gg/rinda)
- Reach out on [Twitter](https://twitter.com/rindaai)

Thank you for contributing to RINDA CallOps! 🚀