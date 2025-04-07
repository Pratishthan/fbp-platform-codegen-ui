export GITHUB_TOKEN=ghp_xxxxxxxxxxxx

```
cd feature-spec-creator-app
npm install
npm run dev
```


# Feature Specification Creator for Backstage

This project provides a user interface, intended to be integrated as a Backstage plugin, to streamline the creation of OpenAPI and Entity specifications for microservices. It facilitates an API-first workflow, automating the initial specification setup and commit process to improve developer productivity and ensure consistency.

## Why? (The Problem & Goal)

Developing microservices often involves manually creating OpenAPI specifications, entity definitions, and associated boilerplate code. This manual process is:

*   **Time-Consuming:** Takes significant developer time away from core logic.
*   **Error-Prone:** Leads to inconsistencies in API design and implementation.
*   **Inconsistent:** Results in varied codebases that are harder to maintain.
*   **Process Friction:** Manually managing specification files across repositories is cumbersome.

**Goal:** To significantly improve developer productivity, enforce API design standards (including specific vendor extensions like `x-fbp-*`), and ensure code consistency. This tool aims to reduce the initial specification setup time from potentially a full day to under 30 minutes by automating the creation and commitment of OpenAPI and Entity specification files.

## Features (MVP)

*   **Guided Specification Creation:** UI-driven forms for defining OpenAPI schemas, vendor extensions (`x-fbp-*`), and related JPA Entity specifications (including relationships and standardized domain data types).
*   **Integrated Editor:** Provides a YAML editor for OpenAPI specs, pre-populated with templates and context.
*   **Standalone Entity Definition:** Allows defining database entities not directly tied to an OpenAPI schema.
*   **Automated Git Workflow:**
    *   Select target microservice from the Backstage Catalog.
    *   Automatically creates a feature branch (`feature/<feature-name>`).
    *   Commits the generated OpenAPI (`.yaml`) and Entity (`.entity.json`) specification files.
    *   Creates a Pull Request targeting the `develop` branch in the selected repository.
*   **Configurability:** Uses an external configuration for predefined `domainDataType` values.

*(Note: The actual code generation based on these specifications is handled by downstream automation triggered after the PR merge.)*

## How to Setup (Development)

This application is built using Next.js.

1.  **Prerequisites:**
    *   Node.js (Check `package.json` for compatible versions, likely >= 20)
    *   npm (or yarn/pnpm)

2.  **Clone the repository (if you haven't already):**
    ```bash
    # Navigate to your projects directory
    git clone <your-repository-url>
    cd cline-fbp-platform-codegen-ui
    ```

3.  **Navigate to the application directory:**
    ```bash
    cd feature-spec-creator-app
    ```

4.  **Install dependencies:**
    ```bash
    npm install
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application in development mode (with Turbopack) on `http://localhost:3000` (or the next available port).

6.  **Build for production:**
    ```bash
    npm run build
    ```

7.  **Start the production server:**
    ```bash
    npm start
    ```

8.  **Lint the code:**
    ```bash
    npm run lint
    ```

## How to Use (Workflow)

1.  **Initiate:** Access the plugin/application. Start a "Create new feature" action.
2.  **Setup:** Select the target microservice (from Backstage Catalog) and provide a Feature Name and Description.
3.  **Define OpenAPI Schemas:**
    *   Use the "Add Schema" button.
    *   Define basic schema properties in the editor.
    *   Click "Prepare Vendor Extensions" to use guided forms for `x-fbp-props` and `x-fbp-params` (including `repoMethods`, `endPoints`, `generatePersistenceLayer`, etc.). *Note: API `paths` are derived from `endPoints` by downstream tooling, not defined manually here.*
    *   Preview and apply extensions to merge them into the main YAML editor.
    *   Repeat for all necessary schemas.
4.  **Define Entity Specifications (Optional):**
    *   Set `generatePersistenceLayer: true` in a schema's `x-fbp-params` extensions OR use the "Add Standalone Entity" button.
    *   Fill the Entity details form: `entityName`, optional `tableName`, field details (`columnName`, mandatory `domainDataType` from predefined list, primary key settings, nullability).
    *   Define relationships (`@OneToOne`, etc.) to other entities defined *within the current session*.
    *   Save the Entity Specification. It will be stored as `<EntityName>.entity.json`.
    *   Repeat for all necessary entities.
5.  **Review:** Navigate to the "Review" screen. Check the final OpenAPI YAML, the list of Entity JSON definitions, target repository, branch name, and commit message.
6.  **Submit:** Click "Submit". The tool will:
    *   Create the feature branch in the target repository.
    *   Commit the `.yaml` and `.entity.json` files.
    *   Create a Pull Request against the `develop` branch.
    *   Display success or provide clear error messages if any Git operation fails.

## Future Considerations (Post-MVP)

*   Editing capabilities on the Review screen.
*   Enhanced error handling and recovery.
*   Support for user-specific Git tokens.
*   Customizable branch names, commit messages, and target branches.
*   Advanced entity features (composite keys, inheritance).
*   Import/Export functionality.
*   Stricter validation within the UI.
