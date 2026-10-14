# 0001: Main portfolio stack and initial hosting

Status: accepted
Date: 2026-10-14

## Context

The owner wants an animated, interactive job-seeking portfolio. A separate static cloud/infrastructure showcase should be reachable from the main portfolio. Initial hosting should support convenient automatic deployment.

## Decision

Use Next.js and TypeScript for the main portfolio, with Vercel as the initial hosting plan. Plan for Git-connected deployment; no repository integration or live deployment is configured yet.

Keep the cloud/infrastructure showcase separate. AWS static hosting is a candidate for that showcase, not the hosting decision for the main portfolio.

## Alternatives considered

- Astro with React islands was initially suggested for a content-focused portfolio. The owner accepted Next.js and TypeScript after clarifying the intended experience.
- React with Vite was discussed. Next.js is the agreed framework.

## Consequences

- Design interactive features within the Next.js/React application.
- Choose graphics and animation libraries after defining the interactions.
- Server features, persistence, package manager, and content organization remain undecided.
- This decision does not authorize starting website implementation or establish that deployment is complete.
