# Step-by-Step: Update Visual Paradigm Class Diagram for Rubric & Code Alignment

This guide aligns your class diagram with (1) the **Final Project rubric** (MVC + 2 patterns, labeled) and (2) the **current codebase** so the "Aligns with Object Model" criterion is satisfied.

---

## Part 1 — Label MVC (Rubric: "Exhibits MVC" — 15 pts)

The rubric requires you to **label the model, the view, and the controller**.

### Step 1.1: Add three package/group labels on the diagram

1. Create a **package** or **subsystem** (depending on your tool) named **«Model»**.
2. Move or draw the following **inside** the Model package:
   - **Interfaces:** `Alert`, `Resource`, `SafeSpace`, `CommunityEvent`, `ICEReport`
   - **Enumeration:** `Category`
   - *(Optional but good for “one class per file”)* Add a type/class **`CommunityGroup`** (enumeration or type) if you show it on App.
3. Create a **package** named **«View»**.
4. Move or draw the following **inside** the View package:
   - `SearchBar`, `AlertBanner`, `RedCardViewer`, `ICEReportForm`, `SafeSpaceCard`, `ResourceCard`, `EventCard`, `CategoryFilter`, `CommunityFilter`, `ThemeToggle`
5. Create a **package** named **«Controller»**.
6. Put **only** the **`App`** class inside the Controller package.
7. Add a short **note** or **stereotype** on each package:  
   **Model** = “Data types and domain entities (one file per type in `models/`).”  
   **View** = “UI components in `components/`; receive data via props, no business logic.”  
   **Controller** = “App: owns state, handles events, wires Model and View.”

Result: A reviewer can immediately see **Model**, **View**, and **Controller** and how they map to your project.

---

## Part 2 — Add Observer Pattern (Rubric: "Exhibits pattern #1" — 15 pts)

The code uses the **Observer** pattern for alerts: a Subject notifies Observers when a new alert is published.

### Step 2.1: Add Observer interfaces and concrete class

1. Add an **«interface»** named **`AlertObserver`**  
   - **Method:** `update(alert: Alert): void`
2. Add an **«interface»** named **`AlertSubject`**  
   - **Methods:**  
     - `attach(observer: AlertObserver): void`  
     - `detach(observer: AlertObserver): void`  
     - `notifyObservers(alert: Alert): void`
3. Add a **class** **`AlertStore`** that **implements** `AlertSubject`  
   - **Attributes:**  
     - `observers: AlertObserver[]` (private)  
     - `instance: AlertStore` (private static — Singleton)  
   - **Methods:**  
     - `getInstance(): AlertStore` (static)  
     - `attach(observer: AlertObserver): void`  
     - `detach(observer: AlertObserver): void`  
     - `notifyObservers(alert: Alert): void`  
     - `publishAlert(alert: Alert): void`  
     - `publishICEReport(report: ICEReport): void`
4. Draw:
   - **Realization** from `AlertStore` to `AlertSubject`.
   - **Dependency** from `AlertStore` to `Alert` and to `ICEReport` (it uses them in method parameters).
   - **Association** from `AlertSubject` to `AlertObserver`: Subject knows Observers (e.g. multiplicity 0..* on Observer side).

### Step 2.2: Show App as an Observer

5. Draw a **dependency** or **realization** from **`App`** to **`AlertObserver`** (App implements the observer role).
6. Draw an **association** from **`App`** to **`AlertStore`**: e.g. “uses” or “observes” with role name like `alertStore` (getInstance()), multiplicity 1.
7. Add a **note** or **stereotype** near this group: **«Observer Pattern»** — “AlertStore (Subject) notifies registered Observers (e.g. App) when publishAlert() or publishICEReport() is called.”

### Step 2.3: Optional — Show API services as publishers

8. *(Optional)* Add classes **`WeatherAlertService`** and **`EmergencyAlertService`** with a method such as `fetchAndPublish()` and a dependency to **`AlertStore`** (they call `publishAlert()`). This shows that more than one publisher uses the same Subject.

---

## Part 3 — Add Strategy Pattern (Rubric: "Exhibits pattern #2" — 15 pts)

The code uses **Strategy** for filtering: a context applies one or more filter strategies to a list of resources.

### Step 3.1: Add Strategy interface and concrete strategies

1. Add an **«interface»** named **`FilterStrategy<T>`** (or `FilterStrategy` if your tool does not support generics)  
   - **Method:** `filter(items: T[]): T[]`
2. Add **concrete strategy** classes that **implement** `FilterStrategy<Resource>` (or `FilterStrategy`):  
   - **`CategoryFilterStrategy`**  
     - Attribute: `category: Category` (private)  
     - Method: `filter(resources: Resource[]): Resource[]`  
   - **`CommunityFilterStrategy`**  
     - Attributes: `selectedCommunities: CommunityGroup[]`, `communityMap: Record<string, CommunityGroup>`  
     - Method: `filter(resources: Resource[]): Resource[]`  
   - **`SearchFilterStrategy`**  
     - Attribute: `query: string`  
     - Method: `filter(resources: Resource[]): Resource[]`
3. Draw **realization** from each concrete strategy class to **`FilterStrategy`**.

### Step 3.2: Add Context and wire to App

