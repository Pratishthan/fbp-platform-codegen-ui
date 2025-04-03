Okay, let's break this down into a detailed blueprint, then iterative chunks, smaller steps, and finally, the LLM prompts.

## Phase 1: Blueprint & Planning

### 1. Detailed Blueprint

1.  **Project Setup:**
    *   Create a new Next.js application with TypeScript.
    *   Set up the project structure (components, pages, API routes, hooks, utils).
    *   Install necessary dependencies (`js-yaml`, Monaco Editor, Zustand for state management).
    *   Configure ESLint, Prettier, and other development tools.
2.  **Configuration:**
    *   Define configuration schema for `listDomainDataTypes` in a config file.
    *   Plan for secure handling of GitHub tokens (environment variables, secure storage).
3.  **Core UI Structure:**
    *   Create main application layout with navigation.
    *   Implement multi-step UI flow using React Router or Next.js pages:
        *   Step 1: Initial Setup (Feature Name, Description, Microservice Selection).
        *   Step 2: Specification Editor (OpenAPI, Entity sections).
        *   Step 3: Review & Submit.
    *   Use Material UI components (`Container`, `Paper`, `Typography`, `Stepper`, `Select`, `TextField`, `Button`, `Alert`).
4.  **Initial Setup UI (Step 1):**
    *   Create a form for Feature Name and Description.
    *   Implement a dropdown/select component for Microservice selection.
    *   Store selections/inputs in Zustand state.
    *   Implement validation (required fields).
    *   Implement navigation to Step 2 upon completion.
5.  **Specification Editor UI (Step 2):**
    *   Layout: Panels for OpenAPI and Entities.
    *   OpenAPI Panel:
        *   Integrate Monaco Editor component, configured for YAML.
        *   Pre-populate with basic template (Appendix A), injecting Feature Name/Desc from Step 1.
        *   Store YAML content in Zustand state.
        *   "Add Schema" button.
    *   Entity Panel:
        *   "Add Standalone Entity" button.
        *   Placeholder area for listing defined entities (linked or standalone).
        *   Buttons to trigger Entity/Vendor Extension forms.
    *   State Management: Track OpenAPI YAML content, list of defined schema names, list of defined entity specifications in Zustand store.
6.  **Entity Definition Logic & Form:**
    *   Create a reusable Entity Form component (Modal or dedicated section).
    *   Form Fields: `entityName`, `tableName`, Fields table (`fieldName`, `columnName`, `domainDataType` dropdown, `isPrimaryKey`, `pkStrategy`, `isNullable`), Relationships table (`fieldName`, `targetEntity` dropdown, `relationshipType`, `mappedBy`, etc.).
    *   Populate `domainDataType` dropdown from config.
    *   Populate `targetEntity` dropdown based on other entities currently defined in the app's state.
    *   Handle state within the form.
    *   On "Save": Validate inputs, update the main app state (the list of defined entity specs). Structure defined in Spec 4.2.
    *   Logic for linking: Trigger entity definition when `generatePersistenceLayer` is true. Pre-populate form based on schema.
7.  **Vendor Extension Logic & Form:**
    *   Create a reusable Vendor Extension Form component (Modal/Side Panel).
    *   Triggered per schema.
    *   On Open: Parse the *current* full OpenAPI YAML state using `js-yaml`. Find the relevant schema section.
    *   Dynamically generate form fields based on spec 3.3 and the parsed schema structure (properties, existing extensions).
    *   Handle state within the form.
    *   On "Apply": Validate inputs, reconstruct the `x-fbp-*` structure, parse the *current* YAML state again, find the schema, *carefully* merge/replace the `x-fbp-*` extensions, stringify back to YAML, and update the main YAML state. Handle YAML parsing/modification errors.
8.  **Review Screen UI (Step 3):**
    *   Display read-only Feature Name, Description, Selected Microservice.
    *   Display read-only final OpenAPI YAML (using editor component).
    *   Display formatted JSON for each defined Entity Spec.
    *   Derive and display Target Repository URL (from selected component), Branch Name, Commit Message.
    *   "Submit" button.
