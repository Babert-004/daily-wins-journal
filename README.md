# Daily Wins – Your Journal ✨

A serene, visually captivating digital journal for capturing daily wins and moments that matter. Beautiful, local, and completely pressure-free.

## Features

### 🎨 **5 Beautiful Themes**
- **Dawn** - Warm pastels for energizing mornings
- **Dusk** - Cool purples and blues for calm evenings
- **Minimal** - Clean monochrome elegance
- **Nature** - Earthy greens and golds
- **Cosmic** - Starry night sky aesthetics

### ✨ **Core Functionality**
- **Optional Daily Logging** - Write when inspired, skip when not
- **Rich Entries** - Text, tags, emojis, and optional notes
- **Beautiful Timeline** - Scrollable gallery of all your moments
- **Smart Search & Filter** - Find entries by keyword or tag
- **Custom Tags** - Create your own categories
- **Export Data** - Download as JSON (backup) and TXT (readable)
- **Import Data** - Restore from JSON backup files
- **Easy Delete** - Remove entries with visible delete buttons

### 🌸 **Gentle Experience**
- **No Pressure** - No streaks, quotas, or "missed day" guilt
- **Floating Particles** - Optional ambient animations
- **Save Celebrations** - Gentle confetti effect on save
- **Whisper Messages** - Soft affirmations when you save
- **Glassmorphism Design** - Modern, elegant UI
- **Smooth Animations** - Respects reduced-motion preferences

### 🔐 **Privacy First**
- **100% Local Storage** - All data stays in your browser
- **No Backend** - Works completely offline
- **No Tracking** - Your thoughts are private
- **No Account Needed** - Open and start using immediately
- **Optional Calm Code** - Protect your journal with a 4-digit PIN
- **AES-GCM Encryption** - Military-grade encryption for locked journals
- **Auto-Lock Timer** - Automatically locks after inactivity
- **Encrypted Backups** - Export/import with full encryption support

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Click "Add a Win" to create your first entry
3. Write freely - everything is optional
4. Save when ready or dismiss for later

### Creating & Editing Entries
- **Create New** - Click "Add a Win" on dashboard
- **Edit Existing** - Click any entry card to open and edit
- **Text** - Your main win or reflection
- **Tag** (optional) - Categorize your entry
- **Emoji** (optional) - Add mood or feeling
- **Note** (optional) - Extra thoughts or context
- The modal shows "(Editing)" when updating an existing entry
- Save button changes to "Update?" when editing

### Keyboard Shortcuts
- **Enter** in text area - Save entry
- **Ctrl+Enter** in text area - New line
- **Esc** - Close modal/panel
- **Tab** - Navigate forward through interactive elements
- **Shift+Tab** - Navigate backward

### Accessibility Features
- **Focus Trap** - Keyboard focus stays within modals for easy navigation
- **Focus Return** - Focus returns to trigger element when modal closes
- **Escape Key** - Closes any open modal or panel
- **Screen Reader Labels** - ARIA attributes on key interactive elements
- **Reduced Motion Support** - Respects OS accessibility preferences
- **Keyboard-Only Navigation** - Full functionality without mouse
- **Large Touch Targets** - 44px minimum for easy interaction

### Customization
1. Click the settings icon (top right)
2. Choose your theme from 5 palettes
3. Toggle pretty mode (floating particles)
4. Toggle celebration mode (save effects)
5. Add custom tags for your needs

### Viewing Entries
- **Dashboard** - See 3 most recent entries
- **Timeline** - View all entries in beautiful grid
- **Filter** - Sort by tag
- **Search** - Find by keyword

### Privacy & Security

**Set Your Calm Code (Optional):**
1. Open Settings → Privacy section
2. Click "Set Your Calm Code"
3. Enter a 4-digit code twice to confirm
4. Your entries are now encrypted and protected
5. Enable auto-lock to automatically secure after 5 minutes

**Forgot Your Code?**
- Click "Forgot your code?" on the lock screen
- Downloads encrypted backup of all entries
- Resets journal to start fresh
- Later, import the backup with your original code to restore

**Managing Your Data:**

**Export Your Data:**
1. Open Settings → Your Data
2. Toggle "Export readable text version" (optional)
3. Click "Export Entries"
4. Downloads JSON backup (encrypted if protected) + optional readable TXT

**Import Your Data:**
1. Open Settings → Your Data
2. Click "Import Entries"
3. Select a JSON backup file
4. If encrypted, enter the original Calm Code to decrypt
5. Entries merge with your current journal

**Edit Entries:**
- Click any entry card in Dashboard or Timeline
- Modal opens with entry pre-filled
- Make changes and click "Update?"
- Entry updates while preserving original date

**Delete Entries:**
- In Timeline view, hover over any entry (desktop) or tap entry (mobile)
- Click the red delete button (top right corner - always visible on mobile)
- Confirm to archive the entry permanently

## Technical Details

### Built With
- Vanilla HTML5, CSS3, JavaScript (ES6+)
- No frameworks or dependencies
- LocalStorage API for data persistence
- Canvas API for celebration effects
- Web Crypto API for encryption (SHA-256, PBKDF2, AES-GCM)

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers supported

### File Structure
```
daily-wins-log/
├── index.html          # Main HTML structure
├── styles.css          # All styling & themes
├── app.js             # Application logic
└── README.md          # Documentation
```

