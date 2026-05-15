# Spec 0021 – CI Test Job Data Fetch Prerequisite

**Status:** In Progress  
**Iteration:** 21  
**Author:** Architect agent  
**Branch:** `iteration-21-ci-test-job-data-fetch-prerequisite`

---

## 1. Problem

The deploy pipeline fails at the `test` job with:

```
Cannot find module '../../public/data/pokemon.json'
from 'tests/components/pokemon-card.test.tsx'
```

`public/data/pokemon.json` is excluded from version control by the `.gitignore` rule
`public/data/*`. It is generated at runtime by `npm run fetch-pokemon`. In the current
workflow, `npm run fetch-pokemon` only runs in the `build` job, which executes *after*
the `test` job completes. Tests that import the JSON file therefore always fail in CI.

Affected test files:

- `tests/domain/pokemon-catalog.test.ts` (imports `pokemon.json` at line 3)
- `tests/components/pokemon-card.test.tsx` (imports `pokemon.json` at line 9)

---

## 2. Goal

The `test` job must fetch Pokémon data before running the test suite, so every test
that imports `public/data/pokemon.json` finds the file present.

---

## 3. Specification

### 3.1 Workflow change

Add a **Fetch Pokémon data** step to the `test` job in
`.github/workflows/build-and-deploy.yml`, immediately before the **Run tests** step:

```yaml
- name: Fetch Pokémon data
  run: npm run fetch-pokemon
```

No other changes to the workflow. The `build` job retains its own fetch step and
operates independently.

### 3.2 Non-goals

- Do not remove `public/data/*` from `.gitignore`.
- Do not commit a checked-in copy of `pokemon.json`.
- Do not change any test file or source file.
- Do not combine the `test` and `build` jobs or share artifacts between them.

---

## 4. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | The `test` job in `.github/workflows/build-and-deploy.yml` contains a step named `Fetch Pokémon data` that runs `npm run fetch-pokemon`, positioned before the `Run tests` step. |
| AC-02 | No other step, job, or file in the workflow is modified. |
| AC-03 | `public/data/*` remains in `.gitignore`. |
| AC-04 | `public/data/pokemon.json` is not tracked by git. |

---

## 5. Test Plan

This spec produces no new automated tests. Verification is by inspection of the
workflow file against AC-01 through AC-04.
