# PRD: Backstage OpenAPI & Entity Specification Plugin (MVP)

**Version:** 1.0 (Draft)
**Date:** 2024-08-19
**Status:** Draft

## 1. Introduction & Overview

### 1.1. Goal
To significantly improve developer productivity, enforce API design standards, and ensure code consistency across microservices by providing a Backstage plugin. This plugin facilitates an API-first workflow where developers define OpenAPI specifications and related Entity specifications directly within Backstage before implementation, automating the initial setup and spec file commitment process. The target is to reduce the time for this initial setup from approximately 1 day to under 30 minutes.

### 1.2. Problem Statement
Currently, developers manually create OpenAPI specifications, entity definitions, and associated boilerplate code (Controllers, Services, DTOs, Entities, Repositories, Mappers). This manual process is:
*   **Time-Consuming:** Takes significant developer time away from core logic implementation.
*   **Error-Prone:** Leads to inconsistencies in API design, naming conventions, and implementation patterns across different teams and services.
*   **Inconsistent:** Results in heterogeneous codebases that are harder to maintain and understand in the long run.
*   **Process Friction:** Manually placing specification files into the correct repositories/branches to trigger downstream automation is cumbersome.

### 1.3. Scope (MVP)
This document outlines the requirements for the Minimum Viable Product (MVP) of the Backstage plugin. The core focus is to provide a user interface within Backstage for developers to:
1.  Define OpenAPI specifications (YAML format), including specific vendor extensions (`x-fbp-*`).
2.  Optionally define related Entity specifications (JSON format) for persistence layers, including standalone entities.
3.  Automate the commitment of these specification files into a new feature branch in the target microservice's GitHub repository.
4.  Automate the creation of a Pull Request targeting the `develop` branch.

This plugin *initiates* the workflow; the actual code generation (Controllers, Services, Entities, etc.) is handled by existing downstream automation (e.g., Maven plugin triggered by GitHub Actions) *after* the generated PR is merged. Generation of DTOs and potential commitment to separate DTO repositories are also assumed to be handled by the downstream automation based on the committed OpenAPI spec, and are outside the scope of this plugin.

## 2. Target Audience

*   **Primary Users:** Backend Developers responsible for creating and maintaining microservices.
*   **Secondary Users:** Tech Leads (potentially for oversight, review, or initial service setup).
*   **Key Needs & Characteristics:**
    *   Familiar with core OpenAPI specification concepts.
    *   Require guidance and simplification for correctly applying specific vendor extensions (`x-fbp-*`) used internally.
    *   Need a structured way to define JPA entity metadata, including relationships and standard data types.
    *   Value clear workflows and automation to reduce repetitive tasks.
    *   Prefer direct interaction with spec code (via editor) combined with UI helpers for complex or standardized parts (extensions, entity definitions).

## 3. Functional Requirements / User Stories

### 3.1. Initial Setup & Context

*   **Story 1 (Setup):** As a Backend Developer, I want to navigate to the plugin in Backstage, initiate a "Create new feature" action, select the target microservice (filtered from the Backstage Catalog by `spec.type="Platform Component"`), and provide a Feature Name and Description on the same screen, so that the plugin is correctly configured for the target repository and the OpenAPI spec `info` section is pre-populated with relevant context.

### 3.2. OpenAPI Specification Creation

*   **Story 2 (Add Schema - Basic):** As a Backend Developer, after the initial setup, I want to be presented with an editor pre-populated with a basic OpenAPI YAML template (including `openapi`, `info` populated from setup, empty `servers`, `paths`, `components.schemas`). I want to be able to click an "Add Schema" button, provide a schema name, and define its standard OpenAPI properties (type, description, fields, etc.) in a focused editor section, so that I can define the basic structure of my data models iteratively.
*   **Story 3 (Add Schema - Extensions):** As a Backend Developer, after drafting a schema's basic structure, I want to click a "Prepare Vendor Extensions for <SchemaName>" button which parses my draft and presents structured forms (e.g., in a side panel or modal), so that I can easily define the required `x-fbp-props` (like `businessName`) for each property and the schema-level `x-fbp-params` (including `repoMethods`, `overrideMethods`, `interfaces`, `rootSchema`, `endPoints`, `behaviours`, `isModifiable`, `nonModifiableAttributes`, `generatePersistenceLayer` flag, etc.) using guided UI elements (text inputs, dropdowns, checkboxes, lists) without complex manual YAML formatting.
    *   _Note:_ The `endPoints` array captured within `x-fbp-params` provides the necessary data for the downstream tooling to generate the actual API `paths`. The developer does *not* manually define the `paths` section in the editor.
