# Claude Code Usage Guide

This repository uses **Claude Code** to support a
**specification-driven, agentic development workflow**.

Claude is not a general assistant here.
It is used through **explicit, role-based agents** with strict boundaries.

This document defines how humans and agents collaborate in this repo.

---

## Core Principles

1. **Specs are the source of truth**
2. **Agents have fixed roles**
3. **Humans decide intent, agents execute**
4. **No agent works outside its mandate**
5. **Static-first, cost-aware by default**

If something is unclear, the solution is:
> Improve the spec — not the code.

---

## Agent Model Overview

The following agents are defined and configured in `claude.json`:

| Agent | Responsibility | Writes |
|------|---------------|--------|
| Architect | System behavior and constraints | `/specs` |
| Developer | Tests and production code | `/src`, `/scripts`, `/tests` |
| Reviewer | Quality and spec compliance | Review output only |
| Deploy | CI/CD and hosting | `.github/workflows` |

Agents do **not** overlap responsibilities.

---

## Human Responsibilities

Humans are responsible for:

- Deciding iteration goals
- Choosing when to introduce new capabilities (e.g. AWS)
- Reviewing agent output for intent alignment
- Committing and merging changes

Humans must **not**:
- Edit specs written by the Architect agent
- Edit code written by the Developer agent to “fix small things”
- Bypass the Reviewer for non-trivial changes

---

## Agent Invocation Rules

### General Rules

- Invoke **one agent at a time**
- Each invocation should have a **single, clear objective**
- Never mix roles in a single prompt
- Commit agent output before invoking the next agent

---

### Architect Agent

Use when:
- Starting a new iteration
- Changing system behavior
- Clarifying constraints or non-goals

Example:
```bash
claude code --agent architect \
"Create the specification for Iteration 1: a static Next.js app with build-time Pokémon data ingestion"