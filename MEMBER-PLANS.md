# MEMBER-PLANS.md — Role Allocations

The execution plan for this hackathon has been updated to use a **Member-Based Branch Strategy**. This ensures absolute zero merge conflicts when pushing code. 

Please refer to your specific execution guide below for your hour-by-hour timeline, file ownership matrix, and AI acceleration strategies:

- [MEMBER-1-FRONTEND.md](MEMBER-1-FRONTEND.md)
  - **Role:** Complete Frontend (`apps/web/*`)
  - **Branch:** `member1-frontend`
  
- [MEMBER-2-DATABASE.md](MEMBER-2-DATABASE.md)
  - **Role:** Complete Database (`supabase/*`) & DevOps
  - **Branch:** `member2-database`

- [MEMBER-3-BACKEND-1.md](MEMBER-3-BACKEND-1.md)
  - **Role:** Backend Core & Auth (`apps/api/src/index.ts`, Auth Routes, Request Routes)
  - **Branch:** `member3-backend-core`

- [MEMBER-4-BACKEND-2.md](MEMBER-4-BACKEND-2.md)
  - **Role:** Backend Features & AI (`apps/api/src/routes/...` for Match, NGO, Resources)
  - **Branch:** `member4-backend-features`

## Golden Rule of Zero Merge Conflicts
**DO NOT** edit files that are outside your defined ownership scope. If you need a change in a file owned by another member, ask them to make the change on their branch.
