# Implementation Plan - Phase 2

---

## 1. Vendor Extension Form Enhancements

- Support all `x-fbp-*` vendor extensions:
  - Arrays: `repoMethods`, `overrideMethods`, `interfaces`, `endPoints`, `nonModifiableAttributes`
  - Nested objects inside arrays
  - Boolean flags: `persist`, `setDefaults`, `isModifiable`
- Add "Preview Extensions" before applying
- Improve YAML parsing and merging logic
- Enhance UI with dynamic form generation for nested structures

---

## 2. Entity Linking Automation

- When `generatePersistenceLayer` is enabled in Vendor Extensions:
  - Auto-create or link an Entity Spec for that schema
  - Pre-populate entity form fields from schema properties
  - Keep entity and schema in sync on updates

---

## 3. Backend API Enhancements

- **Logging API:**
  - Create a backend endpoint to log submission metadata into a database
  - Secure the endpoint with authentication
- **GitHub Proxy API:**
  - Move GitHub API calls from frontend to backend proxy
  - Securely store and use Service Account Token
  - Handle errors and retries

---

## 4. Dynamic Data Fetching

- **Microservices List:**
  - Fetch from Backstage Catalog API (`kind: Component`, `spec.type: Platform Component`)
  - Filter and display dynamically
- **User Identity:**
  - Fetch from Backstage Identity API
  - Auto-populate user info in submissions
- **Config Data:**
  - Fetch domain data types and GitHub token from Backstage Config API
  - Remove hardcoded/static configs

---

## 5. UI/UX Improvements

- Replace Tailwind components with Material UI components for consistency
- Add loading indicators during async operations
- Improve error messages and inline validation
- Add tooltips and help texts
- Accessibility improvements

---

## 6. Testing

- **Unit Tests:**
  - Components, forms, YAML/JSON utilities
- **Integration Tests:**
  - Multi-step flow, API interactions
- **E2E Tests:**
  - Full user journey with mocks
- **UAT:**
  - User acceptance testing with real scenarios

---

## 7. Security Hardening

- Ensure tokens are never exposed to frontend
- Sanitize all user inputs
- Secure backend endpoints
- Review dependencies for vulnerabilities

---

## 8. Deployment & Config

- Prepare Backstage plugin deployment
- Configure backend proxy and logging endpoints
- Set up database table for logging
- Document environment variables and secrets

---

## 9. Future Enhancements (Post-MVP)

- Support editing existing specs
- Advanced validation and linting
- Import/export specs
- More flexible branch/PR naming
- Support for composite keys, inheritance in entities
- UI for downstream code generation triggers

---
