Okay, let's break this down into a detailed blueprint, then iterative chunks, smaller steps, and finally, the LLM prompts.

## Phase 1: Blueprint & Planning

### 1. Detailed Blueprint

1.  **Project Setup:**
    *   Create a new Backstage frontend plugin using `@backstage/create-plugin`.
    *   Define basic plugin structure (Plugin ID, Routes, Navigation Item).
    *   Install necessary dependencies (`js-yaml`, Monaco/CodeMirror wrapper, potentially state management lib like Zustand).
2.  **Configuration:**
    *   Define config schema in `plugin.json` or similar for `listDomainDataTypes`.
    *   Access config using `useApi(configApiRef)`.
    *   Plan for backend configuration of GitHub token (secure handling is key).
3.  **Core UI Structure:**
    *   Create main plugin component (`ExampleComponent.tsx`).
    *   Implement multi-step UI flow (e.g., using conditional rendering or simple routing within the plugin page):
        *   Step 1: Initial Setup (Feature Name, Description, Microservice Selection).
        *   Step 2: Specification Editor (OpenAPI, Entity sections).
        *   Step 3: Review & Submit.
    *   Use Backstage components (`Page`, `Header`, `Content`, `InfoCard`, `Progress`, `Select`, `Input`, `Button`, `ResponseErrorPanel`).
4.  **Initial Setup UI (Step 1):**
    *   Fetch Microservice components (`kind: Component`, `spec.type: "Platform Component"`) using `catalogApiRef`.
    *   Implement dropdown/select component populated with fetched services.
    *   Implement input fields for Feature Name and Description.
    *   Store selections/inputs in component state (`useState`).
    *   Implement validation (required fields).
    *   Implement navigation to Step 2 upon completion.
5.  **Specification Editor UI (Step 2):**
    *   Layout: Panels for OpenAPI and Entities.
    *   OpenAPI Panel:
        *   Integrate Monaco Editor (or CodeMirror) component, configured for YAML.
        *   Pre-populate with basic template (Appendix A), injecting Feature Name/Desc from Step 1.
        *   Store YAML content in state.
        *   "Add Schema" button.
    *   Entity Panel:
        *   "Add Standalone Entity" button.
        *   Placeholder area for listing defined entities (linked or standalone).
        *   Buttons to trigger Entity/Vendor Extension forms.
    *   State Management: Track OpenAPI YAML content, list of defined schema names, list of defined entity specifications (structure TBD, likely array of objects).
6.  **Entity Definition Logic & Form:**
    *   Create a reusable Entity Form component (likely a Modal or dedicated section).
    *   Form Fields: `entityName`, `tableName`, Fields table (`fieldName`, `columnName`, `domainDataType` dropdown, `isPrimaryKey`, `pkStrategy`, `isNullable`), Relationships table (`fieldName`, `targetEntity` dropdown, `relationshipType`, `mappedBy`, etc.).
    *   Populate `domainDataType` dropdown from config.
    *   Populate `targetEntity` dropdown based on other entities currently defined in the plugin's state.
    *   Handle state within the form.
    *   On "Save": Validate inputs, update the main plugin state (the list of defined entity specs). Structure defined in Spec 4.2.
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
    *   Derive and display Target Repository URL (from selected component annotations), Branch Name, Commit Message.
    *   "Submit" button.
9.  **Backend Proxy for GitHub & Logging:**
    *   **(Requires Backend Changes)** Define and implement backend endpoint(s):
        *   Endpoint 1 (e.g., `/api/proxy/github-feature-creator`): Handles secure GitHub interaction. Takes repo owner, repo name, feature name, description, user identity, YAML content, entity JSON map. Uses configured Service Account Token. Performs:
            *   Get `develop` branch SHA.
            *   Create feature branch `refs/heads/feature/<feature-name>`.
            *   Create Blobs/Tree/Commit with all spec files (`<feature-name>.yaml`, `<EntityName>.entity.json`...).
            *   Update feature branch ref.
            *   Create Pull Request against `develop`.
            *   Returns PR URL or structured error.
        *   Endpoint 2 (e.g., `/api/proxy/feature-creator-logger`): Handles logging. Takes metadata (user ID, microservice ref, feature name, schema names, entity names, PR URL). Inserts into the custom DB table.
    *   Ensure token security and proper error handling/propagation from GitHub API.
10. **Submit Logic (Frontend):**
    *   On "Submit" click:
        *   Fetch user identity using `identityApiRef`.
        *   Get repository details from selected component's annotations (e.g., `github.com/project-slug`). Parse owner/repo.
        *   Construct payload for Backend Endpoint 1 (repo info, feature details, user ID, YAML string, map of entity names to JSON strings).
        *   Call Endpoint 1 using `fetchApiRef` or similar.
        *   Handle response: Show loading state, display success (with PR link) or error message (`ResponseErrorPanel`).
        *   On success: Construct payload for Backend Endpoint 2 (logging metadata). Call Endpoint 2. Handle its response (usually just log errors).
11. **Error Handling & State Management:**
    *   Implement robust error handling for all API calls (Backstage, Backend Proxy).
    *   Use Material UI components for user feedback (`Alert`, `Snackbar`).
    *   Choose appropriate state management (React Hooks, Context, Zustand) based on complexity as it evolves. Ensure state updates are clean and predictable.
12. **Testing:**
    *   Unit Tests (Jest/RTL) for components, forms, validation, utility functions (YAML parsing/updating). Mock APIs (`useApi`, `fetchApiRef`).
    *   Integration Tests (RTL) for component interactions and state flow.
    *   E2E Tests (Cypress/Playwright) for the full user journey (mocking backend endpoints).

