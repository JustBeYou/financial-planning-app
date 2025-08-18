# GitHub Copilot Instructions

This document compiles all best practices, code organization, documentation, environment, frameworks, and git commit guidelines for this project. These instructions are intended for use by GitHub Copilot and contributors to ensure consistency and quality across the codebase.

---

## Best Practices

- Follow clean code principles: use meaningful names, keep functions small, and avoid code duplication.
- Write modular, reusable, and testable code.
- Handle errors gracefully and validate inputs.
- Use type safety and static analysis tools where possible.
- Prioritize security, performance, and accessibility.

## Code Organization

- Organize code by feature or domain, not by type.
- Group related files (components, utils, types) together.
- Keep files and functions focused on a single responsibility.
- Use clear and consistent naming conventions for files and folders.
- Avoid deeply nested folder structures.

## Documentation

- Write clear, concise, and up-to-date documentation for all modules and components.
- Use JSDoc/TSDoc comments for functions, classes, and complex logic.
- Document public APIs, expected inputs/outputs, and side effects.
- Update documentation when code changes.

## Environment

- Use environment variables for configuration and secrets.
- Do not commit sensitive information to the repository.
- Provide example environment files (e.g., `.env.example`).
- Document required environment variables in the README.

## Frameworks

- Use the frameworks and libraries specified in `package.json` and project documentation.
- Follow official best practices and patterns for each framework.
- Keep dependencies up to date and remove unused packages.
- Prefer built-in solutions over third-party packages when possible.

## Git Commits

- Write clear, descriptive commit messages in the present tense.
- Use conventional commit prefixes (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
- Make each commit a logical unit of change.
- Reference related issues or pull requests when relevant.
- Do not commit generated files or sensitive data.

---

By following these instructions, you help maintain a high-quality, maintainable, and collaborative codebase. GitHub Copilot should use these guidelines when generating code, comments, or documentation for this project.