4. Add a **class** **`FilterContext<T>`** (or `FilterContext`)  
   - **Attribute:** `strategies: FilterStrategy<T>[]` (private)  
   - **Methods:**  
     - `addStrategy(strategy: FilterStrategy<T>): FilterContext<T>`  
     - `executeAll(items: T[]): T[]`
5. Draw **composition** or **aggregation** from **`FilterContext`** to **`FilterStrategy`**: context holds 1..* strategies.
6. Draw **dependency** from **`App`** to **`FilterContext`** and to **`Resource`**: App creates FilterContext, adds strategies, and calls executeAll(resources).
7. Add a **note** or **stereotype**: **«Strategy Pattern»** — “FilterContext applies interchangeable FilterStrategy objects to filter resources; App builds the context and gets filtered results.”

---

## Part 4 — Align Diagram with Code (Rubric: "Aligns with Object Model" — 15 pts)

These updates make the diagram match the actual types and components.

### Step 4.1: Remove obsolete attributes and methods

1. **RedCardViewer**  
   - **Remove** attribute `isDark: boolean` and method `checkDarkMode(): void` (no longer in code).
2. **ICEReportForm**  
   - **Remove** attribute `isDark: boolean` and method `checkDarkMode(): void`.

### Step 4.2: Align interfaces with model files

3. **«interface» SafeSpace**  
   - **Remove** `description: string` (not in `SafeSpace.ts`).  
   - **Add** `type: 'sanctuary' | 'shelter' | 'community-center'` (or a short type name).  
   - Ensure: `id`, `name`, `address`, `phone`, `available24h: boolean`.
4. **«interface» ICEReport**  
   - **Add** (optional in diagram if you show optionality): `vehicleDescription?: string`, `numberOfOfficers?: string`, `contactInfo?: string`, `timestamp: Date`.  
   - Keep: `id`, `location`, `time`, `date`, `description`, `isAnonymous`.
5. **«interface» Alert**  
   - **Add** optional `icon?: 'ice' | 'weather' | 'safety'` if you list attributes in full.
6. **«interface» CommunityEvent**  
   - Use **`targetCommunities?: string[]`** (not `servingCommunities`).  
   - **Add** `isFree: boolean`, `registration?: string`.  
   - **Remove** `phone` and `accessibilityFeatures` if your `CommunityEvent` model does not have them (current code does not).

### Step 4.3: Align App with current behavior

7. **App**  
   - You can **keep** `filterResources(): Resource[]` and `filterEvents(): CommunityEvent[]` as the *result* of filtering, and add a note: “Implemented via FilterContext + FilterStrategy (Strategy pattern).”  
   - **Add** (optional): reference to **`FilterContext`** (e.g. dependency or association) so the diagram shows App using the Strategy context.  
   - **Add** state related to toasts if you want to show it: e.g. `toasts: ToastData[]` and `showToast(...)`, or omit for simplicity.

### Step 4.4: Optional — Show one-class-per-file (rubric)

8. If the rubric is interpreted as “each class in its own file,” ensure every **class** and **interface** on the diagram corresponds to a **single file** in the project (e.g. `Alert.ts`, `AlertStore.ts`, `FilterStrategy.ts`, etc.). You can add a short note: “Each class/interface resides in its own file under `models/`, `patterns/observer/`, or `patterns/strategy/`.”

---

## Part 5 — Final Checklist

Before submitting Visual Paradigm II:

- [ ] **MVC** is clearly **labeled** (Model, View, Controller packages/stereotypes and contents).
- [ ] **Pattern #1 (Observer)** is shown: `AlertObserver`, `AlertSubject`, `AlertStore`, and App as observer; optionally WeatherAlertService / EmergencyAlertService.
- [ ] **Pattern #2 (Strategy)** is shown: `FilterStrategy`, `CategoryFilterStrategy`, `CommunityFilterStrategy`, `SearchFilterStrategy`, `FilterContext`, and App using FilterContext.
- [ ] **RedCardViewer** and **ICEReportForm** no longer have `isDark` or `checkDarkMode()`.
- [ ] **SafeSpace**, **ICEReport**, **Alert**, and **CommunityEvent** match the attributes in `models/` (see Step 4.2).
- [ ] **App** is the only class in the Controller; View components are in View; model types are in Model.
- [ ] A brief **note** or **stereotype** near each pattern group explains the pattern in one line.

---

## Quick Reference — File-to-Diagram Mapping

| Diagram element     | Code location |
|---------------------|---------------|
| Model (Alert, etc.) | `src/app/models/*.ts` |
| View (all cards, filters, etc.) | `src/app/components/*.tsx` |
| Controller         | `App` in `src/app/App.tsx` |
| AlertObserver       | `patterns/observer/AlertObserver.ts` |
| AlertSubject        | `patterns/observer/AlertSubject.ts` |
| AlertStore          | `patterns/observer/AlertStore.ts` |
| FilterStrategy      | `patterns/strategy/FilterStrategy.ts` |
| CategoryFilterStrategy | `patterns/strategy/CategoryFilterStrategy.ts` |
| CommunityFilterStrategy | `patterns/strategy/CommunityFilterStrategy.ts` |
| SearchFilterStrategy   | `patterns/strategy/SearchFilterStrategy.ts` |
| FilterContext       | `patterns/strategy/FilterContext.ts` |

Using this guide, your Visual Paradigm diagram will satisfy the rubric (MVC + two patterns, clearly identified) and align with the object model in your code.
