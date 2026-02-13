# Specification

## Summary
**Goal:** Add Internet Identity authentication with role-based Labour/Customer flows, including Labour profiles and Customer search filters for RozKaam.

**Planned changes:**
- Replace phone-OTP login with Internet Identity login and add a post-login role selection step (Labour/Customer) persisted in an on-chain users store.
- Implement a backend users store keyed by authenticated principal with fields: uid, optional phone, role (labour/customer), created_time; add APIs to set/get the caller’s role.
- Refactor backend labour data model to be tied to the authenticated caller and include: uid, name, phone, skill, area, wage, availability, rating (default 5), created_time; add APIs to create/fetch/update the caller’s profile and list/search labours by skill+area.
- Add a first-time-only Labour Profile Setup screen (with optional profile photo) for Labour users without a saved profile; save via backend and then route to Labour Home.
- Implement a Labour Home screen showing profile summary plus an availability switch and Edit Profile flow that persists updates (including optional photo).
- Update Customer Home to include Skill and Area dropdown filters and list only labour profiles matching both; show an English empty-state when no results.
- Ensure all user-facing UI text is English across updated screens.
- Update navigation/routing to be auth- and role-aware: Login -> (Role selection if missing) -> Labour flow (Profile Setup if missing, else Labour Home) OR Customer flow (Customer Home).

**User-visible outcome:** Users sign in with Internet Identity, select a role once, and are routed into either a Labour profile flow (setup, view/edit, availability toggle) or a Customer flow with skill+area filtering to find matching labour profiles, all with English UI text.
