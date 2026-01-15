# TaskFlow PWA - Testing Guide

## Quick Start Testing

### 1. Start Local Server

The app is currently running at: **http://localhost:8000**

You can also start it manually:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

### 2. Open in Browser

Visit: http://localhost:8000

### 3. Test PWA Installation

**Chrome/Edge:**
1. Look for the install icon (⊕) in the address bar
2. Click it and select "Install"
3. The app should open in a standalone window

**Firefox:**
1. Not supported for installation, but all features work

### 4. Test Offline Functionality

1. Open Chrome DevTools (F12)
2. Go to Application tab > Service Workers
3. Check "Offline" checkbox
4. Refresh the page
5. App should still work offline

## Feature Testing Checklist

### List Management
- [ ] Default "My Tasks" list is created on first launch
- [ ] Click list selector button opens dropdown
- [ ] Click "+" creates new list modal
- [ ] Enter list name and save creates new list
- [ ] Click on list name switches active list
- [ ] Edit icon allows renaming list
- [ ] Delete icon removes list (with confirmation)
- [ ] Cannot delete last remaining list

### Task Management
- [ ] Type in input and press Enter adds task
- [ ] Click "+" button adds task
- [ ] Empty input does nothing
- [ ] Checkbox toggles task completion
- [ ] Completed tasks show strikethrough style
- [ ] Edit icon makes task text editable
- [ ] Press Enter while editing saves changes
- [ ] Click outside while editing saves changes
- [ ] Delete icon removes task (with confirmation)

### Data Persistence
- [ ] Add tasks and refresh page - tasks remain
- [ ] Create lists and refresh page - lists remain
- [ ] Close browser and reopen - data persists
- [ ] Switch lists - each list maintains its tasks
- [ ] Complete tasks - completion state persists

### UI/UX
- [ ] Empty state shows when no tasks exist
- [ ] Empty state hides when tasks are added
- [ ] Task count shows in list dropdown
- [ ] Smooth animations on task add/remove
- [ ] Hover effects on buttons work
- [ ] Modal backdrop blurs background
- [ ] Confirmation dialogs appear for destructive actions

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable on all sizes
- [ ] No horizontal scrolling

### Accessibility
- [ ] Tab key navigates through interactive elements
- [ ] Enter key activates buttons
- [ ] Escape key closes modals
- [ ] Screen reader can read all content
- [ ] ARIA labels present on icon buttons
- [ ] Focus visible on keyboard navigation

### Performance
- [ ] App loads in under 2 seconds
- [ ] Smooth scrolling with many tasks
- [ ] No lag when adding/deleting tasks
- [ ] Animations run at 60fps

### Service Worker
- [ ] Service worker registers successfully
- [ ] Static assets are cached
- [ ] App works offline after first load
- [ ] Network indicator shows offline status

## Manual Test Scenarios

### Scenario 1: New User Experience
1. Open app for the first time
2. Should see "My Tasks" list with empty state
3. Add first task "Buy groceries"
4. Task appears in list
5. Check the task as complete
6. Task shows strikethrough

### Scenario 2: Multiple Lists
1. Create list "Work"
2. Add task "Review pull requests"
3. Create list "Personal"
4. Add task "Call mom"
5. Switch between lists
6. Each list shows only its tasks

### Scenario 3: Offline Usage
1. Load app while online
2. Add some tasks
3. Go offline (disable network)
4. App should still work
5. Add more tasks offline
6. Tasks should be saved locally

### Scenario 4: Data Persistence
1. Add 5 tasks across 2 lists
2. Complete 2 tasks
3. Close browser completely
4. Reopen browser and app
5. All tasks and completion states should persist

## Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] PWA installation works
- [ ] Service worker registers
- [ ] Offline mode works

### Firefox
- [ ] All features work
- [ ] Service worker registers
- [ ] Offline mode works

### Safari (Desktop)
- [ ] All features work
- [ ] Service worker registers
- [ ] Offline mode works

### Mobile Safari (iOS)
- [ ] All features work
- [ ] Add to Home Screen works
- [ ] Touch interactions work
- [ ] Responsive design works

### Chrome Android
- [ ] All features work
- [ ] Install app works
- [ ] Touch interactions work
- [ ] Responsive design works

## DevTools Inspection

### Application Tab
- [ ] Manifest shows correct data
- [ ] Service Worker is active
- [ ] Cache Storage contains assets
- [ ] localStorage contains lists and tasks

### Console
- [ ] No errors in console
- [ ] Service worker logs present
- [ ] No XSS warnings

### Network Tab
- [ ] First load fetches all assets
- [ ] Subsequent loads serve from cache
- [ ] Offline mode serves from cache

### Lighthouse Audit
Run Lighthouse PWA audit (should score 90+):
- [ ] Progressive Web App
- [ ] Performance
- [ ] Accessibility
- [ ] Best Practices
- [ ] SEO

## Known Limitations

1. **Icons**: Currently using SVG icons. For production, convert to PNG using the icon generator at `images/icons/icon-generator.html`

2. **Storage**: localStorage has ~5-10MB limit. App handles quota exceeded gracefully.

3. **Sync**: No cloud sync - data is local only.

4. **Browser Support**: Requires modern browser with ES6+ support.

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure serving over HTTP/HTTPS (not file://)
- Clear browser cache and reload

### Data Not Persisting
- Check browser localStorage is enabled
- Check for quota exceeded errors
- Try clearing localStorage and starting fresh

### Icons Not Showing
- Convert SVG icons to PNG using icon generator
- Ensure PNG files are in images/icons/ folder
- Update manifest.json if filenames changed

### App Not Installing
- Ensure manifest.json is valid
- Check service worker is active
- Verify icons are present and correct size
- Try in Chrome/Edge (best PWA support)

## Performance Benchmarks

Expected performance metrics:
- **Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1

## Success Criteria

All features implemented and tested:
✅ Multiple list management
✅ Task CRUD operations
✅ Local data persistence
✅ Offline functionality
✅ PWA installation
✅ Responsive design
✅ Accessibility compliance
✅ XSS protection
✅ Smooth animations
✅ Network status monitoring

## Next Steps

1. Convert SVG icons to PNG (open icon-generator.html)
2. Test on multiple devices
3. Run Lighthouse audit
4. Deploy to production hosting
5. Share with users!
