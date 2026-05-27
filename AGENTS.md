# AI Agents Collaboration Guidelines (AGENTS.md)

Welcome to the Birthday Photo - 3D Electronic Gallery Project! This document specifies how AI Coding Agents (like **Antigravity**) collaborate with developers and automated systems to maintain, expand, and refactor this codebase.

---

## AI Agent Capabilities & Responsibilities

The AI Agents are equipped to autonomously perform development tasks inside the project workspace:
1. **Core Development**: Refactor and extend the Next.js/React Three Fiber 3D client (`apps/web`) and Refine admin panel (`apps/admin`).
2. **Database & Storage Connection**: Auto-configure PostgreSQL and Supabase environment variables, test SQL scripts in local docker environments, and implement CORS-safe media loading.
3. **CI/CD Pipeline Maintenance**: Monitor and fix GitHub Actions workflow runs, optimize multi-stage Docker build files.
4. **Performance Tuning**: Adjust adaptive DPR (Device Pixel Ratio) and dynamic post-processing bloom/vignette intensities depending on hardware specs.

---

## AI Collaboration Best Practices

When delegating tasks to an AI Agent or using slash commands:

### 1. Using Slash Commands in Chat UI
- `/goal`: Trigger when you want the agent to carry out long-running, thorough iterations (e.g., refactoring 3D visual styles, implementing new components, adding performance tests).
- `/grill-me`: Recommend starting an interactive interview with the agent to align on design ideas, color palettes (e.g., Christmas, Birthday, Romantic, Party presets), and architectural preferences.
- `/schedule`: Set a recurring health monitor or build checker (e.g., checks every night for compile breaks).

### 2. Sandbox Development Isolation
- AI Agents compile and test the apps in separate local sandboxes.
- The `docker-compose.yml` provides absolute sandbox parity with real-world deployments.
- Always check that `.env` files are updated with the correct local Supabase endpoints before starting the development environment.

---

## Technical Specifications for Agents

### Monorepo Structure
- **apps/web**: Next.js App Router. Custom R3F elements should always use the custom `useState/useEffect` asynchronous texture loaders rather than synchronous Drei suspenders to avoid CORS/404 canvas blackouts.
- **apps/admin**: Refine framework with Ant Design. When calling `useList` or other data providers, retrieve properties safely from `photosQuery.result` (data/total) and `photosQuery.query.isLoading`.

---

## Agent Autopilot & Handover
- Check `implementation_plan.md` for full design sheets before approving major features.
- Track progress via `task.md` during execution.
- Review `walkthrough.md` after completion for detailed diff files and compile tests.
