# Full-Stack App Tasks

- Hands-on exercises covering Next.js setup, component building, authentication, CRUD interfaces, dashboards, deployment, and responsive design using AI tools.
- Each task includes a clear scenario, helpful hints, and detailed solutions.
- Practice these tasks to master building complete web applications for Elcon.

---

#### Table of Contents

- [01. Scaffold Next.js Project](#01-scaffold-nextjs-project)
- [02. Set Up Supabase Auth](#02-set-up-supabase-auth)
- [03. Build a Login Page](#03-build-a-login-page)
- [04. Protected Routes and Middleware](#04-protected-routes-and-middleware)
- [05. Data Table Component](#05-data-table-component)
- [06. CRUD Form: Create and Edit](#06-crud-form-create-and-edit)
- [07. Search and Filter Bar](#07-search-and-filter-bar)
- [08. Dashboard with KPI Cards](#08-dashboard-with-kpi-cards)
- [09. Charts and Visualizations](#09-charts-and-visualizations)
- [10. Responsive Sidebar Navigation](#10-responsive-sidebar-navigation)
- [11. Toast Notifications and Loading States](#11-toast-notifications-and-loading-states)
- [12. File Upload Component](#12-file-upload-component)
- [13. Dark Mode Toggle](#13-dark-mode-toggle)
- [14. Kanban Board (Deal Pipeline)](#14-kanban-board-deal-pipeline)
- [15. Deploy to Vercel](#15-deploy-to-vercel)

---

#### 01. Scaffold Next.js Project

- Use Claude Code to create a Next.js 14 project with TypeScript, Tailwind, shadcn/ui, and Supabase.

#### Scenario:

- Every new Elcon app starts with the same stack. Get the scaffold right once and reuse it.

Hint: Use `npx create-next-app` with proper flags, then add shadcn and Supabase.

??? success "Solution"

    ```bash
    claude "Create a new Next.js 14 app in ./elcon-app with:
    - TypeScript, Tailwind, App Router, src/ directory
    - shadcn/ui: install button, card, table, input, dialog, toast, dropdown-menu
    - @supabase/supabase-js and @supabase/ssr
    - Create src/lib/supabase/client.ts and server.ts helpers
    - Create .env.local.example with SUPABASE_URL and SUPABASE_ANON_KEY
    - Initialize git, first commit"
    ```

---

#### 02. Set Up Supabase Auth

- Configure Supabase authentication with email/password signup, login, and session management.

#### Scenario:

- All Elcon apps need authentication. Set up the auth layer that all pages will use.

Hint: Use `@supabase/ssr` for server-side session handling in Next.js.

??? success "Solution"

    ```bash
    claude "Set up Supabase auth in this Next.js project:
    1. Create src/lib/supabase/client.ts (browser client)
    2. Create src/lib/supabase/server.ts (server client with cookies)
    3. Create src/lib/supabase/middleware.ts (refresh session)
    4. Update middleware.ts to use the Supabase middleware
    5. Create a useUser hook in src/hooks/useUser.ts
    6. Create an AuthProvider context"
    ```

---

#### 03. Build a Login Page

- Create a professional login/signup page with email, password, and error handling.

#### Scenario:

- The entry point to every Elcon app. Must be clean, handle errors, and redirect after login.

Hint: Use shadcn Card, Input, Button. Handle loading state, errors, and redirect.

??? success "Solution"

    ```bash
    claude "Create a login page at src/app/auth/login/page.tsx:
    - Clean centered card layout
    - Email and password fields
    - Login and Sign Up tabs
    - Loading spinner during auth
    - Error messages below fields
    - Redirect to /dashboard after successful login
    - 'Forgot password' link
    - Elcon logo at the top
    Use shadcn/ui components and Supabase auth"
    ```

---

#### 04. Protected Routes and Middleware

- Implement Next.js middleware that redirects unauthenticated users to login.

#### Scenario:

- All pages except /auth/\* must require authentication.

Hint: Use Next.js middleware.ts with Supabase session check.

??? success "Solution"

    ```typescript
    // src/middleware.ts
    import { createServerClient } from '@supabase/ssr'
    import { NextResponse, type NextRequest } from 'next/server'

    export async function middleware(request: NextRequest) {
      const response = NextResponse.next({ request })
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { /* cookie handlers */ } }
      )
      const { data: { user } } = await supabase.auth.getUser()

      if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      return response
    }

    export const config = { matcher: ['/((?!_next|api|auth).*)'] }
    ```

---

#### 05. Data Table Component

- Build a reusable data table with sorting, pagination, and row selection using @tanstack/react-table.

#### Scenario:

- Every list page (suppliers, contacts, orders) needs a table. Build it once, reuse everywhere.

Hint: Use shadcn Table component with @tanstack/react-table for headless logic.

??? success "Solution"

    ```bash
    claude "Create a reusable DataTable component at src/components/data-table.tsx.
    Use @tanstack/react-table with shadcn/ui Table.
    Features: column sorting, pagination (10/20/50), row checkbox selection,
    column visibility toggle, empty state.
    Also create a column helper at src/components/data-table-columns.tsx
    with examples for suppliers table (name, email, country, rating, actions)."
    ```

---

#### 06. CRUD Form: Create and Edit

- Build a form component that handles both creating new suppliers and editing existing ones.

#### Scenario:

- One form component for create and edit. It detects the mode based on whether data is passed.

Hint: Use react-hook-form with zod validation and shadcn Form components.

??? success "Solution"

    ```bash
    claude "Create a SupplierForm component at src/components/supplier-form.tsx.
    - Use react-hook-form with zod schema validation
    - Fields: name (required), email (required, valid format), phone, country
      (dropdown), payment_terms (dropdown), rating (star selector), notes
    - Props: initialData? (if provided, edit mode; otherwise create mode)
    - onSubmit calls Supabase insert or update accordingly
    - Loading state on submit button
    - Success toast on save
    - Use shadcn Dialog to wrap the form"
    ```

---

#### 07. Search and Filter Bar

- Build a search and filter component that debounces input and updates URL query params.

#### Scenario:

- Every list page needs search and filters. URL params enable sharing filtered views.

Hint: Use `useSearchParams` for URL state, `useDeferredValue` or custom debounce for search.

??? success "Solution"

    ```bash
    claude "Create a SearchFilterBar component at src/components/search-filter-bar.tsx.
    - Text search input with debounce (300ms)
    - Country dropdown filter
    - Rating minimum filter (1-5 stars)
    - Active/inactive toggle
    - 'Clear all' button
    - All filters sync to URL query params (shareable URLs)
    - Component reads initial values from URL on mount
    Use shadcn Input, Select, Button."
    ```

---

#### 08. Dashboard with KPI Cards

- Build a dashboard page with 4 KPI cards showing live metrics from Supabase.

#### Scenario:

- The main landing page after login. Shows key business metrics at a glance.

Hint: Fetch aggregated data server-side, display in Card components with icons and trend arrows.

??? success "Solution"

    ```bash
    claude "Create a dashboard page at src/app/dashboard/page.tsx.
    4 KPI cards in a responsive grid:
    1. Total Suppliers (with active/inactive breakdown)
    2. Open Purchase Orders (count + total value)
    3. Overdue Deliveries (count, red if > 0)
    4. Average Supplier Rating (stars display)

    Each card shows: icon, metric value, label, and trend vs last month
    (green arrow up / red arrow down with percentage).
    Fetch data server-side from Supabase.
    Use shadcn Card and responsive grid (1 col mobile, 2 tablet, 4 desktop)."
    ```

---

#### 09. Charts and Visualizations

- Add interactive charts to the dashboard using a charting library.

#### Scenario:

- Management wants visual charts: PO pipeline bar chart, spending trend line, category pie chart.

Hint: Use recharts or chart.js with shadcn styling. Fetch data server-side.

??? success "Solution"

    ```bash
    claude "Add charts to the dashboard using recharts:
    1. Bar chart: Purchase orders by status (Pending, Approved, Shipped, Received)
    2. Line chart: Monthly spending over last 12 months
    3. Pie/donut chart: Spending by category
    4. Horizontal bar: Top 5 suppliers by order value

    Each chart in a Card with title and subtitle.
    Responsive layout: 2 columns on desktop, 1 on mobile.
    Use Tailwind colors that work in dark mode."
    ```

---

#### 10. Responsive Sidebar Navigation

- Build a sidebar navigation that collapses on mobile and highlights the active page.

#### Scenario:

- The app layout needs a persistent sidebar with navigation links, user avatar, and logout.

Hint: Use a layout component with sidebar. Detect active route with `usePathname`.

??? success "Solution"

    ```bash
    claude "Create an app layout at src/app/(dashboard)/layout.tsx with:
    - Left sidebar (240px desktop, slide-over on mobile)
    - Navigation links: Dashboard, Suppliers, Contacts, Orders, Reports, Settings
    - Each link has an icon (lucide-react) and highlights when active
    - User avatar and name at the bottom with logout dropdown
    - Hamburger menu button for mobile
    - Sidebar collapses to icons-only on medium screens
    Use shadcn Sheet for mobile overlay, Button for nav links."
    ```

---

#### 11. Toast Notifications and Loading States

- Implement toast notifications for all CRUD operations and loading skeletons for data fetching.

#### Scenario:

- Users need feedback when actions succeed or fail. Skeleton loading prevents layout shifts.

Hint: Use shadcn toast for notifications and Skeleton component for loading states.

??? success "Solution"

    ```bash
    claude "Add toast notifications and loading states:
    1. src/components/ui/toaster.tsx - Global toast container (add to layout)
    2. Update SupplierForm to show success/error toast on submit
    3. Update delete actions to show confirmation dialog + success toast
    4. Create a SupplierTableSkeleton component (shimmer rows)
    5. Create a DashboardSkeleton (shimmer cards + charts)
    6. Use Suspense boundaries with skeleton fallbacks
    7. Add error boundaries for graceful error display"
    ```

---

#### 12. File Upload Component

- Build a drag-and-drop file upload component that stores files in Supabase Storage.

#### Scenario:

- Users need to upload supplier contracts and certificates.

Hint: Use react-dropzone for drag-and-drop, Supabase Storage for file persistence.

??? success "Solution"

    ```bash
    claude "Create a FileUpload component at src/components/file-upload.tsx.
    - Drag-and-drop zone with visual feedback
    - Accept: PDF, images, CSV (configurable via props)
    - Max file size: 10MB (show error if exceeded)
    - Upload progress bar
    - Upload to Supabase Storage bucket
    - Display uploaded files list with download/delete
    - Props: bucket, folder, maxFiles, acceptedTypes, onUploadComplete
    Use react-dropzone and shadcn Progress."
    ```

---

#### 13. Dark Mode Toggle

- Implement a dark/light mode toggle that persists the user's preference.

#### Scenario:

- Users should be able to switch between light and dark themes. The preference persists across sessions.

Hint: Use next-themes with Tailwind's dark mode class strategy.

??? success "Solution"

    ```bash
    claude "Add dark mode support:
    1. Install next-themes
    2. Create ThemeProvider in src/components/theme-provider.tsx
    3. Add to root layout
    4. Create ThemeToggle button (sun/moon icon) in the header
    5. Ensure all components use Tailwind dark: classes
    6. Update tailwind.config with darkMode: 'class'
    7. Persist preference in localStorage"
    ```

---

#### 14. Kanban Board (Deal Pipeline)

- Build a Kanban board for managing deal pipeline stages with drag-and-drop.

#### Scenario:

- Sales deals move through stages: Lead → Qualified → Proposal → Negotiation → Won/Lost.

Hint: Use @hello-pangea/dnd (maintained fork of react-beautiful-dnd) for drag-and-drop.

??? success "Solution"

    ```bash
    claude "Create a Kanban board at src/app/deals/page.tsx.
    Columns: Lead, Qualified, Proposal, Negotiation, Won, Lost
    Each card shows: deal title, value, company, expected close date.
    - Drag cards between columns to update stage
    - On drop: update deal stage in Supabase
    - Column shows count and total value
    - Add deal button in each column header
    - Click card to open detail dialog
    Use @hello-pangea/dnd for drag-and-drop, shadcn Card for deal cards."
    ```

---

#### 15. Deploy to Vercel

- Deploy the complete Next.js application to Vercel with environment variables and a custom domain.

#### Scenario:

- The app is ready for production. Deploy it with proper configuration.

Hint: Use Vercel CLI or connect GitHub repo. Set environment variables in Vercel dashboard.

??? success "Solution"

    ```bash
    # Install Vercel CLI
    npm i -g vercel

    # Deploy
    vercel

    # Set environment variables
    vercel env add NEXT_PUBLIC_SUPABASE_URL
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
    vercel env add SUPABASE_SERVICE_ROLE_KEY

    # Deploy to production
    vercel --prod

    # Add custom domain (via Vercel dashboard)
    # Settings → Domains → Add → suppliers.elcon.co.il
    ```

    **Checklist before deploying:**
    - [ ] All environment variables set in Vercel
    - [ ] Supabase URL allows Vercel domain in CORS
    - [ ] Auth redirect URLs include Vercel domain
    - [ ] Build succeeds locally: `npm run build`
    - [ ] No console errors in browser
