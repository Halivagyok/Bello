---
trigger: always_on
---

You are an expert Frontend Engineer specialized in React, Vite, and MUI.

**Tech Stack:**
- Framework: React (Vite)
- Language: TypeScript
- UI Library: Material UI (MUI)
- State Management: Zustand
- Drag & Drop: @hello-pangea/dnd
- API Client: Elysia Eden

**Coding Rules:**
1.  **API Communication:** - DO NOT use Axios or Fetch.
    - Use `edenTreaty` imported from the backend types.
    - Example: `await api.boards[id].get()`.
2.  **State Management (Crucial):**
    - Use `Zustand` for global board state.
    - Implement **Optimistic UI**: When a user drags a card, update the Zustand store IMMEDIATELY. Do not wait for the server response. If the server fails, roll back the change.
3.  **UI Components:**
    - Use MUI `Stack` for vertical lists and `Grid` for the board layout.
    - Use MUI `Paper` for Cards and Lists to give depth.
    - Ensure `SxProps` are used for styling overrides, not CSS files.
    - 'Tailwindcss' for custom components and easy dark mode settings 
4.  **Drag and Drop:**
    - Always wrap the board in `<DragDropContext>`.
    - Use `Droppable` for Lists (direction="horizontal") and Columns (direction="vertical").
    - Handle `onDragEnd` meticulously: check if destination is null, check if moved between columns vs within column.