### 2. Iterative Chunks (High-Level)

1.  **Chunk 1: Foundation & Setup UI:** Plugin boilerplate, routing, config access (domain types), basic layout, Step 1 UI (Component fetch/select, text inputs), basic state, navigation to next step placeholder.
2.  **Chunk 2: Basic OpenAPI Editor:** Integrate code editor for YAML, display template, basic state update.
3.  **Chunk 3: Standalone Entity Definition:** Add button, basic entity state tracking, Entity Form UI (no relationships yet), save basic entity data (log JSON), populate domain types.
4.  **Chunk 4: Review Screen & Core Data Flow:** Display current YAML & entity JSONs (basic structure) on Review screen. Prepare data for submission (gather state).
5.  **Chunk 5: Backend Proxy & Frontend Submission:** **(Requires Backend Dev)** Implement backend endpoint for GitHub actions. Implement frontend "Submit" logic to call the proxy, handle success/error (displaying mock PR URL or error). Fetch user identity.
6.  **Chunk 6: Entity Relationships & Linking:** Enhance Entity Form with relationships section. Populate target entity dropdown. Update entity JSON generation. Implement logic to link entity creation to `generatePersistenceLayer` flag (requires Vendor Extensions work).
7.  **Chunk 7: Vendor Extensions:** Implement Vendor Extension form UI. Implement YAML parsing -> form population. Implement form data -> YAML update logic. Handle `generatePersistenceLayer` interaction.
8.  **Chunk 8: Logging:** **(Requires Backend Dev)** Implement backend endpoint for logging. Call logging endpoint from frontend on successful PR creation.
9.  **Chunk 9: Polish & Testing:** Refine UI, improve error handling across the board, add comprehensive tests (Unit, Integration, E2E setup).

### 3. Smaller Steps (Detailed Iteration)