9.  **Backend API for GitHub & Logging:**
    *   Create Next.js API routes or Express endpoints:
        *   Endpoint 1 (e.g., `/api/github-feature-creator`): Handles secure GitHub interaction. Takes repo owner, repo name, feature name, description, user identity, YAML content, entity JSON map. Uses configured Service Account Token. Performs:
            *   Get `develop` branch SHA.
            *   Create feature branch `refs/heads/feature/<feature-name>`.
            *   Create Blobs/Tree/Commit with all spec files (`<feature-name>.yaml`, `<EntityName>.entity.json`...).
            *   Update feature branch ref.
            *   Create Pull Request against `develop`.
            *   Returns PR URL or structured error.
        *   Endpoint 2 (e.g., `/api/feature-creator-logger`): Handles logging. Takes metadata (user ID, microservice ref, feature name, schema names, entity names, PR URL). Inserts into the custom DB table.
    *   Ensure token security and proper error handling/propagation from GitHub API.
10. **Submit Logic (Frontend):**
    *   On "Submit" click:
        *   Get user identity from authentication context.
        *   Get repository details from selected component. Parse owner/repo.
        *   Construct payload for Backend Endpoint 1 (repo info, feature details, user ID, YAML string, map of entity names to JSON strings).
        *   Call Endpoint 1 using fetch or axios.
        *   Handle response: Show loading state, display success (with PR link) or error message (`Alert`).
        *   On success: Construct payload for Backend Endpoint 2 (logging metadata). Call Endpoint 2. Handle its response (usually just log errors).
11. **Error Handling & State Management:**
    *   Implement robust error handling for all API calls.
    *   Use Material UI components for user feedback (`Alert`, `Snackbar`).
    *   Use Zustand for state management. Ensure state updates are clean and predictable.
12. **Testing:**
    *   Unit Tests (Jest/React Testing Library) for components, forms, validation, utility functions (YAML parsing/updating).
    *   Integration Tests for component interactions and state flow.
    *   E2E Tests (Cypress/Playwright) for the full user journey (mocking backend endpoints).

### 2. Iterative Chunks (High-Level)

1.  **Chunk 1: Foundation & Setup UI:** Next.js app setup, routing, config access (domain types), basic layout, Step 1 UI (form inputs), basic state, navigation to next step placeholder.
2.  **Chunk 2: Basic OpenAPI Editor:** Integrate code editor for YAML, display template, basic state update.
3.  **Chunk 3: Standalone Entity Definition:** Add button, basic entity state tracking, Entity Form UI (no relationships yet), save basic entity data (log JSON), populate domain types.
4.  **Chunk 4: Review Screen & Core Data Flow:** Display current YAML & entity JSONs (basic structure) on Review screen. Prepare data for submission (gather state).
5.  **Chunk 5: Backend API & Frontend Submission:** Implement backend API for GitHub actions. Implement frontend "Submit" logic to call the API, handle success/error (displaying mock PR URL or error). Get user identity.
6.  **Chunk 6: Entity Relationships & Linking:** Enhance Entity Form with relationships section. Populate target entity dropdown. Update entity JSON generation. Implement logic to link entity creation to `generatePersistenceLayer` flag (requires Vendor Extensions work).
7.  **Chunk 7: Vendor Extensions:** Implement Vendor Extension form UI. Implement YAML parsing -> form population. Implement form data -> YAML update logic. Handle `generatePersistenceLayer` interaction.
8.  **Chunk 8: Logging:** Implement backend API for logging. Call logging API from frontend on successful PR creation.
9.  **Chunk 9: Polish & Testing:** Refine UI, improve error handling across the board, add comprehensive tests (Unit, Integration, E2E setup).

### 3. Smaller Steps (Detailed Iteration)