*   **Story 4 (Preview & Apply Extensions):** As a Backend Developer, after filling the extension forms for a schema, I want to click a "Preview Extensions" button to see a read-only view of the complete schema definition (basic + extensions combined) and then click "Apply Extensions" to merge these extensions correctly into the main editor content for that schema, so that I can verify correctness and avoid errors before finalizing the schema definition.
*   **Story 5 (Iterate Schemas):** As a Backend Developer, I want to be able to repeat the "Add Schema" -> "Prepare Extensions" -> "Preview/Apply" process multiple times within the same session, so that I can build up a complex API specification involving multiple related data models.

### 3.3. Entity Specification Creation (Optional)

*   **Story 6 (Flag for Persistence):** As a Backend Developer, when defining an OpenAPI schema's extensions (Story 3), I want to set a boolean flag (`generatePersistenceLayer: true`) within `x-fbp-params`, so that I can indicate that a corresponding JPA entity and repository should be generated by downstream tooling.
*   **Story 11 (Add Standalone Entity):** As a Backend Developer, I want a separate "Add Standalone Entity" button available, so that I can define Entity Specifications for supporting database tables or entities not directly linked to an OpenAPI schema defined in this session, ensuring these are also included in the commit and PR.
*   **Story 7 (Define Entity Details):** As a Backend Developer, after either flagging a schema for persistence or choosing "Add Standalone Entity", I want to access a form where I can define the specifics of the corresponding JPA entity. This includes:
    *   `entityName` (pre-filled if linked to schema, otherwise user input)
    *   An *optional* `tableName` field (user can override default derivation).
    *   For each field (pre-filled from schema properties if linked):
        *   `fieldName`
        *   An *optional* `columnName` field (user can override default derivation).
        *   A mandatory `domainDataType` dropdown, populated from a **predefined, externally configured list** (e.g., "String(20)", "String(256)", "Decimal(10,2)", "IdentifierUUID", "FlagYN", "BusinessDate"). This enforces data type standards.
        *   Primary Key settings (`isPrimaryKey` toggle, `primaryKeyGenerationStrategy` dropdown - AUTO, SEQUENCE, IDENTITY, NONE).
        *   `isNullable` toggle.
    So that the downstream generator has the necessary standardized metadata.
*   **Story 8 (Define Relationships):** As a Backend Developer, within the entity definition form, I want a section to define relationships (`@OneToOne`, `@ManyToOne`, etc.) to other entities. This includes:
    *   `fieldName` for the relationship property.
    *   Selecting the `targetEntity` from a dropdown list containing **all other entities (linked and standalone)** defined within the *current plugin session*.
    *   Selecting the `relationshipType` (dropdown).
    *   Optional inputs for `mappedBy` (for bidirectional), `fetchType` (LAZY/EAGER dropdown), `cascadeOptions` (multi-select/checkboxes), and `joinColumnName` override.
    So that generated entities have correct associations. (No complex dependency validation needed in MVP).
*   **Story 9 (Save Entity Spec):** As a Backend Developer, after defining an entity's details and relationships via the form, I want to click "Save Entity Spec", so that this definition is stored by the plugin, ready to be committed as a separate `.entity.json` file.
*   **Story 10 (Iterate Entities):** As a Backend Developer, I want to be able to repeat the process of defining entities (linked or standalone) and their relationships multiple times within the same session, so that I can define the complete persistence layer requirements for my new feature.

