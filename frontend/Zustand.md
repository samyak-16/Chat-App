# 📌 Basic Overview of State Management using Zustand

---

## 1. Import `create`

```js
import { create } from 'zustand';
```

## 2. Create a Store (Custom Hook)

```js
const useStore = create((set) => ({
  // state (data)
  count: 0,

  // actions (functions to update state)
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

- create takes a callback function.
- This callback receives a function called set.
- set is used to update the store.
- The callback must return an object containing:
- State (e.g. count)
- Actions (e.g. increment, reset)

## 3. How set Works

```js
set({ count: 5 });
```

- set takes an object ({}) and merges it into the store.
- All subscribed components automatically update.

### Example with function form:

```js
set((state) => ({ count: state.count + 1 }));
```

- Useful when new state depends on old state.

## 4. Use Store in Components

```jsx
function Counter() {
  const { count, increment, reset } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

- useStore() is a hook (just like useState).
- Components re-render automatically when subscribed values change.

## ✅ In One Line

- Zustand lets you create a global store using create().
- create() → takes a callback with set.
- set({ ... }) → updates the state object.
- The returned hook (useStore) is used in components to access state + actions.

---

---

---

# Zustand Store Access: Selector vs Destructuring

When using Zustand, there are **two main ways** to access store state and actions in a component:

---

## 1️⃣ Destructuring the Entire Store

```js
const { user, setUser, logout } = useAuth();
```

### How it works:

- useAuth() returns the entire store object (state + actions).
- You destructure the parts you need.

### Cons:

- Component subscribes to the entire store.
- Any change in any part of the store triggers a re-render.
- Can cause unnecessary re-renders in larger apps.

## 2️⃣ Using a Selector Function

```js
const setUser = useAuth((state) => state.setUser);
```

### How it works:

- Pass a selector function to the hook.
- state represents the entire store, but the selector returns only what you need.
- The component subscribes only to the selected value.

### Pros:

- Efficient: re-renders only when the selected value changes.
- Cleaner for components that need only specific actions.
- Better performance in large-scale apps.

## 🔑 Key Differences

| Aspect             | Destructuring                             | Selector                                           |
| ------------------ | ----------------------------------------- | -------------------------------------------------- |
| Access             | Whole store, then pick values             | Only selected value(s)                             |
| Re-render behavior | Re-renders on any store change            | Re-renders only if selected value changes          |
| Syntax             | `const { x, y } = useStore()`             | `const x = useStore(state => state.x)`             |
| Use case           | Small/simple apps, multiple values needed | Large apps, performance-sensitive, specific values |