*   **Step 1: Next.js App Setup:** Create a new Next.js app with TypeScript. Set up the project structure. Add ESLint and Prettier. Create basic layout components.
*   **Step 2: Basic Layout & Config:** Create the main layout with navigation. Add configuration for `listDomainDataTypes`. Create a Zustand store for app state.
*   **Step 3: Initial Setup Form:** Create a form for Feature Name and Description. Add a dropdown for Microservice selection. Implement validation and navigation to the next step.
*   **Step 4: Step Navigation & State Passing:** Implement navigation between steps (Setup -> Editor -> Review). Pass selected data between steps using Zustand state.
*   **Step 5: Basic Editor Layout:** Create the Editor page with panels for OpenAPI and Entity specifications.
*   **Step 6: Basic YAML Display:** Add Monaco Editor for YAML editing. Populate it with the basic OpenAPI template, injecting Feature Name/Desc. Store YAML string in Zustand state.
*   **Step 7: Add Standalone Entity Button & State:** Add "Add Standalone Entity" button. On click, prompt for entity name. Add entity name to an array in Zustand state. Display the list of entity names below the button.
*   **Step 8: Entity Form Component Shell:** Create a reusable Entity Form component with fields for entity name, table name, and a table for fields. Include "Save" and "Cancel" buttons.
*   **Step 9: Open Entity Form Modal:** Use Material UI `Dialog` or `Modal`. Add an "Edit" button next to each entity name in the list. Clicking it opens the `EntityForm` modal. Pass required props.
*   **Step 10: Populate Domain Types:** Pass the `domainTypes` array to `EntityForm`. Populate the `domainDataType` `Select` dropdown within the "Fields" section.
*   **Step 11: Basic Entity Form State & Save:** Implement state management *within* `EntityForm` for its fields. On "Save", update the Zustand store with the structured entity data.
*   **Step 12: Review Screen Shell & Data Pass:** Create the Review page. Display the final YAML string and the `entities` array from Zustand state.
*   **Step 13: Display Specs on Review:** In the Review page, use the read-only Monaco editor to display the YAML. Iterate through the `entities` array and display each `entity.spec` object formatted as JSON.
*   **Step 14: Backend API for GitHub:** Create a Next.js API route or Express endpoint for GitHub operations. Implement the logic to create a branch, commit files, and create a PR.
*   **Step 15: Add Submit Button & Get User Identity:** Add "Submit" button to the Review page. In its handler, get the user's identity from authentication context.
*   **Step 16: Call Backend API:** In the Submit handler, gather all necessary data and send it to the backend API. Handle the response, showing success or error messages.
*   **Step 17: Handle Submission Response:** Add loading state. Handle the promise from the API call. On success, display a success message with a link to the PR. On error, display the error using an `Alert`.
*   **Step 18: Add Relationships to Entity Form:** Add the "Relationships" section table/list to `EntityForm`. Populate the `targetEntity` dropdown with existing entity names. Implement state for relationships.
*   **Step 19: Update Entity JSON with Relationships:** Modify the "Save" logic in `EntityForm` to include the `relationships` array in the generated spec object. Update the Zustand store accordingly.
*   **Step 20: Add Schema Button & State:** Add "Add Schema" button near the OpenAPI editor. On click, prompt for schema name. Add schema name to a state array. Add a placeholder schema definition to the YAML editor state.
*   **Step 21: Vendor Extension Form Shell & Trigger:** Create `VendorExtensionForm`. Add "Prepare Vendor Extensions" button next to each schema name. Clicking opens the form modal, passing the `schemaName` and the current `yamlContent` state.
*   **Step 22: Parse YAML & Populate Basic Extensions:** In `VendorExtensionForm`, on open, use `js-yaml` to parse `yamlContent`. Locate `components.schemas[schemaName]`. Populate basic form fields.
*   **Step 23: Apply Basic Extensions:** Implement "Apply" button logic in `VendorExtensionForm`. Take form data, construct basic `x-fbp-props` and `x-fbp-params`. Parse `yamlContent` *again*, find the schema, *replace* its `x-fbp-*` keys with the new structure. Stringify back to YAML. Update the Zustand state.
*   **Step 24: Link `generatePersistenceLayer` to Entity:** Modify "Apply" logic: If `generatePersistenceLayer` is checked *and* an entity for this schema doesn't exist yet, trigger the logic to add a *linked* entity.
*   **Step 25: Implement Full Vendor Extension Form:** Flesh out `VendorExtensionForm` with all fields from Spec 3.3 (arrays for `repoMethods`, `endPoints`, etc.). Implement state and UI for adding/removing items in these arrays.
*   **Step 26: Implement Full Vendor Extension Apply Logic:** Enhance the "Apply" logic to handle the full `x-fbp-*` structure, including arrays and nested objects.
*   **Step 27: Backend API for Logging:** Create a Next.js API route or Express endpoint for logging. Accept POSTed metadata. Insert into the pre-defined custom DB table.
*   **Step 28: Call Logging API:** In the frontend Submit success handler, *after* getting the PR URL, construct the logging payload and POST it to the logging API.
*   **Step 29: Input Validation:** Add proper validation (required, format) to all forms (Setup, Entity, Vendor Extensions). Show inline error messages. Disable Save/Apply/Submit buttons if invalid.
*   **Step 30: Add Unit Tests:** Write Jest/React Testing Library tests for `EntityForm` state and validation, Vendor Extension parsing/updating utilities, form components rendering.
*   **Step 31: Add Integration Tests:** Write tests for the flow: Setup -> Editor (add entity) -> Review -> Submit (mocking API calls). Test state updates across steps.
*   **Step 32: Refine UI & UX:** Add loading indicators, finalize styling, improve user messages, ensure accessibility.
*   **Step 33: E2E Test Setup:** Configure Cypress/Playwright. Write basic E2E test for the happy path, mocking the backend API endpoints.