*   **Step 1: Plugin Boilerplate:** Create plugin `openapi-entity-spec-creator`. Set up basic `plugin.ts`, `index.ts`, `routes.ts`. Add a route `/create-spec`. Create `ExampleComponent.tsx` with basic "Hello World" content. Add to `packages/app/src/App.tsx` and sidebar.
*   **Step 2: Basic Layout & Config:** Use `Page`, `Header`, `Content` in `ExampleComponent`. Add `configApiRef` dependency. Fetch and log `listDomainDataTypes` from config on component mount. (Test: Check console log).
*   **Step 3: Fetch & Select Microservice:** Use `catalogApiRef`. Fetch `Component` entities filtered by `spec.type: "Platform Component"`. Display names in a Backstage `Select` component. Store selected component entity in state. Add basic `InfoCard` for this step. (Test: Verify dropdown populates, selection updates state).
*   **Step 4: Initial Info Form:** Add `Input` components for "Feature Name" and "Description". Store values in state. Add a "Next" button, disabled until MS selected and fields filled. (Test: Verify inputs update state, button enables correctly).
*   **Step 5: Step Navigation & State Passing:** Implement simple state machine/conditional rendering for steps (Setup -> Editor -> Review). Pass selected component, feature name, description to the Editor step.
*   **Step 6: Basic Editor Layout:** Create `EditorComponent.tsx`. Display Feature Name. Add placeholders/`InfoCard`s for "OpenAPI Spec" and "Entity Specifications".
*   **Step 7: Basic YAML Display:** In `EditorComponent`, add a simple `textarea`. Populate it with the basic OpenAPI template (Appendix A), inserting Feature Name/Desc. Store YAML string in state using `useState`. (Test: Verify template renders, state updates on textarea change).
*   **Step 8: Integrate Code Editor:** Replace `textarea` with Monaco Editor (using `@monaco-editor/react` or similar Backstage wrapper if available). Configure for YAML language. Ensure state updates correctly on editor changes (debounced if needed). (Test: Verify editor loads, YAML highlighting works, state reflects edits).
*   **Step 9: Add Standalone Entity Button & State:** Add "Add Standalone Entity" button. On click, prompt for entity name (simple `prompt()` or basic modal). Add entity name to an array in state `const [entities, setEntities] = useState<{name: string, spec: any}[]>([])`. Display the list of entity names below the button. (Test: Verify button adds names to list/state).
*   **Step 10: Entity Form Component Shell:** Create `EntityForm.tsx` component (receives `onSubmit`, `onCancel`, `domainTypes`, `existingEntityNames` props). Layout the form fields as specified (Spec 3.4, initially no relationship section). Use Material UI components. Include "Save" and "Cancel" buttons. (Test: Render the form shell).
*   **Step 11: Open Entity Form Modal:** Use Material UI `Modal` or `Dialog`. Add an "Edit" button next to each entity name in the list (Step 9). Clicking it opens the `EntityForm` modal. Pass required props (initially empty spec, domain types, other entity names). (Test: Verify modal opens/closes).
*   **Step 12: Populate Domain Types:** Pass the `domainTypes` array (fetched in Step 2) to `EntityForm`. Populate the `domainDataType` `Select` dropdown within the "Fields" section. (Test: Verify dropdown has correct options).
*   **Step 13: Basic Entity Form State & Save:** Implement state management *within* `EntityForm` for its fields (entity name, table name, fields array). On "Save", call the `onSubmit` prop function, passing the structured entity data (matching Spec 4.2, fields only for now). Update the main plugin state (`entities` array) with the saved spec. (Test: Add/edit fields, save, verify main state updates correctly. Log the generated JSON structure).
*   **Step 14: Review Screen Shell & Data Pass:** Create `ReviewComponent.tsx`. Implement navigation from Editor to Review. Pass the final YAML string state and the `entities` array state to it.
*   **Step 15: Display Specs on Review:** In `ReviewComponent`, use the read-only Monaco editor to display the YAML. Iterate through the `entities` array and display each `entity.spec` object formatted as JSON (e.g., in `<pre>` tags or a JSON viewer component). Display other info (Feature Name, MS Name). (Test: Verify YAML and entity JSONs are displayed correctly).
*   **Step 16: **(Backend Task)** Implement Backend Proxy Endpoint 1 (GitHub): Create the backend API endpoint `/api/proxy/github-feature-creator`. Use `createRouter` from `@backstage/backend-common`. Inject `ScmIntegrations` and `Config`. Read GitHub token securely. Implement logic using `Octokit` or GitHub `UrlReader` integrations to: get `develop` SHA, create branch, create commit (handle multiple files: one YAML, multiple JSONs), create PR. Return PR URL or error. Add basic logging. *Requires careful testing.*
*   **Step 17: Add Submit Button & Fetch Identity:** Add "Submit" button to `ReviewComponent`. In its handler, use `identityApiRef` to get the user's identity (`userEntityRef` or display name). (Test: Log user identity on click).
*   **Step 18: Call Backend Proxy:** In the Submit handler, gather all necessary data: repo owner/name (parse from selected component annotation `github.com/project-slug`), feature name, desc, user ID, YAML string, map of entity names to entity spec JSON strings (`Object.fromEntries(entities.map(e => [\`${e.name}.entity.json\`, JSON.stringify(e.spec, null, 2)]))`). Use `fetchApiRef` to POST this payload to the backend endpoint (Step 16). (Test: Mock `fetchApiRef`, verify correct payload is sent).
*   **Step 19: Handle Submission Response:** Add loading state (`useState`). Handle the promise from `fetchApiRef`. On success, parse the PR URL from the response and display a success message (`Alert`) with a link. On error, display the error using `ResponseErrorPanel` or `Alert`. (Test: Mock successful and error responses from `fetchApiRef`, verify UI updates).
*   **Step 20: Add Relationships to Entity Form:** Add the "Relationships" section table/list to `EntityForm.tsx`. Populate the `targetEntity` dropdown with `existingEntityNames` prop (excluding the current entity). Implement state for relationships. (Test: Add/remove relationship rows, select target entity).
*   **Step 21: Update Entity JSON with Relationships:** Modify the "Save" logic in `EntityForm` (Step 13) to include the `relationships` array in the generated spec object, matching Spec 4.2. Update the main `entities` state accordingly. (Test: Save entity with relationships, verify structure in Review screen).
*   **Step 22: Add Schema Button & State:** In `EditorComponent`, add "Add Schema" button near the OpenAPI editor. On click, prompt for schema name. Add schema name to a state array `const [schemaNames, setSchemaNames] = useState<string[]>([])`. Add a placeholder schema definition to the YAML editor state (e.g., `schemaName: { type: object, properties: {} }`). (Test: Add schema, verify name list updates, verify YAML updates).
*   **Step 23: Vendor Extension Form Shell & Trigger:** Create `VendorExtensionForm.tsx`. Add "Prepare Vendor Extensions" button next to each schema name (similar to entities). Clicking opens the form modal, passing the `schemaName` and the current `yamlContent` state. (Test: Verify modal opens).
*   **Step 24: Parse YAML & Populate Basic Extensions:** In `VendorExtensionForm`, on open, use `js-yaml` to parse `yamlContent`. Locate `components.schemas[schemaName]`. Populate basic form fields (e.g., inputs for `x-fbp-props.businessName` for each property found). Add the `generatePersistenceLayer` checkbox based on `x-fbp-params.generatePersistenceLayer`. Handle parsing errors. (Test: Open form for a schema, verify basic fields populate based on mock YAML).
*   **Step 25: Apply Basic Extensions:** Implement "Apply" button logic in `VendorExtensionForm`. Take form data, construct basic `x-fbp-props` and `x-fbp-params` (just `generatePersistenceLayer` for now). Parse `yamlContent` *again*, find the schema, *replace* its `x-fbp-*` keys with the new structure. Stringify back to YAML. Update the main `yamlContent` state via a callback prop. Close modal. (Test: Change business name/toggle flag, apply, verify main YAML state updates).
*   **Step 26: Link `generatePersistenceLayer` to Entity:** Modify "Apply" logic (Step 25): If `generatePersistenceLayer` is checked *and* an entity for this schema doesn't exist yet, trigger the logic to add a *linked* entity (similar to Step 9, but mark it as linked and potentially pre-populate). Modify `EntityForm` (Step 11/13) to handle linked entities (e.g., disable name editing, pre-populate fields based on schema properties parsed from YAML). *This gets complex - careful state management needed.* (Test: Check flag, apply, verify linked entity appears; open its form, verify pre-population).
*   **Step 27: Implement Full Vendor Extension Form:** Flesh out `VendorExtensionForm` with all fields from Spec 3.3 (arrays for `repoMethods`, `endPoints`, etc.). Implement state and UI for adding/removing items in these arrays.
*   **Step 28: Implement Full Vendor Extension Apply Logic:** Enhance Step 25's "Apply" logic to handle the full `x-fbp-*` structure, including arrays and nested objects. This requires careful YAML object manipulation before stringifying.
*   **Step 29: **(Backend Task)** Implement Backend Logging Endpoint 2: Create `/api/proxy/feature-creator-logger`. Accept POSTed metadata. Insert into the pre-defined custom DB table. Handle DB errors.
*   **Step 30: Call Logging Endpoint:** In the frontend Submit success handler (Step 19), *after* getting the PR URL, construct the logging payload and POST it to the logging endpoint (Step 29). Log any errors from this call to the console but don't block the user UI.
*   **Step 31: Input Validation:** Add proper validation (required, format) to all forms (Setup, Entity, Vendor Extensions) using standard React techniques or a library. Show inline error messages. Disable Save/Apply/Submit buttons if invalid.
*   **Step 32: Add Unit Tests:** Write Jest/RTL tests for `EntityForm` state and validation, Vendor Extension parsing/updating utilities, form components rendering. Mock Backstage APIs.
*   **Step 33: Add Integration Tests:** Write RTL tests for the flow: Setup -> Editor (add entity) -> Review -> Submit (mocking fetch). Test state updates across steps.
*   **Step 34: Refine UI & UX:** Add loading indicators (`Progress`), finalize styling, improve user messages, ensure accessibility.
*   **Step 35: E2E Test Setup:** Configure Cypress/Playwright. Write basic E2E test for the happy path, mocking the backend proxy endpoints.

