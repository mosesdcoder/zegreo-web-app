# CLAUDE.md — Zogreo Web (Frontend)

> One Next.js app holding all three surfaces of the Zogreo platform. Read this fully before coding. The backend API contract is defined in the **backend** repo's CLAUDE.md (endpoints + DTOs) — this frontend consumes that API. Obey the **Hard Rules** below.

## What we are building

A single Next.js application with **three surfaces**, separated by route groups, sharing one design system, one API client, and one auth layer:
- **Public website** `(marketing)` — programs, fees, story, Apply Now. Anonymous.
- **Applicant portal** `(portal)` — apply, upload docs, track status, pay, accept offer. Authenticated applicant.
- **Admin back office** `(admin)` — review, verify, decide, reconcile, manage. Authenticated staff.

"Everything in one place" = one repo, one app, shared everything. Not three projects.

## Stack (use exactly this)

- **Next.js 14+ (App Router)**, **TypeScript**, React Server + Client Components.
- **Tailwind CSS** for styling + **shadcn/ui** for components (owned, in `components/ui`, editable — not a locked dependency).
- **lucide-react** for icons. **Fraunces** (display serif) + **Hanken Grotesk** (UI sans) via `next/font/google`.
- **react-hook-form + zod** for forms and validation. **@tanstack/react-query** for server state (fetching/caching/mutations).
- **Sonner** (shadcn) for toasts. No other UI kit.

## Project structure

```
src/
  app/
    (marketing)/        layout + page, programs/, programs/[slug]/, fees/, about/, contact/, legal/{privacy,terms,refunds}/
    (portal)/           layout (auth-guarded) + dashboard/, apply/[step]/, documents/, payments/, offer/
    (admin)/            layout (role-guarded) + applications/, applications/[id]/, payments/, students/, fees/, audit/
    (auth)/             login/, signup/, verify/
    api/                route handlers (e.g. session cookie set/clear)
    layout.tsx          root: fonts, providers, Toaster
    globals.css         Tailwind + brand CSS variables
  components/
    ui/                 shadcn components (button, input, card, badge, dialog, table, form, ...)
    brand/              Crest, Wordmark, StatusLadder, Stepper, FeeTable, DocRow, PaymentMethodPicker, StatusChip
    layout/             PortalShell (top bar + bottom tab nav), AdminShell (sidebar), MarketingHeader/Footer
  lib/
    api/                client.ts (typed fetch wrapper), endpoints grouped by feature (auth, applications, documents, payments, admin, catalog)
    auth/               session helpers, useSession, role guards
    types.ts            DTO types mirroring the API
    utils.ts, format.ts (KES currency, dates)
  middleware.ts         route protection by cookie + role
```

## Brand / design tokens (from the approved mockups)

Set these as CSS variables in `globals.css` and map into the Tailwind theme + shadcn token variables. **Refined collegiate-institutional** aesthetic — deep navy + gold, serif headings, generous space, mobile-first.

```
--ink:    #0A1B3D   (navy text / primary)
--navy:   #0E2452   --navy-deep: #06122B
--gold:   #C6A24A   --gold-deep: #A8842F   --gold-soft: #EBDBB0
--cream:  #FAF6EC   --canvas: #E9E3D6
--success:#1E8A5B   --warn: #B7791F   --danger: #B4402F
radius: 13–18px on cards/inputs
```
- Headings: **Fraunces** (weight 600). Body/UI: **Hanken Grotesk**.
- Primary button = navy (`--ink`); primary CTA / "next step" = gold. Active stepper/ladder node = gold. Status chips: green=verified/done, amber=pending, red=action-needed.
- Configure shadcn's theme variables to these brand colors so all generated components inherit them — don't leave the default slate/zinc theme.

## API + auth conventions

- **Base URL** from `NEXT_PUBLIC_API_URL`. All calls go through `lib/api/client.ts`.
- **Tenant header:** send `X-Org-Slug: zogreo` on anonymous calls (public site, signup, login). After login the JWT carries the org, so authenticated calls rely on the bearer token.
- **Auth:** on login/verify the API returns a JWT. Store it in an **httpOnly cookie** set via a Next.js Route Handler (`app/api/session`) — never in localStorage. The API client attaches it as `Authorization: Bearer`. `middleware.ts` reads/decodes the cookie to guard routes and gate `(admin)` by role (Registrar/Bursar/SuperAdmin) and `(portal)` by an authenticated, phone-verified applicant.
- **Server state** via react-query: queries for reads, mutations for writes, with toast feedback. Surface API `{error}` messages to the user cleanly.
- DTO **types** in `lib/types.ts` mirror the backend exactly (ApplicationStatus ladder, FeeCode, etc.).

## Hard Rules
1. **Mobile-first.** Design for ~390px first, scale up. The applicant portal especially: short steps, big tap targets, **save-as-you-go** on the application wizard (autosave each step via a PATCH; never lose data on a flaky connection).
2. **Never store the JWT in localStorage** — httpOnly cookie only.
3. **Role-gate on the server** (middleware), not just by hiding buttons.
4. **The status ladder is the portal's spine** — the dashboard leads with it.
5. **Show the Technology Fee transparently** as its own line wherever fees appear.
6. **Reuse shared brand components** — don't re-style the ladder/stepper/fee table per screen.
7. **Accessible:** labels on inputs, focus states, contrast, keyboard nav (shadcn gives most of this — keep it).

## Full screen inventory (build all of these — nothing omitted)

**Auth `(auth)`:** Login · Sign up · Verify OTP · Forgot/Reset password.

**Public website `(marketing)`:** Home (hero, programs grid, why-us, fees teaser, CTA) · Programs list · Program detail (curriculum, mode, duration, fee, intakes, Apply Now) · Fees page · About · News/Events (stub) · Contact · Legal: Privacy, Terms, Refunds.

**Applicant portal `(portal)`:** Dashboard (status ladder + program card + next-step CTA) · Application wizard steps (Program & intake → Personal → Education history → Next-of-kin → Review & submit) with autosave · Documents (checklist + upload + Verified/Pending/Rejected states) · Payments (invoice list per gate + M-Pesa STK flow + card + STK-pending + success + receipt) · Offer (view, fee breakdown, accept, download letter) · Profile/settings.

**Admin back office `(admin)`:** Login → Applications queue (filter by status/program/intake) · Application detail (applicant data, document viewer with Verify/Reject/Request-resubmit, decision panel: Make Offer / Reject) · Offer generation confirm · Payments / reconciliation (gross / provider fee / technology fee / net-to-school / totals, export) · Students list (admission numbers) · Fee-type config · Audit log · Staff/roles (basic).

## States to include (don't ship only the happy path)
Loading skeletons, empty states, error states, the OTP-resend countdown, the STK-pending and payment-success screens, document-rejected-with-reason, offer-expired. These are part of "nothing missed."

## How to verify (after each slice)
- `npm run build` clean (no type errors).
- `npm run dev`, click through the slice's screens at a 390px viewport and at desktop.
- Auth slice: signup → receive devOtp (from the API in non-prod) → verify → land on dashboard; refresh keeps you signed in (cookie); logging out clears it; hitting an `(admin)` route as an applicant redirects.

## Out of scope (later)
LMS/Moodle screens, Flutter app, sponsor portal, certificate verification page, analytics dashboards. Leave room; don't build now.
