# Graph Report - F:\AgniShiksha\agni-shiksha-admin  (2026-04-25)

## Corpus Check
- Corpus is ~31,213 words - fits in a single context window. You may not need a graph.

## Summary
- 133 nodes · 53 edges · 2 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 2|Community 2]]

## God Nodes (most connected - your core abstractions)
1. `ErrorBoundary` - 4 edges
2. `handleFormSubmit()` - 3 edges
3. `onSubmit()` - 3 edges
4. `toUTC()` - 2 edges
5. `handleSafeSubmit()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleFormSubmit()` --calls--> `onSubmit()`  [INFERRED]
  F:\AgniShiksha\agni-shiksha-admin\src\features\content\components\test-series\TestSettingsTab.tsx → F:\AgniShiksha\agni-shiksha-admin\src\features\plans\components\PlansPage.tsx
- `handleSafeSubmit()` --calls--> `onSubmit()`  [INFERRED]
  F:\AgniShiksha\agni-shiksha-admin\src\features\study\components\AddTaskModal.tsx → F:\AgniShiksha\agni-shiksha-admin\src\features\plans\components\PlansPage.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (4): handleSafeSubmit(), onSubmit(), handleFormSubmit(), toUTC()

### Community 2 - "Community 2"
Cohesion: 0.4
Nodes (1): ErrorBoundary

## Knowledge Gaps
- **Thin community `Community 2`** (5 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `onSubmit()` (e.g. with `handleFormSubmit()` and `handleSafeSubmit()`) actually correct?**
  _`onSubmit()` has 2 INFERRED edges - model-reasoned connections that need verification._