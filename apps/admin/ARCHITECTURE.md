# Architecture Documentation - Birthday Photo Admin

## 1. Overview
This is the administration panel for the Birthday Photo application. It is built using **Refine**, **Ant Design**, and **Supabase**. It follows a Single Page Application (SPA) architecture.

## 2. Tech Stack
- **Framework**: React 19 + Vite
- **Admin Framework**: Refine (Core, Antd, React Router v6)
- **UI Library**: Ant Design v5
- **Backend/Database**: Supabase (PostgreSQL + PostgREST)
- **Authentication**: Supabase Auth
- **State Management**: React Query (via Refine)

## 3. Directory Structure
- `src/pages`: Contains page components grouped by resource (photos, scenes, members, dashboard).
- `src/utility`: Helper functions and clients (supabaseClient).
- `src/config.ts`: Environment-aware configuration.

## 4. Key Features
- **Dashboard**: Overview of system statistics (Photos, Scenes, Members) and recent activity.
- **Resource Management**: CRUD operations for Photos, Scenes, and Members.
- **Settings**: Global configuration for the Web Client (music, quality presets).
- **Access Control**: Currently managed via Supabase Row Level Security (RLS) policies (enforced at API level).

## 5. Security & Permissions
- **Authentication**: Users must be authenticated via Supabase to access the admin panel.
- **Authorization**: API requests are secured by RLS policies. The Admin app assumes the logged-in user has `admin` or `editor` privileges (to be enforced by RLS).

## 6. Future Roadmap
- **Role-Based Access Control (RBAC)**: Implement a dedicated `accessControlProvider` in Refine to hide/show UI elements based on user roles.
- **Logging**: Integrate a logging service (e.g., Sentry) for frontend error tracking.
- **Automated Testing**: Expand Vitest coverage for all list and edit pages.