### 3.4. Review & Submit

*   **Story 12 (Review):** As a Backend Developer, before finalizing, I want to navigate to a "Review" screen that displays:
    *   The complete, final OpenAPI specification in a read-only YAML viewer.
    *   A list of all defined Entity Specifications (linked and standalone), where each entity name is expandable to show its full JSON definition.
    *   The target GitHub repository URL.
    *   The automatically generated branch name (`feature/<feature-name>`).
    *   The automatically generated commit message (`feat: Define API specification and entity models for [Feature Name]`).
    So that I can perform a final check before committing. (A "Back" button to edit is deferred post-MVP).
*   **Story 13 (Submit & Create PR):** As a Backend Developer, after reviewing, I want to click "Submit", so that the plugin automatically performs the following actions using a configured **Service Account Token**:
    1.  Creates a new Git branch named `feature/<feature-name>` (sanitized) in the selected microservice's GitHub repository.
    2.  Commits the generated OpenAPI spec file named `<feature-name>.yaml` and all defined Entity Spec JSON files (named `<EntityName>.entity.json`) to that branch with the commit message `feat: Define API specification and entity models for [Feature Name]`.
    3.  Creates a Pull Request from the new `feature/<feature-name>` branch targeting the hardcoded `develop` branch.
    4.  Populates the Pull Request description with the Feature Name, Description (from setup), and adds traceability text like "PR initiated by: [Initiator's Backstage Username/ID]".
    5.  If any Git operation fails (branch exists, commit error, PR error), displays a clear error message to me (including API error details if possible) without attempting automatic rollback.

## 4. Non-Functional Requirements (Highlights for MVP)

*   **Usability:** The UI forms for vendor extensions and entity specifications must be intuitive and guide the user effectively. Error messages must be clear and actionable.
*   **Reliability:** The Git operations (branch, commit, PR creation) must be reliable. Failures should be reported clearly.
*   **Security:** The GitHub Service Account Token used by the plugin must be stored and handled securely according to Backstage best practices.
*   **Configurability:** The list of predefined `domainDataType` values must be configurable externally (e.g., via a file managed within the Backstage configuration) without requiring plugin code changes.
*   **Performance:** The plugin UI should remain responsive, especially during parsing ("Prepare Vendor Extensions") and form display, even for reasonably complex specifications.

## 5. Success Metrics (MVP)

The success of the MVP will be measured by:
1.  **Plugin Usage Frequency:** Number of successful submissions (features defined) logged per week/month (tracked via custom Backstage DB table entry containing MS Name, User, Feature, Schemas, Entities, Timestamp). Target: Steady or increasing trend post-launch.
2.  **Adoption Rate:** Percentage of target backend developers who have used the plugin at least once within a defined period (e.g., 3 months post-launch). Target: Achieve X% adoption.
3.  **Developer Satisfaction:** Qualitative and quantitative feedback gathered via surveys or interviews focusing on ease of use, perceived time savings, and areas for improvement. Target: Achieve an average satisfaction score above Z.

## 6. Open Issues / Future Considerations (Post-MVP)

*   **Review Screen "Back" Button:** Implement navigation back from Review to edit specs.
*   **Error Handling:** Explore more sophisticated error recovery or guidance beyond simple messages.
*   **User Git Tokens:** Investigate using user-specific tokens for PR creation for direct authorship attribution.
*   **Configuration Customization:** Allow configuration of branch naming patterns, commit messages, and the target branch for PRs (instead of hardcoded values).
*   **Advanced Entity Features:** Support for composite keys, inheritance strategies, additional JPA annotations.
*   **Domain Data Type Management:** Formalize the process for updating and versioning the external domain type configuration file.
*   **Import/Export:** Allow importing existing specs for modification or exporting definitions.
*   **Enhanced Validation:** Implement stricter OpenAPI linting or entity relationship validation within the UI.
*   **Code Generation Preview:** Explore feasibility of showing a non-committing preview of the code that *would be* generated by downstream tools.