<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project will be indexed by GitNexus when code exists.

## Always Do

* Luôn giao tiếp bằng tiếng Việt.
* MUST run impact analysis before editing any symbol.
* MUST run gitnexus_detect_changes() before committing.
* MUST warn the user if risk level is HIGH or CRITICAL.
* Use GitNexus for architecture discovery and impact analysis whenever available.

## Never Do

* NEVER edit code blindly.
* NEVER rename symbols without graph-aware tooling.
* NEVER commit without checking impact scope.

<!-- gitnexus:end -->

# Spec Driven Development (SPDD)

This repository follows Spec Driven Development.

The source of truth is:

1. docs/vision/*
2. docs/architecture/*
3. docs/product/*
4. features/*/spec.md
5. features/*/tasks.md
6. features/*/validation.md

Code is NOT the source of truth.

Specifications are the source of truth.

---

# Feature Lifecycle

Every feature follows:

Discovery
→ Spec
→ Tasks
→ Implementation
→ Validation

Never skip stages.

---

# Command Conventions

## /spec:

Purpose:

Create a new feature specification.

Workflow:

1. Understand business goals.
2. Ask clarification questions.
3. Discover edge cases.
4. Discover permissions.
5. Discover integrations.
6. Generate spec.md.

Never generate code.

---

## /spec/<feature-name>:

Purpose:

Modify an existing feature specification.

Workflow:

1. Locate feature folder.
2. Read spec.md.
3. Read tasks.md.
4. Read validation.md.
5. Analyze impact.
6. Ask clarification questions if needed.
7. Update spec.md.
8. Suggest task changes.

Never generate code automatically.

---

## /tasks/<feature-name>

Purpose:

Generate or update implementation plan.

Workflow:

1. Read approved spec.md.
2. Generate tasks.md.

Tasks must be atomic, testable, ordered, and independently executable.

Never generate code.

---

## /implement/<feature-name>

Purpose:

Implement approved tasks.

Workflow:

1. Read vision.
2. Read architecture.
3. Read spec.md.
4. Read tasks.md.
5. Execute tasks.

Before modifying existing code, run GitNexus impact analysis and report blast radius.

---

## /validate/<feature-name>

Purpose:

Validate implementation against specification.

Validation must verify functional requirements, business rules, acceptance criteria, security requirements, and performance requirements. Generate a validation report.

---

# Spec Template

Every spec.md must contain:

* Goal
* Business Context
* User Stories
* Functional Requirements
* Business Rules
* Permissions
* Integrations
* Non Functional Requirements
* Acceptance Criteria
* Out Of Scope

---

# Approval Rules

Agent may create spec and task drafts, but must NOT implement a feature or modify production code until the user approves its spec and tasks.

---

# Architecture Protection

Agent must never change authentication flow, database conventions, API standards, or audit logging behavior without explicit approval. Always consult architecture documents before proposing changes.
