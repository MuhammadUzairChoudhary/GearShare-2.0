# GearShare Interaction System

The interaction system for the Alpine Instrument design language. It defines how GearShare feels: **reliable, calm, precise, fast, familiar, premium without being theatrical, and appropriate for trust-sensitive transactions.**

This is the companion to `DESIGN_SYSTEM.md` (visual tokens) — this file covers **behaviour**.

---

## 1. Philosophy

Interactions are like a high-quality physical tool:

- **Immediate** — press feedback starts within 80 ms.
- **Controlled** — small positional changes, restrained colour shifts, no elastic overshoot.
- **Low-noise** — one signal per state; nothing pulses or loops.
- **Directional** — forward navigation moves forward; back reverses; modals enter from the bottom.
- **Consistent** — the same control behaves the same everywhere.
- **Quiet after completion** — no celebratory motion for ordinary transactions.

A successful result is not the most animated version. It is the version that feels **intentional, predictable, and dependable after hundreds of uses.**

### Anti-patterns (never)

- Gradients, glassmorphism, animated mesh backgrounds, confetti, bouncing tab icons, glowing buttons.
- Animated numbers for payments or deposits.
- Large scale changes or elastic overshoot on press.
- Decorative status pills and icon containers everywhere.
- Multiple competing accent colours in one screen.
- Loading screens when inline loading is sufficient.
- Confirmations for reversible actions; full-screen success pages for minor actions.
- Marketing copy inside checkout, pickup, returns, or disputes.
- Vague labels: "Processing", "Done", "Almost there", "Something went wrong".

### Trust language

Make important states explicit and specific:

| Avoid | Use |
|---|---|
| Processing | Securing payment |
| Success | Rental request sent |
| Something went wrong | We could not submit your request |
| Continue / Next / Done | Review Request / Confirm Pickup / Confirm Return |

---

## 2. Motion tokens

All animation values live in **`src/theme/motion.ts`**. Do not scatter durations through the app.

| Token | Value | Use |
|---|---|---|
| `motionDuration.instant` | 80 ms | press feedback |
| `motionDuration.fast` | 120 ms | micro-transitions, focus rings |
| `motionDuration.standard` | 180 ms | toasts, status changes |
| `motionDuration.deliberate` | 240 ms | sheets, menus, deliberate reveals |
| `motionDuration.completion` | 300 ms | important completed states |

Easing (React Native `Easing.bezier`):

- `motionEasing.standard` — `[0.2, 0, 0, 1]` — predictable settle, default.
- `motionEasing.enter` — `[0.16, 1, 0.3, 1]` — quick start, soft landing.
- `motionEasing.exit` — `[0.4, 0, 1, 1]` — controlled departure.

Press constraints: `pressMotion.pressedScale` = **0.992** (cards/pressables), `buttonPressedScale` = **0.985** (primary/destructive buttons), `pressedTranslateY` = **1 px max**.

### Reduced motion

`usePrefersReducedMotion()` (in `motion.ts`) subscribes to the OS setting. When enabled:

- Press scale/translation effects are skipped.
- Sheet/toast slides become instant fades.
- Status-rail fill jumps instead of animating.
- The app remains fully usable — state changes are immediate.

---

## 3. Button matrix

`AppButton` (`src/components/ui/AppButton.tsx`), built on `AlpinePressable`.

| Variant | Resting | Pressed | Disabled | Use |
|---|---|---|---|---|
| `primary` | lime `#C8FF3D`, dark text, radius 8, ≥52 px | `#91C900`, scale 0.985, 80 ms | `#ECEEEF` bg, `#6F767A` text, no border | single most important action per screen |
| `secondary` | white/neutral surface, 1 px graphite border, high-contrast label | surface tint | muted border + muted text | meaningful alternative |
| `tertiary` | transparent, text primary | subtle surface tint | muted text | quiet text action (View Details, Edit) |
| `destructive` | dark red surface, error-red label, error border | darker surface | muted palette | irreversible actions — explicit label + confirm |
| `ghost` | transparent, text secondary | subtle surface tint | muted text | lowest emphasis (Clear All, Sign Out) |

Sizes: `small` (40 px + hit slop), `medium` (52 px), `large` (56 px).

**Rules**

- Labels are specific verbs ("Search Gear", "Submit Request", "Confirm Pickup"). Avoid "Continue/Next/Done" unless the destination is obvious.
- **Disabled is never opacity alone** — explicit muted palettes keep text readable.
- **Loading** — size and width are preserved, the label stays in the tree (container `accessibilityLabel` keeps it available to screen readers), an inline spinner replaces the icon slot, `busy` is announced, and presses are blocked.
- **Duplicate submissions** are blocked by an internal 120 ms guard until the caller's `loading` state propagates.
- Haptics: primary/destructive fire `haptics.action()`; other variants fire `haptics.selection()`.

