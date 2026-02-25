# CMSC-5633 Final Project Presentation
## Community Resources App — Design Patterns in Practice

**Time limit: 8 minutes** (−4 pts per 30 seconds over)

Use this as a script or copy each slide into Google Slides / PowerPoint. Suggested times are in **[brackets]**.

---

## Slide 1: Title (≈30 sec)

**Community Resources App**  
*Oklahoma — Find Help, Stay Safe, Together*

- **Course:** CMSC-5633 Patterns of Object-Oriented Systems  
- **Project:** Real-world web app with MVC + 2 design patterns  
- **Today:** App overview, how patterns are used in code, and a short demo  

**Speaker note:** State your name and that you’ll cover the app, MVC, Observer, Strategy, and a live demo in under 8 minutes.

---

## Slide 2: App Overview — What It Is [≈1 min]

**What the app does**

- **One place** for community resources across Oklahoma (OKC, Tulsa, Edmond, Norman, Lawton, Stillwater).
- **Active alerts:** Weather (NWS API), emergency alerts, and user-reported ICE activity — all in one feed.
- **Find resources:** Food banks, health clinics, legal aid, cultural centers, housing, childcare — filter by category and community.
- **Safe spaces:** Shelters and day shelters (e.g., YWCA OKC, DVIS Tulsa, Food & Shelter Norman).
- **Events:** Pride, powwows, workshops, cultural festivals — with dates and locations.
- **Know Your Rights:** View/print rights card; report ICE activity with a form that publishes to the alert system.

**Speaker note:** Emphasize “real-world”: real Oklahoma addresses, phone numbers, and APIs. It has a GUI and is built with React + TypeScript.

---

## Slide 3: App Overview — Who It’s For [≈30 sec]

**Audience**

- **Immigrant and refugee communities** — legal aid, DACA clinics, refugee resettlement, know-your-rights.
- **Anyone in need** — food pantries, free clinics, emergency housing, mental health (sliding scale).
- **LGBTQ+, Native American, Latino, Black, Muslim, disability communities** — culturally specific resources and events.
- **General public** — severe weather and emergency alerts in one place.

**Speaker note:** One sentence: “The app serves multiple communities across Oklahoma with one consistent interface.”

---

## Slide 4: Rubric — What This Presentation Covers [≈20 sec]

**Presentation rubric (75 pts)**

| Criterion              | Points |
|------------------------|--------|
| Organization & Clarity | 10     |
| Explains pattern #1    | 15     |
| Explains pattern #2    | 15     |
| Explains MVC          | 15     |
| Demo                  | 20     |
| **Total**             | **75** |