This detailed breakdown provides a clear path, starting simple and adding complexity incrementally.

## Phase 2: LLM Prompts

Here are the prompts, designed to be used sequentially. Each prompt assumes the context of the previous steps.

---

```text
Prompt 1:

Goal: Set up the basic Backstage frontend plugin boilerplate and initial structure.

Context: We are starting a new Backstage plugin called `openapi-entity-spec-creator`.

Request:
1. Generate the command to create a new Backstage frontend plugin with the ID `openapi-entity-spec-creator`.
2. Create the initial plugin files (`plugins/openapi-entity-spec-creator/src/plugin.ts`, `index.ts`, `routes.ts`).
3. Define a route path `/create-spec` in `routes.ts`.
4. Create a basic React component `plugins/openapi-entity-spec-creator/src/components/ExampleComponent/ExampleComponent.tsx`. It should render a Backstage `Page` with a `Header` title "OpenAPI & Entity Specification Creator" and `Content` containing the text "Plugin Content Area".
5. Export the component and plugin setup.
6. Show how to add this plugin's page to `packages/app/src/App.tsx` routes and potentially add a `SidebarItem` for navigation in `packages/app/src/components/Root/Root.tsx`.
```

---

```text
Prompt 2:

Goal: Implement the basic layout for the multi-step UI and fetch configuration data.

Context: We have the basic plugin boilerplate (`plugins/openapi-entity-spec-creator`) with `ExampleComponent.tsx` rendering a simple page.

Request:
1. Modify `ExampleComponent.tsx`.
2. Import necessary Backstage components: `Page`, `Header`, `Content`, `InfoCard`, `Progress`.
3. Import and use `configApiRef` with `useApi`.
4. Define a state variable `domainTypes` (initially empty array) using `useState`.
5. In a `useEffect` hook, fetch the configuration value `plugin.openapiEntitySpecCreator.listDomainDataTypes` (assuming this path in `app-config.yaml`). Store the result in the `domainTypes` state. Log the fetched types to the console for verification. Handle potential loading/error states minimally for now (e.g., display `<Progress/>` while loading).
6. Use `useState` to manage the current step, defaulting to 'setup'. `const [step, setStep] = useState<'setup' | 'editor' | 'review'>('setup');`
7. Modify the render logic to conditionally render different content based on the `step` state. For now, just render different text placeholders inside the `Content` for 'setup', 'editor', and 'review' steps.
8. Render the `Header` with the title "Step 1: Initial Setup" when `step` is 'setup'.
```

---

```text
Prompt 3:

Goal: Implement the "Initial Setup" step UI to fetch and select a Microservice Component.

Context: `ExampleComponent.tsx` now has basic step navigation state and fetches domain types from config. It conditionally renders placeholders based on the current step ('setup', 'editor', 'review').

Request:
1. Modify `ExampleComponent.tsx` within the `step === 'setup'` conditional rendering block.
2. Import and use `catalogApiRef`.
3. Use `useState` to store the list of fetched components (`fetchedComponents`), the selected component entity (`selectedComponent`), and any loading/error state for the fetch.
4. In a `useEffect` hook (run only when `step` is 'setup'), use the `catalogApiRef` to fetch entities of `kind: Component` with `spec.type: "Platform Component"`. Use the `filter` parameter for this. Store the results in `fetchedComponents`. Handle loading and errors (use `Progress` and `ResponseErrorPanel`).
5. Import and render the Backstage `Select` component.
    *   Populate its items using the `fetchedComponents` state. The `value` for each item should be its entity ref (`metadata.uid` or `metadata.name`), and the `label` should be its `metadata.name`.
    *   Include a placeholder item like "Select Microservice...".
    *   When an item is selected, update the `selectedComponent` state with the full entity object corresponding to the selection.
6. Display the `Select` component within an `InfoCard` titled "Select Target Microservice".
7. Add a basic Jest/RTL test file (`ExampleComponent.test.tsx`) that mocks `configApiRef` and `catalogApiRef`. Write a test case that verifies the component renders, attempts to fetch components, and displays the `Select` component when the mocked API returns sample component data.
```

---