### Icon buttons

`IconButton` — min 44×44 target, visible pressed state (neutral surface), `haptics.selection()`, expanded hit slop, mandatory `accessibilityLabel`. Never render a bare icon without a touch surface.

---

## 4. Pressable behaviour

`AlpinePressable` (`src/components/ui/AlpinePressable.tsx`) is the shared restrained pressable.

- Press-in: scale to 0.992 (80 ms, standard easing), optional background/border emphasis via `pressedStyle`.
- Press-out: restore in 120 ms. No elevation, no bounce, no glow.
- `haptic`: opt-in `'selection' | 'action'` fired on press-in; never on disabled.
- Disabled controls receive **no** press handlers (props are dropped) and no haptics.
- Reduced motion: scale effects are skipped entirely.
- `Card`, `Chip`, `ActivityChip`, `IconButton`, `AppButton`, and interactive list rows build on this primitive.

### Cards

- Pressable cards: subtle background shift + border emphasis, max scale 0.992, max 1 px movement.
- **Selected cards**: one clear signal — lime edge or lime radio indicator. Never fill a whole card with lime.
- **Unavailable cards**: keep content readable and state the specific reason ("Unavailable for selected dates", "Listing paused", "Outside pickup radius").

### Listing cards — priority order

1. Equipment image 2. Name 3. Availability 4. Total/daily price 5. Deposit 6. Distance 7. Owner trust. No multiple badges, owner biographies, or policy text.

---

## 5. Forms

`TextInput` provides persistent labels, inline `error`/`hint`, focus border, and a `required` asterisk.

- Labels never live only in placeholders.
- Validation is inline near the field, with explanatory text — never a bare red outline at submission time.
- Use the right keyboard (`keyboardType`), autofill (`autoComplete`), and `returnKeyType` for predictable focus progression.
- `KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"` keep forms usable.
- **Drafts** (Zustand: `useRentalDraftStore`, `useListingDraftStore`) preserve user progress across interruptions and failed requests — never clear fields after a failed submit.
- Failed submissions keep the entered data and show a specific recovery message (see Error patterns).

---

## 6. Navigation

Expo Router (file-based). **Do not replace the architecture.**

### Stack

Configured in `src/app/_layout.tsx`:

- Forward: `slide_from_right`, 200 ms on iOS; Android uses its native slide.
- Back: native iOS gesture (`gestureEnabled`) and Android hardware back are preserved. Back reverses the transition and restores scroll/form state (react-navigation keeps the previous screen mounted).
- No duplicate route entries — `router.push`/`replace` is used deliberately.
- Modal navigation (filters, sort, date selection) uses bottom sheets, not stack screens.

### Completion navigation

Important completed tasks (request submitted, pickup confirmed, return confirmed) get a short crossfade/upward reveal, one `haptics.success()`, and a clear next action. No confetti, no bouncing.

### Tab bar (`CustomTabBar`)

- Four destinations: Discover, Rentals, Inbox, Account. Neutral white surface, thin top divider, safe-area aware.
- **Active state**: dark icon + label with a 2 px lime top rail. No bounce, no enlargement, no pill, no glow. Max icon movement 1 px.
- **Inactive state**: `graphite500` — muted but visible (never opacity-only).
- `haptics.selection()` fires only when switching tabs (not on re-taps of the active tab).
- **Badges** (`badgeCounts` prop): only for actionable information (unread messages, rentals needing attention). Hidden when zero, capped at `9+`, announced in the accessibility label. Never used for promotion.
- **Tab persistence**: screens stay mounted; Discover scroll, search state, filters, and form drafts survive tab switches.

---

## 7. Headers

`AlpineHeader` (`src/components/navigation/AlpineHeader.tsx`) is the reusable header: 44×44 back target, Space Grotesk title, optional subtitle, up to two trailing actions, transparent over-photography variant with a readable back surface, and a one-pixel divider when content scrolls under it (`scrolled`).

- Never render a custom header alongside the system header.
- No decorative shadows; truncate long titles predictably.
- Screens with bespoke photography headers (listing, rental, search) keep their custom implementations, which follow the same principles.

---

## 8. Status rail

`StatusRail` maps to: **REQUEST — CONFIRMED — PICKUP — ACTIVE — RETURN — COMPLETE** (rendered as four key milestones).

- Current/completed: Signal Lime (muted track for completed). Future: graphite.
- Dispute/error states use error red.
- **Animates only when the status changes** — 240 ms linear fill, short settle, no pulse. Freshly mounted list items render statically.
- Future steps are not tappable.
- Screen-reader description is always present and never colour-only:
  > Rental status: Active. Rental is in progress.