This detailed breakdown provides a clear path, starting simple and adding complexity incrementally.

## Phase 2: LLM Prompts

Here are the prompts, designed to be used sequentially. Each prompt assumes the context of the previous steps.

---

```text
Prompt 1:

Goal: Set up the basic Next.js application structure and initial components.

Context: We are starting a new standalone application for creating OpenAPI and Entity specifications.

Request:
1. Generate the command to create a new Next.js application with TypeScript.
2. Set up the project structure (components, pages, API routes, hooks, utils).
3. Create a basic layout component with navigation.
4. Create a Zustand store for managing application state.
5. Set up ESLint and Prettier for code quality.
6. Create a basic home page that introduces the application.
```

---

```text
Prompt 2:

Goal: Implement the basic layout for the multi-step UI and fetch configuration data.

Context: We have the basic Next.js application structure with a layout component and home page.

Request:
1. Create a configuration file for `listDomainDataTypes`.
2. Set up Zustand store to manage the current step and domain types.
3. Create a multi-step UI flow using Next.js pages or React Router:
   - Step 1: Initial Setup
   - Step 2: Specification Editor
   - Step 3: Review & Submit
4. Implement basic navigation between steps.
5. Create a form for Feature Name and Description in Step 1.
```

---

```text
Prompt 3:

Goal: Implement the "Initial Setup" step UI to select a Microservice.

Context: The application now has a multi-step UI flow with a form for Feature Name and Description.

Request:
1. Create a dropdown/select component for Microservice selection.
2. Implement validation for the form (required fields).
3. Store the form data in Zustand state.
4. Implement navigation to Step 2 upon form submission.
5. Add error handling for form validation.
```

---

```text
Prompt 4:

Goal: Create the basic layout for the "Specification Editor" step.

Context: The application now has a complete "Initial Setup" step with form validation and navigation.

Request:
1. Create the "Specification Editor" page with a two-panel layout:
   - Left Panel: OpenAPI Specification Editor
   - Right Panel: Entity Specifications
2. Integrate Monaco Editor for YAML editing in the left panel.
3. Pre-populate the editor with a basic OpenAPI template, injecting Feature Name and Description from Step 1.
4. Store the YAML content in Zustand state.
5. Add a "Review Specifications" button to navigate to Step 3.
```

---

```text
Prompt 5:

Goal: Add the ability to define standalone entities.

Context: The "Specification Editor" page now has a Monaco Editor for YAML editing.

Request:
1. Add an "Add Standalone Entity" button to the right panel.
2. Create a modal for entering the entity name.
3. Implement state management for tracking defined entities.
4. Display a list of defined entities in the right panel.
5. Add an "Edit" button next to each entity name.
```

---

```text
Prompt 6:

Goal: Create the reusable Entity Form component.

Context: The "Specification Editor" page now allows adding entity names and displays them in a list.

Request:
1. Create a reusable Entity Form component with fields for:
   - Entity Name
   - Table Name
   - Fields table (Field Name, Column Name, Domain Data Type, Is PK, PK Strategy, Is Nullable)
2. Implement state management within the form.
3. Add validation for required fields.
4. Implement "Save" and "Cancel" buttons.
5. Connect the form to the Zustand store to update entity specifications.
```

---