### Data Storage
All data is stored in browser localStorage under the key `dailyWinsData`. Format:
```json
{
  "entries": [...],
  "theme": "dawn",
  "tags": [...],
  "prettyMode": true,
  "celebrationMode": true,
  "exportReadable": true,
  "privacy": {
    "isLocked": false,
    "pinHash": null,
    "autoLockEnabled": false
  }
}
```

**If protected:** Entry text and notes are encrypted with AES-GCM using your Calm Code as the key. Only the SHA-256 hash of your code is stored, making it impossible to recover without the original PIN.

## Design Philosophy

### No-Pressure Approach
- Every element is optional
- No daily quotas or streaks
- No "missed day" notifications
- Skip-friendly timeline
- Beauty without obligation

### Visual Aesthetics
- Soft gradients and glassmorphism
- Ample whitespace
- Rounded, organic shapes
- Script fonts for dates
- Gentle, breathing animations

### User Experience
- **Responsive Design** - Adapts to any screen size automatically
- **Mobile-First** - Touch-friendly interface with always-visible delete buttons
- **Tablet Optimized** - 2-column layouts for medium screens  
- **Desktop Enhanced** - Full-width utilization on large screens
- **One-handed mobile use** - Easy thumb navigation
- **Large touch targets** (44px minimum for accessibility)
- **Smooth transitions** (0.2-0.4s ease)
- **Reduced motion support** for accessibility
- **Intuitive navigation** with visual feedback

## Tips for Best Experience

### Mobile Use
- Add to home screen for app-like experience
- Use in landscape for tablet-style layout
- Swipe down to dismiss modals
- Tap entries to edit them
- Delete buttons always visible on touch devices
- App automatically adapts to screen size and reduces scrolling

### Desktop Use
- Fullscreen for immersive experience
- Use keyboard shortcuts for speed
- Drag window smaller for cozy feel
- Print timeline for physical journal

### Making It Yours
- Create tags that match your life
- Switch themes based on mood/time
- Toggle particles off for focus mode
- Export regularly as backup

## For Developers: Customization Guide

Want to personalize Daily Wins? Here's where to look:

### 🎨 **Themes** (`styles.css`)
```css
/* Lines 12-87: Theme definitions */
[data-theme="dawn"] {
    --bg-primary: ...
    --accent-primary: ...
    /* Modify colors or add new themes here */
}
```

### 💬 **Whisper Messages** (`app.js`)
```javascript
// Lines 267-274: Saved entry messages
const whispers = [
    'Gently noted. 🌸',
    'Beautifully captured. ✨',
    // Add your own messages here
];
```

### 🏷️ **Default Tags** (`app.js`)
```javascript
// Lines 12-15: Initial tag list
this.tags = [
    'Habit', 'Reflection', 'Achievement', 'Gratitude',
    // Customize or expand default tags
];
```

### 😊 **Emoji Options** (`app.js`)
```javascript
// Lines 16-19: Mood emoji selection
this.emojis = [
    '✨', '🌸', '🌿', '💫', '🦋', '🌈',
    // Add or change emojis
];
```

### ⏱️ **Auto-Lock Timer** (`app.js`)
```javascript
// Line 35: Default minutes
autoLockMinutes: 5  // Change to 10, 15, etc.
```

### 🔢 **Calm Code Length** (`app.js`)
```javascript
// Lines 1231-1243, 1637-1652: PIN input setup
// Search for "pin.length !== 4" to change from 4 digits
```

### 🎭 **Animations** (`styles.css`)
```css
/* Line 16: Transition speed */
--transition-smooth: all 0.3s cubic-bezier(...);

/* Lines 270-273: Breathe animation */
@keyframes breathe { /* Modify timing/scale */ }
```

### 📝 **Entry Card Preview Length** (`app.js`)
```javascript
// Lines 553-555: Text truncation
const maxLength = showFull ? 300 : 120;  // Characters
```

### 🎊 **Celebration Particles** (`app.js`)
```javascript
// Lines 644-655: Confetti settings
const particleCount = 50;  // Number of particles
```

### 🔐 **Encryption Settings** (`app.js`)
```javascript
// Lines 938-946: PBKDF2 iterations
iterations: 100000,  // Higher = more secure, slower
```

**Pro Tips:**
- All colors use CSS variables for easy theming
- Search for `// TODO` comments (if any) for improvement areas
- The app has no build step - edit and refresh!
- Check browser console for any errors after changes

## Troubleshooting

### Lost Data?
Data is stored locally in your browser. Clearing browser data/cache will remove entries. Export regularly to back up! You can then re-import the JSON file to restore your entries.

### Forgot Your Calm Code?
If you've protected your journal and forgot the code:
1. Use "Forgot your code?" on lock screen
2. Downloads encrypted backup automatically
3. Journal resets to fresh state
4. If you remember the code later, import the backup to restore entries

### Can't Decrypt Imported Backup?
Make sure you're entering the **original** Calm Code that was used when the backup was created, not your current journal's code.

### Particles Not Showing?
- Check Pretty Mode is enabled in Settings
- May be disabled if "Reduce Motion" is active in OS
- Try refreshing the page

### Theme Not Changing?
- Ensure JavaScript is enabled
- Try clearing browser cache
- Check browser console for errors

## License
Free to use for personal journaling. Made with care and attention to beauty. ✨

## Credits
Designed and built with the philosophy that reflection should be optional, beautiful, and pressure-free.

**Created by [@pastor0711](https://github.com/pastor0711)**

---

**Remember:** This app exists to support you, not to judge you. Write when inspired, rest when needed. Your story unfolds at its own perfect pace. 🌸