```text
Prompt 4:

Goal: Add form inputs for Feature Name and Description in the "Initial Setup" step and a "Next" button.

Context: `ExampleComponent.tsx` in the 'setup' step now fetches and displays a `Select` dropdown for microservices. The selected component entity is stored in state (`selectedComponent`).

Request:
1. Modify `ExampleComponent.tsx` within the `step === 'setup'` conditional rendering block.
2. Add two state variables using `useState`: `featureName` (string, default '') and `featureDescription` (string, default '').
3. Add an `InfoCard` below the microservice selection card.
4. Inside this new card, add two Backstage `Input` components:
    *   One for "Feature Name" linked to the `featureName` state. Make it required.
    *   One for "Description" (multiline optional) linked to the `featureDescription` state. Make it required.
5. Add a `Button` component labeled "Start Defining Specs".
    *   The button should be disabled if `selectedComponent` is null/undefined OR `featureName` is empty OR `featureDescription` is empty.
    *   On click, the button should change the step state to `'editor'` (using `setStep('editor')`).
6. Update the Jest/RTL test file (`ExampleComponent.test.tsx`):
    *   Add tests to verify the Input fields render and update their respective state variables.
    *   Add tests to verify the "Start Defining Specs" button is initially disabled and becomes enabled only when a component is selected and both required fields are filled.
    *   Add a test to verify clicking the enabled button changes the step state (mock `setStep` or check rendered output).
```

---

```text
Prompt 5:

Goal: Create the basic layout for the "Specification Editor" step and pass necessary data to it.

Context: `ExampleComponent.tsx` now handles the 'setup' step, collecting microservice, feature name, and description. Clicking "Start Defining Specs" changes the step state to 'editor'.

Request:
1. Create a new component file: `plugins/openapi-entity-spec-creator/src/components/EditorComponent/EditorComponent.tsx`.
2. Define props for `EditorComponent`: `featureName: string`, `featureDescription: string`, `selectedComponentName: string`.
3. In `EditorComponent`, render a basic layout using `Grid` (from Material UI) or similar to create two main panels/areas.
    *   Left Panel: Placeholder `InfoCard` titled "OpenAPI Specification". Add text "OpenAPI Editor will go here."
    *   Right Panel: Placeholder `InfoCard` titled "Entity Specifications". Add text "Entity definitions will go here."
4. Display the received `featureName` prominently above the panels (e.g., using `Typography` h4).
5. In `ExampleComponent.tsx`, when `step === 'editor'`, render `<EditorComponent />`. Pass the `featureName`, `featureDescription`, and `selectedComponent.metadata.name` state variables as props.
6. Update the Jest/RTL test for `ExampleComponent.tsx` to verify that when the step changes to 'editor', the `EditorComponent` is rendered with the correct props.
7. Create a basic test file `EditorComponent.test.tsx` that verifies the component renders its title and placeholder cards correctly given the props.
```

---

```text
Prompt 6:

Goal: Integrate the Monaco code editor for displaying and editing the OpenAPI YAML spec.

Context: `EditorComponent.tsx` has placeholders for OpenAPI and Entity specs.

Request:
1. Install the Monaco Editor React wrapper: `yarn add @monaco-editor/react`. Also install `js-yaml` and its types: `yarn add js-yaml @types/js-yaml`.
2. Modify `EditorComponent.tsx`.
3. Add state for the YAML content: `const [yamlContent, setYamlContent] = useState('');`.
4. Import `Editor` from `@monaco-editor/react` and `yaml` from `js-yaml`.
5. In a `useEffect` hook that runs when `featureName` or `featureDescription` props change, generate the initial OpenAPI YAML template string (using Appendix A from the spec) and populate the `info.title` and `info.description` fields using `js-yaml` (parse the template, modify, stringify). Set this initial content using `setYamlContent`.
6. Replace the "OpenAPI Editor will go here" placeholder text in the left panel `InfoCard` with the Monaco `Editor` component.
    *   Set its `height` (e.g., "60vh").
    *   Set `language="yaml"`.
    *   Set `value={yamlContent}`.
    *   Set the `onChange` handler to update the `yamlContent` state (`setYamlContent(newValue || '')`). Consider debouncing this update if performance becomes an issue later.
7. Update `EditorComponent.test.tsx` to:
    *   Mock the `@monaco-editor/react` component.
    *   Verify the initial YAML content is generated correctly based on props and set in the mocked editor's `value`.
    *   Verify the `onChange` handler updates the component's state.
```

---

```text
Prompt 7:

Goal: Add the ability to define standalone entities by adding a button and tracking entity names in state.

Context: `EditorComponent.tsx` now displays an interactive YAML editor for the OpenAPI spec.

Request:
1. Modify `EditorComponent.tsx`.
2. Add state to track defined entities: `const [entities, setEntities] = useState<{ name: string; spec: any }[]>([]);`. The `spec` will hold the JSON structure later.
3. In the right panel ("Entity Specifications" `InfoCard`), add a `Button` labeled "Add Standalone Entity".
4. Add an `onClick` handler to this button:
    *   Use a simple `prompt()` to ask the user for the "Entity Name".
    *   If the user provides a name and doesn't cancel:
        *   Check if an entity with that name already exists in the `entities` state. If so, show an alert/notification (console.log for now) and do nothing.
        *   If the name is unique, add a new object `{ name: entityName, spec: null }` to the `entities` array using `setEntities`.
5. Below the button, render a list (e.g., Material UI `List` and `ListItem`) displaying the `name` of each entity currently in the `entities` state.
6. Update `EditorComponent.test.tsx`:
    *   Mock the `prompt`.
    *   Verify clicking the "Add Standalone Entity" button updates the `entities` state when a unique name is provided.
    *   Verify the list of entity names renders correctly based on the `entities` state.
    *   Verify it prevents adding duplicate names.
```