```text
Prompt 7:

Goal: Implement the "Review" step UI.

Context: The application now has a complete "Specification Editor" step with entity definition capabilities.

Request:
1. Create the "Review" page to display:
   - Feature Name, Description, Selected Microservice
   - Final OpenAPI YAML (read-only)
   - Entity Specifications (formatted JSON)
2. Add a "Submit" button.
3. Add a "Back" button to return to the editor.
4. Implement navigation between steps.
5. Prepare the data for submission.
```

---

```text
Prompt 8:

Goal: Create the backend API for GitHub operations.

Context: The application now has a complete UI and GitHub integration.

Request:
1. Create a Next.js API route or Express endpoint for GitHub operations.
2. Implement the logic to:
   - Get the SHA of the base branch
   - Create a new feature branch
   - Create blobs for YAML and JSON files
   - Create a tree and commit
   - Update the feature branch ref
   - Create a pull request
3. Handle errors and return appropriate responses.
4. Secure the API with authentication.
5. Add environment variables for GitHub token.
```

---

```text
Prompt 9:

Goal: Implement the frontend "Submit" logic.

Context: The application now has a backend API for GitHub operations.

Request:
1. Implement the "Submit" button handler in the Review page.
2. Get the user's identity from authentication context.
3. Construct the payload for the GitHub API.
4. Call the API and handle the response.
5. Display success or error messages.
6. Add loading state during submission.
```

---

```text
Prompt 10:

Goal: Add relationships to the Entity Form.

Context: The application now has a complete flow from setup to submission.

Request:
1. Add a "Relationships" section to the Entity Form.
2. Create a table for relationships with fields:
   - Field Name
   - Target Entity (dropdown)
   - Relationship Type
   - Mapped By
3. Implement state management for relationships.
4. Update the entity specification to include relationships.
5. Populate the Target Entity dropdown with existing entity names.
```

---

```text
Prompt 11:

Goal: Implement the Vendor Extension form.

Context: The application now supports entity relationships.

Request:
1. Create a Vendor Extension form component.
2. Implement YAML parsing to populate the form based on the schema.
3. Create form fields for all vendor extensions (x-fbp-*).
4. Implement state management within the form.
5. Implement "Apply" button logic to update the YAML with vendor extensions.
6. Handle the `generatePersistenceLayer` flag to trigger entity creation.
```

---

```text
Prompt 12:

Goal: Create the backend API for logging.

Context: The application now has a complete UI and GitHub integration.

Request:
1. Create a Next.js API route or Express endpoint for logging.
2. Implement the logic to insert metadata into a database.
3. Handle errors and return appropriate responses.
4. Secure the API with authentication.
5. Add environment variables for database connection.
```

---

```text
Prompt 13:

Goal: Call the logging API from the frontend.

Context: The application now has a backend API for logging.

Request:
1. Update the "Submit" button handler to call the logging API after successful GitHub operations.
2. Handle errors from the logging API.
3. Ensure the user experience is not affected by logging errors.
4. Add appropriate error handling and user feedback.
```

---

```text
Prompt 14:

Goal: Add comprehensive input validation.

Context: The application now has a complete flow with GitHub and logging integration.

Request:
1. Add validation to all forms (Setup, Entity, Vendor Extensions).
2. Implement inline error messages.
3. Disable buttons when forms are invalid.
4. Add validation for YAML content.
5. Ensure all required fields are filled before allowing navigation or submission.
```

---

```text
Prompt 15:

Goal: Add comprehensive testing.

Context: The application now has a complete UI and backend integration.

Request:
1. Set up Jest and React Testing Library.
2. Write unit tests for components, forms, and utility functions.
3. Write integration tests for the complete flow.
4. Set up Cypress or Playwright for E2E testing.
5. Write E2E tests for the happy path and error scenarios.
```

---

```text
Prompt 16:

Goal: Polish the UI and UX.

Context: The application now has a complete implementation with testing.

Request:
1. Refine the UI with consistent styling.
2. Add loading indicators for all async operations.
3. Improve error messages and user feedback.
4. Ensure accessibility compliance.
5. Add helpful tooltips and documentation.
6. Optimize performance.
```

This detailed plan provides a clear path for implementing the standalone application, starting with the foundation and adding features incrementally.