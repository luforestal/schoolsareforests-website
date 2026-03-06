# Schools Are Forests — Platform Lifecycle & Security

> Written in plain language. Read this before doing anything with the platform.

---

## The Problem We Solved

Before these changes, the platform was **completely open**:
- Anyone could sign up and say "I'm a teacher" — no verification
- Students could access any school just by guessing or sharing a UUID (a long ugly code)
- There was no way to control when students could enter or not
- If a teacher left, all data was tied to them with no clear way to hand it over

These changes fix all of that.

---

## How It Works Now

### 1. Teacher Registration (with Approval)

**What changed:** Teachers no longer get instant access. They register, and then wait.

**Flow:**
1. Teacher goes to `/teacher` and creates an account
2. They fill in their name, school, grade, subject
3. Account is created with status **"pending"**
4. Teacher sees a waiting screen: *"Your account is pending approval"*
5. **You (admin) go to `/admin/teachers` and approve or reject them**
6. If approved → teacher can now log in and use the dashboard
7. If rejected → teacher sees the rejection reason you wrote

**Why:** Prevents random people from signing up and polluting the data.

---

### 2. Student Access (Class Sessions)

**What changed:** Students no longer use a long school UUID. Instead, teachers start a "session" and generate a **6-letter code** (like `FX7K2M`). That code is what students enter.

**Flow:**
1. Teacher logs into dashboard
2. Clicks **"Start Session"** (optionally types a note like "Grade 7B")
3. A 6-letter code appears, big and bold — teacher projects it on screen
4. Students go to `/student` and type that code
5. They land on the school's field inventory and can record trees
6. **The session expires after 3 hours** (students see an error if they try to enter after)
7. Teacher clicks **"Close Session"** to end it early — no more entries

**Re-entry:** If a student needs to come back later (e.g., to finish measurements at home), the teacher can click **"Reuse [code]"** to reactivate the same code for another 3 hours. Students who already have the code can re-enter.

**Why:** A 6-letter code is easy to show in class. It expires. The teacher controls when access opens and closes.

---

### 3. Admin Panel

**Where:** Go to `/admin/teachers` in your browser (you must be logged in as an admin).

**Sections:**
- **Teachers tab:** See everyone who registered. Filter by Pending / Approved / Rejected. Approve or reject with one click. Write a reason when rejecting.
- **Schools tab:** See all schools and which teachers are linked to them. You can initiate an ownership transfer here (full automation comes in Phase 3).

**How to become an admin:** You cannot sign up as an admin. Someone has to insert your user ID into the database manually (see the SQL migration file for instructions).

---

### 4. What Didn't Change

- The field inventory itself (`/field/...`) works exactly the same once inside
- All tree data, zones, photos — nothing was deleted or modified
- Teachers who were already registered are automatically **approved** (the migration sets them to approved, not pending)
- The public school explorer (`/schools`) still works the same

---

## Steps to Activate This (DO THESE IN ORDER)

### Step 1 — Run the Database Migration

1. Open your **Supabase dashboard**
2. Go to **SQL Editor**
3. Open the file `supabase/migrations/001_lifecycle.sql` in this project
4. Copy the entire content and paste it into the SQL editor
5. Click **Run**

This adds the new tables (`class_sessions`, `inventories`, `admins`) and the new `status` column on teachers.

### Step 2 — Add Yourself as Admin

After running the migration, run this in the same SQL editor (replace the values with your real info):

```sql
INSERT INTO admins (id, email, name)
VALUES (
  'YOUR-SUPABASE-USER-UUID-HERE',
  'you@youremail.com',
  'Your Name'
);
```

To find your UUID: in Supabase, go to **Authentication → Users**, find your email, and copy the UUID from the ID column.

### Step 3 — Deploy the Code

Push or deploy the new frontend code. If you're using Vercel, it auto-deploys when you push to GitHub.

### Step 4 — Test It

1. Log in at `/admin/teachers` — you should see it (if you see "Verifying access…" and get redirected, your UUID wasn't added correctly in Step 2)
2. Register a brand new test teacher account at `/teacher`
3. Go to `/admin/teachers` — it should appear as **Pending**
4. Approve it
5. Log in with that test teacher → should access the dashboard
6. Start a session → get a 6-letter code
7. Open a new incognito window, go to `/student`, enter the code → should reach the field
8. Close the session in the teacher dashboard → try entering the code again → should be blocked

---

## What Comes Next (Future Phases)

These are planned but NOT yet implemented:

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 3 | Multiple teachers per school (proper many-to-many table) | Planned |
| Phase 3 | Teacher invitation flow (owner invites co-teacher) | Planned |
| Phase 4 | Annual inventories (Year 2025 vs Year 2026 comparison) | Planned |
| Phase 4 | Time series graphs in the public explorer | Planned |
| Phase 5 | Supabase Row Level Security (database-level protection) | Planned |
| Phase 5 | Email notifications (approval, rejection) | Planned |

The database is already prepared for Phase 4 (the `inventories` table and `inventory_id` on trees were created in the migration).

---

## Security Notes

- **Session codes** are short and expire — a student who missed class cannot guess someone else's code
- **Admin access** requires being in the `admins` table AND logged into Supabase Auth — there is no public way to become admin
- **Teacher dashboard** checks status on every load — if you revoke a teacher, they get redirected on their next page load
- **Students never get a persistent school code** — the school UUID is no longer shared with students

---

*Last updated: 2026-03-06*