---

```text
Prompt 8:

Goal: Create the reusable Entity Form component UI shell.

Context: `EditorComponent.tsx` allows adding entity names to state and displays them. We need a form to define the details.

Request:
1. Create a new component file: `plugins/openapi-entity-spec-creator/src/components/EntityForm/EntityForm.tsx`.
2. Define props for `EntityForm`:
    *   `open: boolean;`
    *   `entityNameInitial?: string;` (for pre-filling name, potentially read-only later)
    *   `isNameEditable?: boolean;` (default true)
    *   `domainTypes: string[];`
    *   `existingEntityNames: string[];` (for relationship target dropdown later)
    *   `initialSpec?: any;` (to pre-populate form if editing)
    *   `onSubmit: (spec: any) => void;`
    *   `onCancel: () => void;`
3. Import Material UI components (`Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `TextField`, `Grid`, `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, `TableRow`, `Paper`, `IconButton`, `Select`, `MenuItem`, `FormControlLabel`, `Checkbox`, `FormControl`, `InputLabel`). Use `Add` and `Delete` icons.
4. Implement the component structure using `Dialog` controlled by the `open` prop. Use `DialogTitle`, `DialogContent`, `DialogActions`.
5. Inside `DialogContent`, use `Grid` for layout:
    *   Row 1: `TextField` for `entityName` (use `entityNameInitial`, respect `isNameEditable`). `TextField` for `tableName` (optional).
    *   Row 2: "Fields" section using `TableContainer`, `Table`, etc.
        *   Columns: Field Name, Column Name, Domain Data Type (`Select`), Is PK (`Checkbox`), PK Strategy (`Select`, initially disabled), Is Nullable (`Checkbox`), Actions (`IconButton` with Delete icon).
        *   Add an "Add Field" `Button` below the table.
    *   Row 3: "Relationships" section placeholder (just a `Typography` title for now). Add an "Add Relationship" `Button`.
6. Inside `DialogActions`, add "Cancel" (`Button` calling `onCancel`) and "Save Entity Spec" (`Button` - logic TBD).
7. Create a basic test file `EntityForm.test.tsx` that verifies the component renders correctly with its fields when `open` is true, and that the Cancel button calls `onCancel`. Pass mock props.
```

---

```text
Prompt 9:

Goal: Wire up the Entity Form modal to open and populate the Domain Data Type dropdown.

Context: We have the `EntityForm.tsx` shell and `EditorComponent.tsx` which lists entity names.

Request:
1. Modify `EditorComponent.tsx`:
    *   Add state to control the modal's visibility and context:
        ```typescript
        const [isEntityFormOpen, setIsEntityFormOpen] = useState(false);
        const [editingEntityName, setEditingEntityName] = useState<string | undefined>(undefined);
        ```
    *   Modify the list item rendering (Step 7) for each entity name: add an "Edit" `IconButton` next to each name.
    *   When the "Edit" button is clicked, set `setEditingEntityName(entity.name)` and `setIsEntityFormOpen(true)`.
    *   When the "Add Standalone Entity" button (Step 7) is clicked successfully (after getting a unique name), *also* set `setEditingEntityName(newEntityName)` and `setIsEntityFormOpen(true)`. This way, the form opens immediately for the new entity.
    *   Find the entity spec being edited: `const currentSpec = entities.find(e => e.name === editingEntityName)?.spec;`
    *   Render the `<EntityForm />` component at the bottom of `EditorComponent`. Pass the required props:
        *   `open={isEntityFormOpen}`
        *   `entityNameInitial={editingEntityName}`
        *   `isNameEditable={!currentSpec}` // Allow editing name only if it's a new entity (spec is null)
        *   `domainTypes={domainTypes}` // Pass the prop received by EditorComponent
        *   `existingEntityNames={entities.map(e => e.name)}`
        *   `initialSpec={currentSpec}`
        *   `onSubmit={(spec) => { /* TODO */ setIsEntityFormOpen(false); }}`
        *   `onCancel={() => setIsEntityFormOpen(false)}`
2. Modify `EntityForm.tsx`:
    *   In the "Fields" section, locate the `Select` component for "Domain Data Type".
    *   Use the `domainTypes` prop to populate its `MenuItem` options.
3. Update tests:
    *   `EditorComponent.test.tsx`: Verify clicking "Edit" or adding a new entity sets the state and renders `EntityForm` with correct props.
    *   `EntityForm.test.tsx`: Verify the Domain Data Type `Select` is populated based on the `domainTypes` prop.
```

---

