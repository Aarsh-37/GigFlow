# Contributing to GigFlow

Thank you for considering contributing to GigFlow! We welcome your contributions to help make this project better. Please follow these guidelines to ensure a smooth and effective contribution process.

## 1. Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. Please review the [Code of Conduct](CODE_OF_CONDUCT.md) to understand the expected standards of behavior.

## 2. How to Contribute

### 2.1 Reporting Bugs
If you find a bug, please check if it's already reported. If not, open a new issue on GitHub. Provide a clear and concise description of the bug, including:
- Steps to reproduce the behavior.
- Your expected outcome.
- Actual behavior.
- Relevant logs or error messages.
- Environment details (OS, Node.js version, browser, etc.).

### 2.2 Suggesting Enhancements
We appreciate suggestions for new features or improvements. Please open a new issue to discuss your ideas before starting implementation.

### 2.3 Contributing Code
Follow these steps to contribute code:

1.  **Fork the Repository:** Create your own fork of the GigFlow repository.
2.  **Clone Your Fork:** Clone the forked repository to your local machine.
    ```bash
    git clone https://github.com/YOUR_USERNAME/GigFlow.git
    cd GigFlow
    ```
3.  **Set Upstream Remote:** Add the original repository as an upstream remote to stay updated.
    ```bash
    git remote add upstream https://github.com/Aarsh-37/GigFlow.git
    git fetch upstream
    ```
4.  **Create a New Branch:** Branch off from the `main` branch for your changes.
    ```bash
    git checkout -b feat/your-feature-name main
    ```
5.  **Make Your Changes:** Implement your feature or fix the bug.
6.  **Test Your Changes:** Run the tests to ensure your changes don't break existing functionality. Add new tests for your new features.
    *   Backend: `cd backend && npm test`
    *   Frontend: `cd frontend && npm test`
7.  **Commit Your Changes:** Write clear and conventional commit messages.
    ```bash
    git commit -m "feat: Add new feature X"
    # or
    git commit -m "fix: Resolve bug Y"
    ```
8.  **Push to Your Fork:**
    ```bash
    git push origin feat/your-feature-name
    ```
9.  **Open a Pull Request (PR):** Create a pull request from your fork to the `main` branch of the original GigFlow repository.

## 3. Development Setup

Please refer to the main `README.md` file for detailed instructions on setting up the development environment locally or using Docker.

## 4. Code Style and Conventions

-   Adhere to the existing code style, naming conventions, and architectural patterns used in the project.
-   For backend (Node.js/Express), follow established conventions for routing, controllers, middleware, and error handling.
-   For frontend (React/Vite), follow conventions for component structure, state management (Redux Toolkit), and styling (Tailwind CSS).
-   All code changes should be accompanied by appropriate tests.

## 5. Pull Request (PR) Process

-   Ensure your PR targets the `main` branch.
-   Provide a clear title and description for your PR, explaining the changes and the problem they solve.
-   Link any related GitHub issues.
-   All automated tests must pass before your PR can be merged.
-   PRs may be subject to review by project maintainers.

## 6. License

By contributing to GigFlow, you agree that your contributions will be licensed under the MIT License, the same license this project is licensed under.