---

## 9. Loading patterns

- The shared loader is `LoadingState` (also exported as `AlpineLoader` from `src/components/feedback/index.ts`) — used only for full-screen initialization.
- **Skeletons** for list content (`ListingCardSkeleton`).
- **Inline button loaders** for submissions (spinner inside the button, size preserved).
- Section-level loaders and pull-to-refresh where appropriate.
- A full-screen initialization loader only when unavoidable (auth boot).
- Never flash an empty state before data finishes loading.
- After a reasonable network failure, show **retry** — don't strand the user.

## 10. Empty and error patterns

**Empty states** are specific and actionable:

- Search: "No gear matches these dates" → Change Dates / Increase Search Radius / Clear Filters.
- Rentals: "No rentals yet" → Find Gear.
- Inbox: "No conversations yet" + when messages will appear.

**Error states** (`ErrorState`) must answer three questions:

1. What happened — "We could not load this content."
2. Was my data preserved — "Your data is safe."
3. What can I do — "Check your connection and try again." + Try Again.

Never surface raw Supabase/network/JS errors. Never navigate the user back to the start after a recoverable failure.

## 11. Toasts

`ToastProvider`:

- Compact, neutral dark surface, semantic icon (success/error/info), specific language, positioned above the tab bar.
- Optional `action` (e.g., Undo) rendered as a lime text action.
- 180 ms enter / 120 ms exit; capped at 3 visible; `accessibilityRole="alert"` + `accessibilityLiveRegion`.
- **Never use toasts for** payment failure, deposit authorization failure, disputes, identity verification, or anything requiring a decision — those need inline error states or dialogs.

---

## 12. Bottom sheets and dialogs

- **Bottom sheets** (`BottomSheet`): filters, sort, date selection, pickup windows, contextual actions. 240 ms slide + backdrop fade (reduced motion: instant), drag-handle affordance, safe-area padding, scrollable content, closes via backdrop tap and Android hardware back.
- **Dialogs** (`AlpineDialog` in `src/components/ui/AlpineDialog.tsx`): destructive confirmation and short irreversible choices only — never long forms or policy text. Destructive dialogs explain consequences before confirming, use the error palette with an explicit label ("Cancel Rental", never "OK"), fire one `haptics.warning()` on open, and use a 240 ms controlled backdrop + subtle scale (reduced motion: instant). Android hardware back and backdrop tap dismiss via `onCancel`. Wired into the rental cancel flow; the platform `Alert` is no longer used for destructive confirms.

---

## 13. Haptic mapping

`haptics` (`src/services/feedback/haptics.ts`), backed by `expo-haptics`.

| Method | Used for |
|---|---|
| `selection()` | tabs, filters, chips, icon buttons |
| `action()` | valid primary submissions, accept/confirm |
| `success()` | important completed processes |
| `warning()` | destructive confirmation |
| `error()` | failed critical actions |

**Never** fire haptics during scroll, on disabled controls, for every navigation, repeatedly during loading, on web, or for trivial automatic updates. Haptics are never the only feedback.

---

## 14. Accessibility

- 44–48 px touch targets everywhere (buttons ≥52, icon buttons 44 + hit slop).
- Screen-reader labels on every interactive element; `busy`, `selected`, `disabled` states exposed.
- Logical focus order; state never communicated by colour alone (status rail has a full description).
- Dynamic font support (`rf()` responsive type); layouts must not break at larger font scales.
- Reduced-motion support (see §2).
- Separate readable descriptions for charges vs deposits (`MoneyText`).

## 15. Platform differences

- **iOS**: native back gesture preserved; `animationDuration` applies to stack transitions; haptics via Core Haptics.
- **Android**: hardware back closes modals/sheets and reverses stack navigation; native activity transitions for the stack.
- **Web**: haptics are a no-op; press feedback is visual only; keyboard navigation works via pressables.

## 16. Network behaviour

Assume unreliable connections:

- Retryable queries (TanStack Query with configured retries).
- Duplicate-submission protection on submit buttons.
- Draft persistence across failures (Zustand stores).
- **Never optimistically confirm** rental acceptance, payment, deposit authorization, pickup, return, or dispute resolution — these require confirmed server responses.

## 17. Auth interruption

Preserve the intended action (`PendingAuthIntent`), present authentication, then return to the exact task:

- `save-listing` → back to the listing
- `message-owner` → back to the listing (owner card)
- `request-rental` → back to the rental request with the draft intact

Users are **never** dropped to Discover after sign-in unless Discover was the original destination.