```text
Prompt 10:

Goal: Implement state management within the Entity Form for fields and save the basic entity specification (fields only).

Context: The `EntityForm` modal opens, displaying initial fields and the domain type dropdown.

Request:
1. Modify `EntityForm.tsx`.
2. Add internal state using `useState` or `useReducer` to manage the form's data:
    *   `entityName` (initialized from `entityNameInitial`)
    *   `tableName` (string, default '')
    *   `fields` (array of objects, e.g., `{ id: number, fieldName: string, columnName: string, domainDataType: string, isPrimaryKey: boolean, pkStrategy: string | null, isNullable: boolean }`. Use `id` for stable keys in rendering). Initialize based on `initialSpec?.fields` if provided, otherwise empty array.
3. Implement handlers for the input fields (`TextField`, `Select`, `Checkbox`) in the "Fields" table rows to update the corresponding field object in the `fields` state array.
4. Implement the "Add Field" button logic: Add a new empty/default field object to the `fields` state array.
5. Implement the "Delete" `IconButton` logic within each field row: Remove the corresponding field object from the `fields` state array.
6. Implement the "Save Entity Spec" button's `onClick` handler:
    *   Perform basic validation (e.g., entity name required, field names required, domain type selected). Log errors to console for now.
    *   If valid, construct the entity specification object conforming to Spec 4.2 (but only including `entityName`, `tableName`, and `fields` array - transform internal state format if needed).
    *   Call the `onSubmit` prop function, passing this generated spec object.
7. Modify `EditorComponent.tsx`:
    *   Update the `onSubmit` handler passed to `EntityForm`:
        ```typescript
        onSubmit={(spec) => {
          setEntities(prev =>
            prev.map(e =>
              e.name === editingEntityName ? { ...e, spec: spec } : e
            )
          );
          setIsEntityFormOpen(false);
          setEditingEntityName(undefined); // Clear editing context
        }}
        ```
8. Update tests:
    *   `EntityForm.test.tsx`: Test adding fields, deleting fields, editing field properties, and verify the internal state updates correctly. Mock `onSubmit` and verify it's called with the correctly structured spec object (fields only) upon clicking "Save". Test basic validation prevents submission.
    *   `EditorComponent.test.tsx`: Verify that after the mocked `EntityForm` calls `onSubmit`, the main `entities` state in `EditorComponent` is updated correctly.
```

---

```text
Prompt 11:

Goal: Create the Review Screen component shell and implement navigation to display the current YAML and basic entity specs.

Context: `EditorComponent` now manages YAML content and a list of entity specifications (with fields defined via `EntityForm`).

Request:
1. Create a new component file: `plugins/openapi-entity-spec-creator/src/components/ReviewComponent/ReviewComponent.tsx`.
2. Define props for `ReviewComponent`:
    *   `featureName: string;`
    *   `featureDescription: string;`
    *   `selectedComponentName: string;`
    *   `yamlContent: string;`
    *   `entities: { name: string; spec: any }[];`
    *   `onSubmit: () => void;` // For Submit button later
    *   `onBack: () => void;` // Optional: To go back to editor
3. In `ReviewComponent`, render a layout:
    *   Display Feature Name, Description, Selected Component Name using `Typography` or `InfoCard`.
    *   Add an `InfoCard` titled "Final OpenAPI Specification (`<feature_name>.yaml`)". Inside, render the `yamlContent` prop using the Monaco `Editor` component in read-only mode (`options={{ readOnly: true }}`). Ensure appropriate height.
    *   Add an `InfoCard` titled "Entity Specifications". Inside, map through the `entities` prop array. For each entity with a defined `spec` (`entity.spec !== null`):
        *   Render `Typography` with the entity file name: `<h4>${entity.name}.entity.json</h4>`
        *   Render the `entity.spec` object as formatted JSON string within a `<pre><code>` block or using a dedicated JSON viewer component if available. Use `JSON.stringify(entity.spec, null, 2)`.
    *   Add `Button` components for "Submit" (disabled for now, calling `onSubmit`) and potentially "Back" (calling `onBack`).
4. Modify `ExampleComponent.tsx`:
    *   Add a "Review Specifications" `Button` to `EditorComponent` (e.g., at the bottom). This button should call `setStep('review')`.
    *   In `ExampleComponent`, when `step === 'review'`, render `<ReviewComponent />`. Pass the required props from the state (`featureName`, `featureDescription`, `selectedComponent.metadata.name`, `yamlContent`, `entities`). Pass `setStep` for `onBack` and a placeholder function for `onSubmit`.
5. Update tests:
    *   Create `ReviewComponent.test.tsx`. Verify it renders all passed data correctly, including the read-only editor and formatted JSON blocks. Mock the Monaco editor.
    *   Update `EditorComponent.test.tsx` to verify the "Review Specifications" button exists.
    *   Update `ExampleComponent.test.tsx` to verify clicking the review button changes the step and renders `ReviewComponent` with correct props.
```

---