**Today:** We’ll hit each of these: structure (clarity), then MVC, then Observer (pattern #1), then Strategy (pattern #2), then demo.

**Speaker note:** Quick signpost so the grader knows you’re following the rubric.

---

## Slide 5: MVC — What It Is [≈45 sec] *(Explains MVC — 15 pts)*

**Model–View–Controller**

- **Model:** Data only. No UI. Types like `Alert`, `Resource`, `SafeSpace`, `CommunityEvent`, `ICEReport`, `Category`, `CommunityGroup`. One file per type under `src/app/models/`.
- **View:** UI only. React components that receive data via props and render it. No business logic. Examples: `AlertBanner`, `ResourceCard`, `SearchBar`, `CategoryFilter`, `RedCardViewer`, `ICEReportForm`. All under `src/app/components/`.
- **Controller:** One place that owns state and logic — **App** in `App.tsx`. It holds `alerts`, `resources`, `events`, filter state, and toggles. It uses the Model types, calls the Observer and Strategy code, and passes data and callbacks down to the View components.

**Speaker note:** “Model = data and types. View = components. Controller = App. That’s our MVC.”

---

## Slide 6: MVC — Where in the Code [≈30 sec]

**File layout**

```
src/app/
├── models/          ← Model (Alert.ts, Resource.ts, SafeSpace.ts, …)
├── components/      ← View (AlertBanner, ResourceCard, SearchBar, …)
├── App.tsx          ← Controller (state, filter logic, observer registration)
└── patterns/
    ├── observer/    ← Pattern #1
    └── strategy/    ← Pattern #2
```

- **Controller** registers as an observer and builds the filter context in `App.tsx`.
- **View** never filters data or talks to APIs; it only displays what the Controller passes.

**Speaker note:** “Every class or type lives in its own file, and the diagram matches this structure.”

---

## Slide 7: Pattern #1 — Observer [≈1 min] *(Explains pattern #1 — 15 pts)*

**What the Observer pattern does**

- **Subject** holds a list of **Observers** and notifies them when something happens.
- **Observers** implement an `update()` method so they can react without the Subject knowing their internals.

**In our app**

- **Subject:** `AlertStore` (Singleton). Methods: `attach(observer)`, `detach(observer)`, `notifyObservers(alert)`, `publishAlert(alert)`, `publishICEReport(report)`.
- **Observers:** Any object that implements `AlertObserver` (interface with `update(alert)`). **App** registers itself in a `useEffect`: when the store publishes an alert, App’s `update()` runs and does `setAlerts(prev => [alert, ...prev])`.
- **Publishers:** ICE report form calls `AlertStore.getInstance().publishICEReport(report)`. Weather and emergency services call `publishAlert(alert)`. Same channel, no coupling between form and App.

**Speaker note:** “One subject, many possible observers. Adding a new alert source doesn’t change App; it just publishes to the store.”

---

## Slide 8: Pattern #1 — Observer (Code Snippet) [≈20 sec]

**App registers as observer** (`App.tsx`)

```ts
useEffect(() => {
  const observer: AlertObserver = {
    update: (alert: Alert) => setAlerts(prev => [alert, ...prev]),
  };
  const store = AlertStore.getInstance();
  store.attach(observer);
  return () => store.detach(observer);
}, []);
```

**Form publishes** (no reference to App)

```ts
const handleICEReportSubmit = (report: ICEReport) => {
  AlertStore.getInstance().publishICEReport(report);
  showToast('Report submitted. The community has been notified.', 'success');
};
```

**Speaker note:** “Form doesn’t call setState or know about App. It only talks to AlertStore; the store notifies App.”

---

## Slide 9: Pattern #2 — Strategy [≈1 min] *(Explains pattern #2 — 15 pts)*

**What the Strategy pattern does**

- **Context** has a list of **Strategy** objects. Each strategy encapsulates one way to filter (or process) data.
- You can add, remove, or swap strategies without changing the Context or the client.

**In our app**

- **Strategy interface:** `FilterStrategy<T>` with `filter(items: T[]): T[]`.
- **Concrete strategies:** `CategoryFilterStrategy`, `CommunityFilterStrategy`, `SearchFilterStrategy` — each takes different parameters (category, selected communities + map, query) and returns filtered `Resource[]`.
- **Context:** `FilterContext<T>` with `addStrategy()` and `executeAll(items)`. It runs each strategy in sequence; output of one is input to the next.
- **Client:** **App** builds the context in a `useMemo`: creates `FilterContext`, adds the three strategies, calls `executeAll(resources)` to get `filteredResources`. Events are filtered separately (same idea could be extended with event strategies).

**Speaker note:** “Instead of one big if-else filter, we have pluggable strategies. Adding a new filter = new class + one addStrategy call.”

---

## Slide 10: Pattern #2 — Strategy (Code Snippet) [≈20 sec]

**App uses FilterContext** (`App.tsx`)

```ts
const filteredResources = useMemo(() => {
  if (selectedCategory === 'events') return [];
  const context = new FilterContext<Resource>();
  context.addStrategy(new CategoryFilterStrategy(selectedCategory));
  context.addStrategy(new CommunityFilterStrategy(selectedCommunities, communityMap));
  context.addStrategy(new SearchFilterStrategy(searchQuery));
  return context.executeAll(resources);
}, [selectedCategory, selectedCommunities, searchQuery]);
```

**Speaker note:** “Context doesn’t know what each strategy does — it just calls filter() in order. That’s Strategy in action.”

---

## Slide 11: Demo — What You’ll See [≈30 sec] *(Demo — 20 pts)*

**Live demo (aim for ~2 minutes)**

1. **Home:** Alerts at top, Know Your Rights banner, Safe Spaces toggle, then search + filters + resource and event cards.
2. **Filters:** Change category (e.g. Food, Legal); add community filter; type in search — results update (Strategy in action).
3. **View/Print Rights Card:** Open modal, switch language, show print — View component, data from Model.
4. **Report ICE Activity:** Open form, show validation and sections, submit — then show new alert at top and toast (Observer: form → AlertStore → App → AlertBanner).
5. **Safe Spaces:** Toggle Safe Spaces, show OKC/Tulsa/Norman shelters with addresses and phones.
6. **Alerts:** Expand “How to Stay Safe” on an alert (round button, readable list).

**Speaker note:** Keep demo tight. Say “This is the Controller updating state,” “This is the Observer notifying the UI,” “This is the Strategy filtering the list.”

---

## Slide 12: Summary [≈20 sec]

**What we showed**

- **App:** Community resources and alerts for Oklahoma (real data, real APIs).
- **MVC:** Model = `models/`, View = `components/`, Controller = `App.tsx`.
- **Observer:** `AlertStore` (Subject) + `AlertObserver`; App and API services publish alerts; App observes and updates the list.
- **Strategy:** `FilterContext` + `CategoryFilterStrategy`, `CommunityFilterStrategy`, `SearchFilterStrategy`; App gets filtered resources without hard-coded filter logic.
- **Code:** One class/interface per file; diagram aligned with this structure.

**Speaker note:** One sentence per bullet. Then: “Demo is next” or “Thank you — questions?”

---

## Slide 13: Thank You / Q&A

**Thank you**

- **Repo / diagram:** [Optional: one line on where to find the code and the updated Visual Paradigm diagram.]
- **Questions?**

**Speaker note:** Invite questions. If asked “Why Observer?” — “So we can add weather and emergency APIs without touching the form or App’s state logic.” If “Why Strategy?” — “So we can add a new filter (e.g. distance) by adding one class and one line in App.”

---

## Timing Summary (Stay Under 8 Minutes)

| Slide(s)     | Content           | Time   |
|-------------|-------------------|--------|
| 1           | Title             | 0:30   |
| 2–3         | App overview      | 1:30   |
| 4           | Rubric signpost   | 0:20   |
| 5–6         | MVC               | 1:15   |
| 7–8         | Observer          | 1:20   |
| 9–10        | Strategy          | 1:20   |
| 11          | Demo intro        | 0:30   |
| **Demo**    | Live app          | **2:00** |
| 12–13       | Summary + thanks  | 0:40   |
| **Total**   |                   | **~7:45** |

Adjust demo length to stay under 8:00; if you run long, shorten overview or pattern slides.
