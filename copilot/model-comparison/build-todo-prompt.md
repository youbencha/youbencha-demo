## To-Do List Progressive Web App

Create a beautiful, intuitive progressive web app (PWA) for managing multiple to-do lists with local storage persistence.

### Core Features

**Multiple Lists Management**
- Create, rename, and delete multiple to-do lists
- Switch between different lists seamlessly
- Display list count and active list indicator

**Task Management**
- Add new tasks with a simple input interface
- Mark tasks as complete/incomplete with checkbox interaction
- Edit existing task text inline
- Delete individual tasks
- Drag and drop to reorder tasks (optional enhancement)
- Add due dates and priority levels (optional enhancement)

**Data Persistence**
- Store all lists and tasks in browser's localStorage
- Auto-save changes immediately on any modification
- Persist data across browser sessions
- Handle storage quota gracefully

### Technical Requirements

**Progressive Web App (PWA)**
- Service worker for offline functionality
- Web app manifest for installation
- Responsive design for mobile, tablet, and desktop
- Fast load times and smooth animations

**Technology Stack**
Only use html, css, and javascript

### UI/UX Requirements

**Design Principles**
- Clean, modern aesthetic
- Intuitive navigation and interactions
- Accessible (WCAG 2.1 AA compliant)
- Smooth transitions and micro-interactions
- Empty states with helpful messaging

**Key UI Components**
- App toolbar with title and list selector
- Sidebar or dropdown for list navigation
- Main content area for displaying tasks
- Floating action button (FAB) for adding new tasks
- Bottom sheet or dialog for list management
- Confirmation dialogs for destructive actions

### Acceptance Criteria

- [ ] User can create and name multiple to-do lists
- [ ] User can add tasks to any list
- [ ] User can check/uncheck tasks to mark completion
- [ ] User can delete tasks and lists
- [ ] All data persists after browser refresh
- [ ] App works offline after initial load
- [ ] App is responsive on all screen sizes
- [ ] App can be installed as a PWA on mobile devices
- [ ] Clear visual feedback for all user actions