```text
Prompt 12:

Goal: **(Backend Task)** Implement the backend proxy endpoint to handle the GitHub operations (branch, commit, PR).

Context: The frontend now prepares YAML and JSON data. We need a secure backend endpoint to interact with GitHub using a service account token.

Request:
**Note:** This prompt describes backend code, likely in `packages/backend/src/plugins/`.
1. Ensure the backend has access to `Config` and `ScmIntegrations` (from `@backstage/integration`) or `@octokit/rest`. Add necessary dependencies if missing.
2. Define the expected request body structure for the endpoint (e.g., `{ owner: string, repo: string, featureName: string, description: string, yamlContent: string, entityJsonMap: Record<string, string>, userId: string, baseBranch?: string }`).
3. Create a new router using `createRouter` from `@backstage/backend-common` (e.g., in `packages/backend/src/plugins/featureCreator.ts`).
4. Define a POST endpoint (e.g., `/github-feature-creator`).
5. Inside the endpoint handler:
    *   Retrieve the GitHub Service Account Token securely from backend configuration (`config.getString('integrations.github[0].token')` or similar, based on standard GitHub integration setup). Handle missing token error.
    *   Parse the request body.
    *   Initialize Octokit or use relevant `ScmIntegration` methods.
    *   Define target branch (`featureBranch = 'feature/' + featureName.toLowerCase().replace(/\s+/g, '-')`) and base branch (`baseBranch = req.body.baseBranch || 'develop'`).
    *   **GitHub API Calls Sequence:**
        a.  Get the SHA of the `baseBranch` head ref (`GET /repos/{owner}/{repo}/git/ref/heads/{baseBranch}`).
        b.  (Optional but recommended) Get the commit associated with the SHA to get the `tree.sha` (`GET /repos/{owner}/{repo}/git/commits/{sha}`).
        c.  Create the new feature branch ref pointing to the base branch SHA (`POST /repos/{owner}/{repo}/git/refs`, `ref: 'refs/heads/{featureBranch}', sha: baseBranchSha`). Handle potential branch-already-exists error (422).
        d.  Prepare file tree: Create an array of tree objects. One for the OpenAPI YAML (`<featureName>.yaml`) and one for each entity JSON file (using keys from `entityJsonMap`). The content should be the strings provided in the request body. Mode: `100644`, Type: `blob`.
        e.  Create a Tree (`POST /repos/{owner}/{repo}/git/trees`, `tree: fileTreeArray`, `base_tree: baseCommitTreeSha`). Get the new tree SHA.
        f.  Create a Commit (`POST /repos/{owner}/{repo}/git/commits`, `message: commitMessage`, `tree: newTreeSha`, `parents: [baseBranchSha]`). Get the new commit SHA.
        g.  Update the feature branch ref to point to the new commit SHA (`PATCH /repos/{owner}/{repo}/git/refs/heads/{featureBranch}`, `sha: newCommitSha`, `force: false`).
        h.  Create a Pull Request (`POST /repos/{owner}/{repo}/pulls`, `title: featureName`, `head: featureBranch`, `base: baseBranch`, `body: prBody`). Construct `prBody` from `description` and `userId`.
    *   Handle errors gracefully at each step. If any GitHub call fails, return an appropriate error status (e.g., 4xx, 5xx) with a descriptive JSON body.
    *   On success, return a 201 status with the `html_url` of the created Pull Request in the JSON body (e.g., `{ "pullRequestUrl": "..." }`).
6. Add this router to the backend service in `packages/backend/src/index.ts`. Configure the proxy path in `app-config.yaml` if necessary (e.g., under `backend.baseUrl` and `/api/proxy`).
7. **Testing:** This requires integration testing against a mock GitHub API or careful manual testing against a test repository. Unit tests can cover helper functions and request parsing.
```

---

```text
Prompt 13:

Goal: Implement the frontend "Submit" logic to call the backend proxy endpoint and handle the response.

Context: The `ReviewComponent` displays the final specs. A backend endpoint (`/api/proxy/github-feature-creator`) now exists to handle GitHub actions.

Request:
1. Modify `ReviewComponent.tsx`.
2. Add state for loading and potential submission errors:
   ```typescript
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState<Error | null>(null);
   const [pullRequestUrl, setPullRequestUrl] = useState<string | null>(null);
   ```
3. Import and use `identityApiRef` and `fetchApiRef`.
4. Locate the "Submit" button. Remove the `disabled` attribute for now. Add `disabled={isSubmitting || !!pullRequestUrl}`. Set its `onClick` handler to a new async function `handleFinalSubmit`.
5. Implement `handleFinalSubmit`:
    *   Set `setIsSubmitting(true)`, `setSubmitError(null)`, `setPullRequestUrl(null)`.
    *   Use `identityApiRef` to get the user's identity (`userEntityRef`).
    *   Get the target repository slug (e.g., `owner/repo`) from the selected component's annotations. Assume an annotation like `github.com/project-slug`. Add error handling if the annotation is missing or malformed.
    *   Construct the `entityJsonMap` from the `entities` prop: `Record<string, string>` mapping `${entity.name}.entity.json` to `JSON.stringify(entity.spec, null, 2)`. Filter out entities where `spec` is null.
    *   Construct the payload object for the backend endpoint (Step 12) including owner, repo, featureName, description, yamlContent, entityJsonMap, userId (`userEntityRef.metadata.name` or similar).
    *   Use `fetchApiRef.fetch` to POST the payload to `/api/proxy/github-feature-creator`.
    *   **Handle Response:**
        *   If `response.ok` is true: Parse the JSON body to get the `pullRequestUrl`. Set `setPullRequestUrl(url)`.
        *   If `response.ok` is false: Try to parse an error message from the response body. Create an `Error` object and set `setSubmitError(error)`.
    *   Add a `catch` block for network errors and set `setSubmitError(error)`.
    *   Finally, set `setIsSubmitting(false)`.
6. Modify the rendering logic:
    *   Show a `Progress` indicator if `isSubmitting`.
    *   If `submitError` is set, display it using `ResponseErrorPanel`.
    *   If `pullRequestUrl` is set, display a success `Alert` (from Material UI) with a message like "Successfully created Pull Request!" and include a link (`Link` component from Backstage) to the `pullRequestUrl`. Hide or disable the Submit button.
7. Update `ReviewComponent.test.tsx`:
    *   Mock `identityApiRef` and `fetchApiRef`.
    *   Test the `handleFinalSubmit` function: verify it constructs the correct payload, calls `fetchApiRef`, and updates state correctly for loading, success (showing URL), and error scenarios based on mocked responses.
```

---

*Continue with prompts for Entity Relationships (Steps 20, 21), Vendor Extensions (Steps 22-28), Logging (Steps 29, 30), Validation (Step 31), and Testing (Steps 32-35) following the same pattern: state the goal, reference context, specify changes/implementation, request tests.*