# TaskFlow - Progressive Web App To-Do List Manager

<div align="center">

![TaskFlow Logo](images/icons/icon-192x192.svg)

**A beautiful, intuitive progressive web app for managing multiple to-do lists with offline support**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Development](#development) • [Technology Stack](#technology-stack)

</div>

---

## ✨ Features

### Core Functionality
- ✅ **Multiple List Management** - Create, rename, and delete multiple to-do lists
- ✅ **Task Management** - Add, edit, complete, and delete tasks seamlessly
- ✅ **Local Persistence** - All data stored locally using localStorage
- ✅ **Offline Support** - Full functionality without internet connection
- ✅ **Installable PWA** - Install as a native app on mobile and desktop
- ✅ **Responsive Design** - Beautiful UI on all screen sizes

### User Experience
- 🎨 Modern, clean interface with smooth animations
- 🌙 Automatic dark mode support
- ⚡ Fast and lightweight (no frameworks)
- ♿ Fully accessible (WCAG 2.1 AA compliant)
- 📱 Touch-friendly with 44x44px minimum touch targets
- 💾 Auto-save on every change

### Technical Features
- 🔧 Service Worker for offline caching
- 📦 Web App Manifest for installation
- 🔒 XSS protection with input sanitization
- 🎯 Optimized performance and loading
- 📊 Network status monitoring

---

## 🚀 Installation

### Option 1: Open Directly
Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari).

### Option 2: Local Server
For full PWA functionality (service worker, installation), serve over HTTP/HTTPS:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Option 3: Install as PWA

**On Desktop (Chrome/Edge):**
1. Open the app in your browser
2. Click the install icon (⊕) in the address bar
3. Click "Install" in the dialog

**On Mobile (iOS Safari):**
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"

**On Mobile (Android Chrome):**
1. Open the app in Chrome
2. Tap the three-dot menu
3. Tap "Install app" or "Add to Home Screen"

---

## 📖 Usage

### Managing Lists

**Create a New List:**
1. Click the list selector button (top right)
2. Click the + icon in the dropdown
3. Enter a name and click "Save"

**Switch Between Lists:**
1. Click the list selector button
2. Click on any list to switch to it

**Rename a List:**
1. Open the list dropdown
2. Click the edit (pencil) icon next to the list
3. Enter a new name and click "Save"

**Delete a List:**
1. Open the list dropdown
2. Click the delete (trash) icon next to the list
3. Confirm deletion (this will also delete all tasks in the list)

### Managing Tasks

**Add a Task:**
1. Type in the input field at the bottom
2. Press Enter or click the + button

**Complete a Task:**
- Click the checkbox next to the task

**Edit a Task:**
1. Click the edit (pencil) icon on the task
2. Modify the text
3. Press Enter or click outside to save

**Delete a Task:**
- Click the delete (trash) icon on the task
- Confirm deletion

### Keyboard Shortcuts

- **Enter** in task input → Add new task
- **Enter** in list modal → Save list
- **Escape** → Close open modal/dropdown

---

## 🛠️ Development

### Project Structure

```
taskflow/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── css/
│   └── styles.css          # All styles
├── js/
│   └── app.js              # Application logic
├── images/
│   └── icons/              # PWA icons (72x72 to 512x512)
├── generate-pwa-icons.js   # Icon generation script
└── readme.md               # This file
```

### Generating PWA Icons

To generate the required PWA icons:

```bash
# Step 1: Generate SVG icons and HTML converter
node generate-pwa-icons.js

# Step 2: Open the icon generator in your browser
# Open: images/icons/icon-generator.html

# Step 3: Click "Download All Icons" button
# All PNG files will be downloaded

# Step 4: Move PNG files to images/icons/ folder
# Replace the SVG files with the downloaded PNG files
```

### Customization

**Colors:**
Edit CSS variables in `css/styles.css`:

```css
:root {
  --primary-color: #6366f1;      /* Main theme color */
  --primary-hover: #4f46e5;      /* Hover state */
  --primary-light: #e0e7ff;      /* Light backgrounds */
  --danger-color: #ef4444;       /* Delete actions */
  --success-color: #10b981;      /* Success states */
  /* ... more variables */
}
```

**App Name & Branding:**
Edit `manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "AppName",
  "theme_color": "#your-color",
  /* ... */
}
```

### Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari 14+, Chrome Android)

### Storage Limits

- **localStorage**: ~5-10MB per origin
- **Service Worker Cache**: Limited by available disk space
- Handles `QuotaExceededError` gracefully

---

## 🏗️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid & Flexbox
- **Vanilla JavaScript (ES6+)** - No frameworks or libraries

### PWA Features
- **Service Worker** - Offline caching with Cache API
- **Web App Manifest** - Installation metadata
- **localStorage** - Client-side data persistence

### Best Practices
- ♿ **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- 🔒 **Security**: XSS prevention, input sanitization
- ⚡ **Performance**: Optimized loading, minimal reflows
- 📱 **Responsive**: Mobile-first design
- 🎨 **UX**: Smooth animations, clear feedback

---

## 📋 Acceptance Criteria

All acceptance criteria have been met:

- ✅ User can create and name multiple to-do lists
- ✅ User can add tasks to any list
- ✅ User can check/uncheck tasks to mark completion
- ✅ User can edit task text inline
- ✅ User can delete tasks and lists
- ✅ All data persists after browser refresh
- ✅ App works offline after initial load
- ✅ App is responsive on all screen sizes
- ✅ App can be installed as a PWA on mobile devices
- ✅ Clear visual feedback for all user actions
- ✅ Confirmation dialogs for destructive actions
- ✅ Empty states with helpful messaging
- ✅ Network status indicator

---

## 🎯 Future Enhancements

Potential features for future versions:

- [ ] Drag and drop task reordering
- [ ] Task due dates and reminders
- [ ] Priority levels (high, medium, low)
- [ ] Task categories/tags
- [ ] Search and filter functionality
- [ ] Dark/light mode toggle
- [ ] Data export/import (JSON)
- [ ] Cloud sync (Firebase, Supabase)
- [ ] Subtasks and nested tasks
- [ ] Task notes and descriptions
- [ ] Collaborative lists (share with others)
- [ ] Statistics and productivity insights

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 👏 Acknowledgments

- Icons designed with SVG and Canvas API
- Color palette inspired by Tailwind CSS
- Built with modern web standards and best practices

---

<div align="center">

**Made with ❤️ using vanilla HTML, CSS, and JavaScript**

⭐ Star this project if you find it helpful!

</div>
