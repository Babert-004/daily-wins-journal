// ============================================
// DAILY WINS LOG - APPLICATION LOGIC
// ============================================

class DailyWinsApp {
    constructor() {
        this.entries = [];
        this.currentTheme = 'dawn';
        this.prettyMode = true;
        this.celebrationMode = true;
        this.exportReadable = true; // Export readable text version
        this.tags = [
            'Habit', 'Reflection', 'Achievement', 'Gratitude', 
            'Growth', 'Connection', 'Health', 'Creativity'
        ];
        this.emojis = [
            '✨', '🌸', '🌿', '💫', '🦋', '🌈',
            '☀️', '🌙', '⭐', '💛', '🌺', '🍃'
        ];
        
        this.currentEntry = {
            id: null,
            text: '',
            tag: '',
            emoji: '',
            note: ''
        };
        
        this.editingEntry = null;
        
        // Privacy / Calm Code
        this.privacy = {
            isLocked: false,
            pinHash: null,
            autoLockEnabled: false,
            autoLockMinutes: 5
        };
        this.isUnlocked = false;
        this.unlockKey = null; // Temporary encryption key in memory
        this.autoLockTimer = null;
        
        // Temporary storage for encrypted import
        this.pendingImportData = null;
        
        this.init();
    }
    
    init() {
        this.loadData();
        
        // Check if app is locked - show lock screen instead of dashboard
        if (this.privacy.isLocked && !this.isUnlocked) {
            this.showLockScreen();
        } else {
            this.renderDashboard();
            this.startAutoLockTimer();
        }
        
        this.setupEventListeners();
        this.initParticles();
        this.applyTheme(this.currentTheme);
    }
    
    // ============================================
    // LOCAL STORAGE
    // ============================================
    
    loadData() {
        const stored = localStorage.getItem('dailyWinsData');
        if (stored) {
            const data = JSON.parse(stored);
            this.entries = data.entries || [];
            this.currentTheme = data.theme || 'dawn';
            this.tags = data.tags || this.tags;
            this.prettyMode = data.prettyMode !== undefined ? data.prettyMode : true;
            this.celebrationMode = data.celebrationMode !== undefined ? data.celebrationMode : true;
            this.exportReadable = data.exportReadable !== undefined ? data.exportReadable : true;
            
            // Load privacy settings
            if (data.privacy) {
                this.privacy = {
                    isLocked: data.privacy.isLocked || false,
                    pinHash: data.privacy.pinHash || null,
                    autoLockEnabled: data.privacy.autoLockEnabled || false,
                    autoLockMinutes: data.privacy.autoLockMinutes || 5
                };
            }
        }
    }
    
    saveData() {
        const data = {
            entries: this.entries,
            theme: this.currentTheme,
            tags: this.tags,
            prettyMode: this.prettyMode,
            celebrationMode: this.celebrationMode,
            exportReadable: this.exportReadable,
            privacy: this.privacy
        };
        localStorage.setItem('dailyWinsData', JSON.stringify(data));
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    setupEventListeners() {
        // Dashboard
        document.getElementById('addEntryBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('viewAllBtn').addEventListener('click', () => this.showTimeline());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('searchBtn').addEventListener('click', () => this.showTimeline());
        
        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeAddModal());
        document.getElementById('laterBtn').addEventListener('click', () => this.closeAddModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveEntry());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeAddModal());
        
        // Entry input - auto-save on Enter (Ctrl+Enter for newline)
        document.getElementById('entryText').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                this.saveEntry();
            }
        });
        
        // Timeline
        document.getElementById('backToHome').addEventListener('click', () => this.showDashboard());
        document.getElementById('filterTag').addEventListener('change', (e) => this.filterEntries(e.target.value));
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchEntries(e.target.value));
        
        // Settings
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.querySelector('.settings-overlay').addEventListener('click', () => this.closeSettings());
        document.getElementById('prettyMode').addEventListener('change', (e) => this.togglePrettyMode(e.target.checked));
        document.getElementById('celebrationMode').addEventListener('change', (e) => this.toggleCelebrationMode(e.target.checked));
        document.getElementById('exportReadableMode').addEventListener('change', (e) => this.toggleExportReadable(e.target.checked));
        document.getElementById('addTagBtn').addEventListener('click', () => this.addCustomTag());
        document.getElementById('newTagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCustomTag();
        });
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.triggerImport());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        
        // Theme swatches
        document.querySelectorAll('.theme-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.applyTheme(theme);
            });
        });
        
        // PIN input handlers (lock screen)
        this.setupPinInputs();
        
        // Calm Code Modal
        const closeCalmCodeModal = document.getElementById('closeCalmCodeModal');
        const cancelCalmCodeBtn = document.getElementById('cancelCalmCodeBtn');
        const setCalmCodeBtn = document.getElementById('setCalmCodeBtn');
        
        if (closeCalmCodeModal) {
            closeCalmCodeModal.addEventListener('click', () => this.closeCalmCodeModal());
        }
        if (cancelCalmCodeBtn) {
            cancelCalmCodeBtn.addEventListener('click', () => this.closeCalmCodeModal());
        }
        if (setCalmCodeBtn) {
            setCalmCodeBtn.addEventListener('click', () => this.processCalmCodeSetup());
        }
        
        // Forgot Code Modal
        const closeForgotCodeModal = document.getElementById('closeForgotCodeModal');
        const cancelForgotCodeBtn = document.getElementById('cancelForgotCodeBtn');
        const exportAndResetBtn = document.getElementById('exportAndResetBtn');
        
        if (closeForgotCodeModal) {
            closeForgotCodeModal.addEventListener('click', () => this.closeForgotCodeModal());
        }
        if (cancelForgotCodeBtn) {
            cancelForgotCodeBtn.addEventListener('click', () => this.closeForgotCodeModal());
        }
        if (exportAndResetBtn) {
            exportAndResetBtn.addEventListener('click', () => this.exportAndReset());
        }
        
        // Decrypt Import Modal
        const closeDecryptImportModal = document.getElementById('closeDecryptImportModal');
        const cancelDecryptBtn = document.getElementById('cancelDecryptBtn');
        
        if (closeDecryptImportModal) {
            closeDecryptImportModal.addEventListener('click', () => this.closeDecryptImportModal());
        }
        if (cancelDecryptBtn) {
            cancelDecryptBtn.addEventListener('click', () => this.closeDecryptImportModal());
        }
    }
    
    // Setup PIN input handlers (auto-advance and auto-check)
    setupPinInputs() {
        // Lock screen PIN inputs
        const lockPinInputs = document.querySelectorAll('#lockScreen .pin-input');
        lockPinInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                
                // Only allow digits
                if (!/^\d$/.test(value)) {
                    e.target.value = '';
                    return;
                }
                
                // Auto-advance to next input
                if (value && index < lockPinInputs.length - 1) {
                    lockPinInputs[index + 1].focus();
                }
                
                // Check PIN when all 4 digits are entered
                if (index === lockPinInputs.length - 1 && value) {
                    this.checkPin();
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    lockPinInputs[index - 1].focus();
                }
            });
        });
        
        // Setup PIN inputs for Calm Code modal
        this.setupCalmCodeModalInputs();
        
        // Setup PIN inputs for Decrypt Import modal
        this.setupDecryptImportInputs();
    }
    
    // Setup Decrypt Import modal PIN inputs
    setupDecryptImportInputs() {
        const inputs = [];
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`decryptPin${i}`);
            if (input) inputs.push(input);
        }
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', async (e) => {
                const value = e.target.value;
                
                // Only allow digits
                if (!/^\d$/.test(value)) {
                    e.target.value = '';
                    return;
                }
                
                // Auto-advance
                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                
                // Auto-decrypt when all 4 digits are entered
                if (index === inputs.length - 1 && value) {
                    await this.attemptDecryptImport();
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    }
    
    // Setup Calm Code modal PIN inputs
    setupCalmCodeModalInputs() {
        const setupInputs = (prefix, nextPrefix = null) => {
            const inputs = [];
            for (let i = 1; i <= 4; i++) {
                const input = document.getElementById(`${prefix}${i}`);
                if (input) inputs.push(input);
            }
            
            inputs.forEach((input, index) => {
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    
                    // Only allow digits
                    if (!/^\d$/.test(value)) {
                        e.target.value = '';
                        return;
                    }
                    
                    // Auto-advance
                    if (value && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                    
                    // If last digit and all filled, show confirm step or process
                    if (index === inputs.length - 1 && value) {
                        if (prefix === 'setPin' && nextPrefix) {
                            // Move to confirmation step
                            setTimeout(() => {
                                document.getElementById('calmCodeStep1').style.display = 'none';
                                document.getElementById('calmCodeStep2').style.display = 'block';
                                document.getElementById('confirmPin1').focus();
                            }, 200);
                        }
                    }
                });
                
                // Handle backspace
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        inputs[index - 1].focus();
                    }
                });
            });
        };
        
        setupInputs('setPin', 'confirmPin');
        setupInputs('confirmPin');
    }
    
    // ============================================
    // VIEW MANAGEMENT
    // ============================================
    
    showDashboard() {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('dashboard').classList.add('active');
        this.renderDashboard();
    }
    
    showTimeline() {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('timeline').classList.add('active');
        this.renderTimeline();
    }
    
    openAddModal(entryId = null) {
        const modal = document.getElementById('addModal');
        
        // Store the element that opened the modal for focus return
        this.previousFocusElement = document.activeElement;
        
        modal.classList.add('active');
        
        // Check if editing existing entry
        if (entryId) {
            this.editingEntry = this.entries.find(e => e.id === entryId);
            if (this.editingEntry) {
                // Set date from entry
                const entryDate = new Date(this.editingEntry.date);
                const dateStr = entryDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                document.getElementById('entryDate').textContent = dateStr + ' (Editing)';
                
                // Pre-fill form
                document.getElementById('entryText').value = this.editingEntry.text;
                document.getElementById('entryNote').value = this.editingEntry.note || '';
                this.currentEntry = {
                    id: this.editingEntry.id,
                    text: this.editingEntry.text,
                    tag: this.editingEntry.tag || '',
                    emoji: this.editingEntry.emoji || '',
                    note: this.editingEntry.note || ''
                };
            }
        } else {
            // New entry
            this.editingEntry = null;
            
            // Set current date
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            document.getElementById('entryDate').textContent = dateStr;
            
            // Clear form
            document.getElementById('entryText').value = '';
            document.getElementById('entryNote').value = '';
            this.currentEntry = { id: null, text: '', tag: '', emoji: '', note: '' };
        }
        
        // Render options
        this.renderTagBubbles();
        this.renderEmojiGrid();
        
        // Update save button text
        const saveBtn = document.querySelector('#saveBtn span');
        if (saveBtn) {
            saveBtn.textContent = this.editingEntry ? 'Update?' : 'Save if ready?';
        }
        
        // Focus input and trap focus in modal
        setTimeout(() => {
            document.getElementById('entryText').focus();
            this.trapFocus(modal);
        }, 300);
    }
    
    closeAddModal() {
        const modal = document.getElementById('addModal');
        modal.classList.remove('active');
        this.editingEntry = null;
        this.removeFocusTrap(modal);
        
        // Return focus to the element that opened the modal
        if (this.previousFocusElement) {
            this.previousFocusElement.focus();
            this.previousFocusElement = null;
        }
    }
    
    openSettings() {
        const settings = document.getElementById('settings');
        
        // Store previous focus
        this.previousFocusElement = document.activeElement;
        
        settings.classList.add('active');
        this.renderSettings();
        
        // Focus first interactive element and trap focus
        setTimeout(() => {
            const closeBtn = document.getElementById('closeSettings');
            if (closeBtn) closeBtn.focus();
            this.trapFocus(settings);
        }, 100);
    }
    
    closeSettings() {
        const settings = document.getElementById('settings');
        settings.classList.remove('active');
        this.removeFocusTrap(settings);
        
        // Return focus
        if (this.previousFocusElement) {
            this.previousFocusElement.focus();
            this.previousFocusElement = null;
        }
    }
    
    // ============================================
    // ENTRY MANAGEMENT
    // ============================================
    
    saveEntry() {
        const text = document.getElementById('entryText').value.trim();
        
        if (!text) {
            this.showToast('Write something beautiful first... 🌸');
            return;
        }
        
        const note = document.getElementById('entryNote').value.trim();
        
        if (this.editingEntry) {
            // Update existing entry
            const index = this.entries.findIndex(e => e.id === this.editingEntry.id);
            if (index !== -1) {
                this.entries[index] = {
                    ...this.entries[index],
                    text: text,
                    tag: this.currentEntry.tag,
                    emoji: this.currentEntry.emoji,
                    note: note
                };
                
                this.saveData();
                this.closeAddModal();
                this.showToast('Updated beautifully. ✨');
                this.renderDashboard();
                this.renderTimeline();
            }
        } else {
            // Create new entry
            const entry = {
                id: Date.now(),
                date: new Date().toISOString(),
                text: text,
                tag: this.currentEntry.tag,
                emoji: this.currentEntry.emoji,
                note: note
            };
            
            this.entries.unshift(entry);
            this.saveData();
            this.closeAddModal();
            
            // Celebration
            if (this.celebrationMode) {
                this.celebrate();
            }
            
            // Whisper message
            const whispers = [
                'Gently noted. 🌸',
                'Beautifully captured. ✨',
                'A moment preserved. 💫',
                'Saved with care. 🌿',
                'Your story grows. 🦋'
            ];
            const randomWhisper = whispers[Math.floor(Math.random() * whispers.length)];
            this.showToast(randomWhisper);
            
            // Refresh dashboard
            this.renderDashboard();
        }
    }
    
    deleteEntry(id, event) {
        if (event) {
            event.stopPropagation();
        }
        
        if (confirm('Remove this moment? (It will be removed permanently)')) {
            this.entries = this.entries.filter(e => e.id !== id);
            this.saveData();
            this.renderTimeline();
            this.renderDashboard();
            this.showToast('Removed gracefully. 🍃');
        }
    }
    
    // ============================================
    // RENDERING
    // ============================================
    
    renderDashboard() {
        const recentEntries = document.getElementById('recentEntries');
        const emptyState = document.getElementById('emptyState');
        const viewAllBtn = document.getElementById('viewAllBtn');
        
        if (this.entries.length === 0) {
            recentEntries.innerHTML = '';
            emptyState.style.display = 'block';
            viewAllBtn.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            viewAllBtn.style.display = 'inline-flex';
            
            const recent = this.entries.slice(0, 4);
            recentEntries.innerHTML = recent.map((entry, index) => this.createEntryCard(entry, index * 0.1, false)).join('');
            
            // Add click handlers to open for editing
            recent.forEach(entry => {
                const card = document.querySelector(`#recentEntries [data-entry-id="${entry.id}"]`);
                if (card) {
                    const editHandler = () => this.openAddModal(entry.id);

                    // Handle both click and touch events for mobile
                    card.addEventListener('click', editHandler);
                    card.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        editHandler();
                    });

                    // Add touch class for mobile delete button visibility
                    card.addEventListener('touchstart', () => {
                        card.classList.add('touched');
                    });

                    card.addEventListener('touchend', () => {
                        setTimeout(() => card.classList.remove('touched'), 200);
                    });
                }
            });
        }
    }
    
    renderTimeline(filter = '', search = '') {
        const container = document.getElementById('entriesContainer');
        const emptyState = document.getElementById('timelineEmpty');
        const filterSelect = document.getElementById('filterTag');
        
        // Update filter options
        filterSelect.innerHTML = '<option value="">All Tags</option>' + 
            this.tags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
        
        let filtered = this.entries;
        
        // Apply tag filter
        if (filter) {
            filtered = filtered.filter(e => e.tag === filter);
        }
        
        // Apply search
        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(e => 
                e.text.toLowerCase().includes(query) || 
                (e.note && e.note.toLowerCase().includes(query))
            );
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            container.innerHTML = filtered.map((entry, index) => 
                this.createEntryCard(entry, index * 0.05, true)
            ).join('');
            
            // Add click handlers to open for editing
            filtered.forEach(entry => {
                const card = document.querySelector(`#entriesContainer [data-entry-id="${entry.id}"]`);
                if (card) {
                    const editHandler = (e) => {
                        // Don't open modal if clicking delete button
                        if (!e.target.closest('.entry-delete-btn')) {
                            this.openAddModal(entry.id);
                        }
                    };

                    // Handle both click and touch events for mobile
                    card.addEventListener('click', editHandler);
                    card.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        editHandler(e);
                    });

                    // Add touch class for mobile delete button visibility
                    card.addEventListener('touchstart', () => {
                        card.classList.add('touched');
                    });

                    card.addEventListener('touchend', () => {
                        setTimeout(() => card.classList.remove('touched'), 200);
                    });
                }
            });
        }
    }
    
    createEntryCard(entry, delay = 0, showFull = false) {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        const maxLength = showFull ? 300 : 120;
        const displayText = entry.text.length > maxLength 
            ? entry.text.substring(0, maxLength) + '...' 
            : entry.text;
        
        return `
            <div class="entry-card" data-entry-id="${entry.id}" style="animation-delay: ${delay}s" title="Click to edit">
                <div class="entry-date">${dateStr}</div>
                <div class="entry-text">${this.escapeHtml(displayText)}</div>
                <div class="entry-meta">
                    ${entry.tag ? `<span class="entry-tag">${entry.tag}</span>` : ''}
                    ${entry.emoji ? `<span class="entry-emoji">${entry.emoji}</span>` : ''}
                </div>
                ${entry.note && showFull ? `<div class="entry-note">${this.escapeHtml(entry.note)}</div>` : ''}
                ${showFull ? `
                    <div class="entry-actions">
                        <button class="entry-delete-btn" onclick="window.app.deleteEntry(${entry.id}, event)" title="Delete entry">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderTagBubbles() {
        const container = document.getElementById('tagBubbles');
        container.innerHTML = this.tags.map(tag => `
            <button class="tag-bubble ${this.currentEntry.tag === tag ? 'selected' : ''}" 
                    data-tag="${tag}">
                ${tag}
            </button>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.tag-bubble').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.dataset.tag;
                this.currentEntry.tag = this.currentEntry.tag === tag ? '' : tag;
                this.renderTagBubbles();
            });
        });
    }
    
    renderEmojiGrid() {
        const container = document.getElementById('emojiGrid');
        container.innerHTML = this.emojis.map(emoji => `
            <button class="emoji-btn ${this.currentEntry.emoji === emoji ? 'selected' : ''}" 
                    data-emoji="${emoji}">
                ${emoji}
            </button>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emoji = e.target.dataset.emoji;
                this.currentEntry.emoji = this.currentEntry.emoji === emoji ? '' : emoji;
                this.renderEmojiGrid();
            });
        });
    }
    
    renderSettings() {
        // Update toggle states
        document.getElementById('prettyMode').checked = this.prettyMode;
        document.getElementById('celebrationMode').checked = this.celebrationMode;
        document.getElementById('exportReadableMode').checked = this.exportReadable;
        
        // Update active theme
        document.querySelectorAll('.theme-swatch').forEach(swatch => {
            if (swatch.dataset.theme === this.currentTheme) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
        
        // Render custom tags
        const tagsContainer = document.getElementById('customTags');
        tagsContainer.innerHTML = this.tags.map(tag => `
            <div class="custom-tag-item">
                <span>${tag}</span>
                <button class="remove-tag-btn" data-tag="${tag}">×</button>
            </div>
        `).join('');
        
        // Add remove handlers
        tagsContainer.querySelectorAll('.remove-tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.dataset.tag;
                this.tags = this.tags.filter(t => t !== tag);
                this.saveData();
                this.renderSettings();
            });
        });
        
        // Render privacy controls
        this.renderPrivacySettings();
    }
    
    // Render privacy settings
    renderPrivacySettings() {
        const statusContainer = document.getElementById('privacyStatus');
        const actionsContainer = document.getElementById('privacyActions');
        
        if (!statusContainer || !actionsContainer) return;
        
        if (this.privacy.isLocked) {
            // Lock is enabled
            statusContainer.innerHTML = `
                <div class="privacy-status">
                    <div class="privacy-status-icon">🔒</div>
                    <div class="privacy-status-text">Your journal is protected</div>
                </div>
            `;
            
            actionsContainer.innerHTML = `
                <label class="toggle-option">
                    <input type="checkbox" id="autoLockToggle" ${this.privacy.autoLockEnabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Auto-lock after ${this.privacy.autoLockMinutes} minutes</span>
                </label>
                <button class="privacy-btn" id="changeCalmCodeBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Change Calm Code
                </button>
                <button class="privacy-btn privacy-btn-danger" id="removeCalmCodeBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Remove Protection
                </button>
            `;
            
            // Add event listeners
            const autoLockToggle = document.getElementById('autoLockToggle');
            if (autoLockToggle) {
                autoLockToggle.addEventListener('change', (e) => this.toggleAutoLock(e.target.checked));
            }
            
            const changeCalmCodeBtn = document.getElementById('changeCalmCodeBtn');
            if (changeCalmCodeBtn) {
                changeCalmCodeBtn.addEventListener('click', () => this.openChangeCalmCodeModal());
            }
            
            const removeCalmCodeBtn = document.getElementById('removeCalmCodeBtn');
            if (removeCalmCodeBtn) {
                removeCalmCodeBtn.addEventListener('click', () => this.confirmRemoveCalmCode());
            }
        } else {
            // Lock is not enabled
            statusContainer.innerHTML = `
                <div class="privacy-status">
                    <div class="privacy-status-icon">🔓</div>
                    <div class="privacy-status-text">Your journal is not protected</div>
                </div>
            `;
            
            actionsContainer.innerHTML = `
                <button class="privacy-btn" id="setCalmCodeBtn2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Set Your Calm Code
                </button>
            `;
            
            const setCalmCodeBtn2 = document.getElementById('setCalmCodeBtn2');
            if (setCalmCodeBtn2) {
                setCalmCodeBtn2.addEventListener('click', () => this.openCalmCodeModal());
            }
        }
    }
    
    // Open Calm Code modal
    openCalmCodeModal() {
        const modal = document.getElementById('setCalmCodeModal');
        if (!modal) return;
        
        // Store previous focus
        this.previousFocusElement = document.activeElement;
        
        // Close settings panel first
        this.closeSettings();
        
        modal.classList.add('active');
        
        // Reset modal state
        document.getElementById('calmCodeStep1').style.display = 'block';
        document.getElementById('calmCodeStep2').style.display = 'none';
        
        // Clear all inputs
        for (let i = 1; i <= 4; i++) {
            const setInput = document.getElementById(`setPin${i}`);
            const confirmInput = document.getElementById(`confirmPin${i}`);
            if (setInput) setInput.value = '';
            if (confirmInput) confirmInput.value = '';
        }
        
        document.getElementById('calmCodeError').textContent = '';
        
        // Focus first input and trap focus
        setTimeout(() => {
            document.getElementById('setPin1').focus();
            this.trapFocus(modal);
        }, 300);
    }
    
    // Close Calm Code modal
    closeCalmCodeModal() {
        const modal = document.getElementById('setCalmCodeModal');
        if (modal) {
            modal.classList.remove('active');
            this.removeFocusTrap(modal);
        }
        
        // Return focus
        if (this.previousFocusElement) {
            this.previousFocusElement.focus();
            this.previousFocusElement = null;
        }
    }
    
    // Process Calm Code setup
    async processCalmCodeSetup() {
        // Get PIN from set inputs
        const setPin = Array.from({length: 4}, (_, i) => 
            document.getElementById(`setPin${i + 1}`).value
        ).join('');
        
        // Get PIN from confirm inputs
        const confirmPin = Array.from({length: 4}, (_, i) => 
            document.getElementById(`confirmPin${i + 1}`).value
        ).join('');
        
        const errorEl = document.getElementById('calmCodeError');
        
        // Validate
        if (setPin.length !== 4) {
            errorEl.textContent = 'Please enter a 4-digit code';
            return;
        }
        
        if (confirmPin.length !== 4) {
            errorEl.textContent = 'Please confirm your code';
            return;
        }
        
        if (setPin !== confirmPin) {
            errorEl.textContent = 'Codes do not match. Please try again.';
            // Clear confirm inputs
            for (let i = 1; i <= 4; i++) {
                document.getElementById(`confirmPin${i}`).value = '';
            }
            document.getElementById('confirmPin1').focus();
            return;
        }
        
        // Set the code
        await this.setCalmCode(setPin);
        this.closeCalmCodeModal();
    }
    
    // Open change Calm Code modal
    openChangeCalmCodeModal() {
        // Reuse the same modal
        this.openCalmCodeModal();
    }
    
    // Confirm remove Calm Code
    confirmRemoveCalmCode() {
        const confirmed = confirm('Remove protection from your journal?\n\nYour entries will be decrypted and the Calm Code will be removed.');
        
        if (confirmed) {
            this.removeCalmCode();
            this.renderSettings();
        }
    }
    
    // ============================================
    // FILTERING & SEARCH
    // ============================================
    
    filterEntries(tag) {
        this.renderTimeline(tag, document.getElementById('searchInput').value);
    }
    
    searchEntries(query) {
        this.renderTimeline(document.getElementById('filterTag').value, query);
    }
    
    // ============================================
    // CUSTOMIZATION
    // ============================================
    
    applyTheme(theme) {
        this.currentTheme = theme;
        document.body.dataset.theme = theme;
        this.saveData();
        this.renderSettings();
        
        // Reinitialize particles with new theme color
        if (this.prettyMode) {
            this.initParticles();
        }
    }
    
    togglePrettyMode(enabled) {
        this.prettyMode = enabled;
        this.saveData();
        
        if (enabled) {
            this.initParticles();
        } else {
            document.getElementById('particles').innerHTML = '';
        }
    }
    
    toggleCelebrationMode(enabled) {
        this.celebrationMode = enabled;
        this.saveData();
    }
    
    toggleExportReadable(enabled) {
        this.exportReadable = enabled;
        this.saveData();
    }
    
    addCustomTag() {
        const input = document.getElementById('newTagInput');
        const newTag = input.value.trim();
        
        if (newTag && !this.tags.includes(newTag)) {
            this.tags.push(newTag);
            this.saveData();
            input.value = '';
            this.renderSettings();
            this.showToast(`Tag "${newTag}" added! ✨`);
        } else if (this.tags.includes(newTag)) {
            this.showToast('Tag already exists! 🌸');
        }
    }
    
    // ============================================
    // PARTICLE SYSTEM
    // ============================================
    
    initParticles() {
        if (!this.prettyMode) return;
        
        const container = document.getElementById('particles');
        container.innerHTML = '';
        
        const particleCount = window.innerWidth < 768 ? 20 : 40;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.borderRadius = '50%';
            particle.style.background = 'var(--particle-color)';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            
            container.appendChild(particle);
        }
        
        // Add float animation if not exists
        if (!document.getElementById('particleAnimation')) {
            const style = document.createElement('style');
            style.id = 'particleAnimation';
            style.textContent = `
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.3;
                    }
                    25% {
                        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.2);
                        opacity: 0.6;
                    }
                    50% {
                        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(0.8);
                        opacity: 0.4;
                    }
                    75% {
                        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.1);
                        opacity: 0.5;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ============================================
    // CELEBRATION EFFECT
    // ============================================
    
    celebrate() {
        const canvas = document.getElementById('celebration');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                radius: Math.random() * 4 + 2,
                color: this.getRandomColor(),
                life: 1
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let alive = false;
            
            particles.forEach(p => {
                if (p.life > 0) {
                    alive = true;
                    
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.3; // gravity
                    p.life -= 0.01;
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.fill();
                }
            });
            
            ctx.globalAlpha = 1;
            
            if (alive) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    getRandomColor() {
        const colors = [
            'rgba(255, 182, 193, 1)',
            'rgba(255, 229, 180, 1)',
            'rgba(183, 148, 246, 1)',
            'rgba(168, 230, 207, 1)',
            'rgba(126, 200, 227, 1)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // ============================================
    // EXPORT & IMPORT FUNCTIONALITY
    // ============================================
    
    triggerImport() {
        document.getElementById('importFile').click();
    }
    
    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                let importedData;
                
                // Try to parse as JSON first
                try {
                    importedData = JSON.parse(content);
                } catch {
                    this.showToast('Invalid file format. Please use JSON or exported text file. ❌');
                    return;
                }
                
                // Validate data structure
                if (!importedData.entries || !Array.isArray(importedData.entries)) {
                    this.showToast('Invalid data structure. ❌');
                    return;
                }
                
                // Check if this is an encrypted backup
                if (importedData.encrypted && importedData.privacy && importedData.privacy.pinHash) {
                    await this.importEncryptedData(importedData);
                } else {
                    // Regular import flow
                    await this.importRegularData(importedData);
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Error importing file. ❌');
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Import regular (unencrypted) data
    async importRegularData(importedData) {
        // Ask for confirmation
        const count = importedData.entries.length;
        const merge = confirm(`Import ${count} entries?\n\nClick OK to ADD to existing entries.\nClick Cancel to abort.`);
        
        if (merge) {
            // Merge entries (avoid duplicates by checking IDs)
            const existingIds = new Set(this.entries.map(e => e.id));
            const newEntries = importedData.entries.filter(e => !existingIds.has(e.id));
            
            this.entries = [...this.entries, ...newEntries];
            
            // Sort by date (newest first)
            this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Optionally import tags
            if (importedData.tags && Array.isArray(importedData.tags)) {
                importedData.tags.forEach(tag => {
                    if (!this.tags.includes(tag)) {
                        this.tags.push(tag);
                    }
                });
            }
            
            // Optionally import theme
            if (importedData.theme) {
                this.applyTheme(importedData.theme);
            }
            
            this.saveData();
            this.renderDashboard();
            this.showToast(`Imported ${newEntries.length} new entries! ✨`);
        }
    }
    
    // Import encrypted data with PIN verification
    async importEncryptedData(importedData) {
        // Store the data temporarily
        this.pendingImportData = importedData;
        
        // Show decrypt modal
        this.showDecryptImportModal(importedData.entries.length);
    }
    
    // Show decrypt import modal
    showDecryptImportModal(entryCount) {
        const modal = document.getElementById('decryptImportModal');
        if (!modal) return;
        
        // Store previous focus
        this.previousFocusElement = document.activeElement;
        
        // Set entry count
        document.getElementById('decryptEntryCount').textContent = entryCount;
        
        // Clear PIN inputs
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`decryptPin${i}`);
            if (input) input.value = '';
        }
        
        // Clear error
        document.getElementById('decryptError').textContent = '';
        
        // Show modal
        modal.classList.add('active');
        
        // Focus first input and trap focus
        setTimeout(() => {
            document.getElementById('decryptPin1').focus();
            this.trapFocus(modal);
        }, 300);
        
        this.showToast('Encrypted backup detected. 🔐');
    }
    
    // Close decrypt import modal
    closeDecryptImportModal() {
        const modal = document.getElementById('decryptImportModal');
        if (modal) {
            modal.classList.remove('active');
            this.removeFocusTrap(modal);
        }
        this.pendingImportData = null;
        this.showToast('Import cancelled. 🌸');
        
        // Return focus
        if (this.previousFocusElement) {
            this.previousFocusElement.focus();
            this.previousFocusElement = null;
        }
    }
    
    // Attempt to decrypt import with entered PIN
    async attemptDecryptImport() {
        if (!this.pendingImportData) return;
        
        // Get PIN from inputs
        const pin = Array.from({length: 4}, (_, i) => 
            document.getElementById(`decryptPin${i + 1}`).value
        ).join('');
        
        if (pin.length !== 4) return;
        
        const errorEl = document.getElementById('decryptError');
        const importedData = this.pendingImportData;
        
        try {
            // Verify the PIN against the stored hash
            const pinHash = await this.hashPin(pin);
            if (pinHash !== importedData.privacy.pinHash) {
                // Incorrect PIN - shake and clear
                errorEl.textContent = 'Incorrect code. Try again...';
                this.shakeDecryptInputs();
                this.clearDecryptPinInputs();
                return;
            }
            
            // PIN is correct! Start decryption
            errorEl.textContent = '';
            this.showToast('Decrypting entries... 🔓');
            
            const decryptKey = await this.deriveKey(pin);
            
            // Decrypt all entries
            const decryptedEntries = [];
            for (let entry of importedData.entries) {
                if (entry.encrypted) {
                    const decryptedEntry = { ...entry };
                    
                    // Decrypt text
                    if (entry.text) {
                        const decryptedText = await this.decryptText(entry.text, decryptKey);
                        if (decryptedText) {
                            decryptedEntry.text = decryptedText;
                        } else {
                            throw new Error('Failed to decrypt entry text');
                        }
                    }
                    
                    // Decrypt note
                    if (entry.note) {
                        const decryptedNote = await this.decryptText(entry.note, decryptKey);
                        if (decryptedNote) {
                            decryptedEntry.note = decryptedNote;
                        }
                    }
                    
                    // Mark as decrypted
                    decryptedEntry.encrypted = false;
                    decryptedEntries.push(decryptedEntry);
                } else {
                    decryptedEntries.push(entry);
                }
            }
            
            // Close modal
            const modal = document.getElementById('decryptImportModal');
            if (modal) {
                modal.classList.remove('active');
            }
            
            // Merge entries (avoid duplicates by checking IDs)
            const existingIds = new Set(this.entries.map(e => e.id));
            const newEntries = decryptedEntries.filter(e => !existingIds.has(e.id));
            
            // Add decrypted entries to the journal
            this.entries = [...this.entries, ...newEntries];
            
            // Sort by date (newest first)
            this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Optionally import tags
            if (importedData.tags && Array.isArray(importedData.tags)) {
                importedData.tags.forEach(tag => {
                    if (!this.tags.includes(tag)) {
                        this.tags.push(tag);
                    }
                });
            }
            
            // If current journal has encryption, re-encrypt all entries before saving
            if (this.privacy.isLocked && this.unlockKey) {
                // Encrypt all entries (including newly imported ones)
                await this.encryptAllEntries();
                
                // Then immediately decrypt them again for viewing since user is unlocked
                await this.decryptAllEntries();
            }
            
            this.saveData();
            this.renderDashboard();
            this.showToast(`Imported and decrypted ${newEntries.length} entries! ✨🔓`);
            
            // Clear pending data
            this.pendingImportData = null;
            
        } catch (error) {
            console.error('Decryption error:', error);
            errorEl.textContent = 'Failed to decrypt. Check your code.';
            this.shakeDecryptInputs();
            this.clearDecryptPinInputs();
        }
    }
    
    // Clear decrypt PIN inputs
    clearDecryptPinInputs() {
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`decryptPin${i}`);
            if (input) input.value = '';
        }
        document.getElementById('decryptPin1').focus();
    }
    
    // Shake decrypt inputs
    shakeDecryptInputs() {
        const container = document.getElementById('decryptPinInputs');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 500);
        }
    }
    
    async exportData() {
        if (this.entries.length === 0) {
            this.showToast('No entries to export yet. 🌸');
            return;
        }
        
        // Determine if entries are encrypted
        const isEncrypted = this.privacy.isLocked && this.entries.some(e => e.encrypted);
        
        // Prepare entries for readable export (decrypt if needed and enabled)
        let readableEntries = this.entries;
        if (this.exportReadable && isEncrypted && this.unlockKey) {
            // Temporarily decrypt for readable export
            readableEntries = [];
            for (let entry of this.entries) {
                const tempEntry = { ...entry };
                if (entry.encrypted) {
                    if (entry.text) {
                        const decrypted = await this.decryptText(entry.text, this.unlockKey);
                        if (decrypted) tempEntry.text = decrypted;
                    }
                    if (entry.note) {
                        const decrypted = await this.decryptText(entry.note, this.unlockKey);
                        if (decrypted) tempEntry.note = decrypted;
                    }
                }
                readableEntries.push(tempEntry);
            }
        }
        
        // Export JSON backup
        const data = {
            entries: this.entries, // Keep original state (encrypted or not)
            theme: this.currentTheme,
            tags: this.tags,
            prettyMode: this.prettyMode,
            celebrationMode: this.celebrationMode,
            exportReadable: this.exportReadable,
            privacy: this.privacy,
            exportedAt: new Date().toISOString()
        };
        
        // Determine JSON filename
        const jsonFilename = isEncrypted 
            ? `daily-wins-encrypted-backup-${Date.now()}.json`
            : `daily-wins-backup-${Date.now()}.json`;
        
        // Create JSON download
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = jsonFilename;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
        
        // Create readable text file if enabled
        if (this.exportReadable) {
            let content = '====================================\n';
            content += '       DAILY WINS LOG EXPORT\n';
            content += '====================================\n\n';
            content += `Exported on: ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}\n`;
            content += `Total Entries: ${readableEntries.length}\n`;
            if (isEncrypted && this.unlockKey) {
                content += `Status: Decrypted for reading\n`;
            }
            content += '\n====================================\n\n';
            
            // Sort entries by date (oldest first for export)
            const sorted = [...readableEntries].reverse();
            
            sorted.forEach((entry, index) => {
                const date = new Date(entry.date);
                const dateStr = date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                });
                
                content += `Entry #${index + 1}\n`;
                content += `Date: ${dateStr}\n`;
                if (entry.tag) content += `Tag: ${entry.tag}\n`;
                if (entry.emoji) content += `Mood: ${entry.emoji}\n`;
                content += `\n${entry.text}\n`;
                if (entry.note) content += `\nNote: ${entry.note}\n`;
                content += '\n------------------------------------\n\n';
            });
            
            content += '====================================\n';
            content += '   Thank you for using Daily Wins! ✨\n';
            content += '====================================\n';
            
            // Create text download
            const textBlob = new Blob([content], { type: 'text/plain' });
            const textUrl = URL.createObjectURL(textBlob);
            const textLink = document.createElement('a');
            textLink.href = textUrl;
            textLink.download = `daily-wins-readable-${Date.now()}.txt`;
            document.body.appendChild(textLink);
            textLink.click();
            document.body.removeChild(textLink);
            URL.revokeObjectURL(textUrl);
            
            const encryptedLabel = isEncrypted ? ' (encrypted)' : '';
            this.showToast(`Exported: JSON${encryptedLabel} + readable TXT! 📖`);
        } else {
            const encryptedLabel = isEncrypted ? ' (encrypted)' : '';
            this.showToast(`Exported: JSON${encryptedLabel} backup! 📦`);
        }
    }
    
    // ============================================
    // UTILITIES
    // ============================================
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // ============================================
    // ACCESSIBILITY - FOCUS MANAGEMENT
    // ============================================
    
    trapFocus(element) {
        // Get all focusable elements
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Handle Tab key
        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };
        
        // Handle Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                // Close appropriate modal/panel
                if (element.id === 'addModal') this.closeAddModal();
                else if (element.id === 'settings') this.closeSettings();
                else if (element.id === 'setCalmCodeModal') this.closeCalmCodeModal();
                else if (element.id === 'forgotCodeModal') this.closeForgotCodeModal();
                else if (element.id === 'decryptImportModal') this.closeDecryptImportModal();
            }
        };
        
        // Store handlers for cleanup
        element._focusTrapHandlers = { handleTab, handleEscape };
        
        // Add listeners
        element.addEventListener('keydown', handleTab);
        element.addEventListener('keydown', handleEscape);
    }
    
    removeFocusTrap(element) {
        if (element._focusTrapHandlers) {
            element.removeEventListener('keydown', element._focusTrapHandlers.handleTab);
            element.removeEventListener('keydown', element._focusTrapHandlers.handleEscape);
            delete element._focusTrapHandlers;
        }
    }
    
    // ============================================
    // CRYPTOGRAPHY & PRIVACY
    // ============================================
    
    // Hash a PIN using SHA-256
    async hashPin(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Derive an encryption key from the PIN
    async deriveKey(pin) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(pin),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // Use a static salt (in production, this could be stored per-user)
        const salt = encoder.encode('dailywins-journal-salt');
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }
    
    // Encrypt text using AES-GCM
    async encryptText(text, key) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        
        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    }
    
    // Decrypt text using AES-GCM
    async decryptText(encryptedBase64, key) {
        try {
            // Decode from base64
            const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );
            
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }
    
    // Show lock screen
    showLockScreen() {
        const lockScreen = document.getElementById('lockScreen');
        if (!lockScreen) return;
        
        lockScreen.classList.add('active');
        
        // Hide all views to prevent entries from being visible
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        // Clear rendered entries for privacy
        document.getElementById('recentEntries').innerHTML = '';
        document.getElementById('entriesContainer').innerHTML = '';
        
        // Clear any entered PIN
        this.clearPinInput();
        
        // Focus first input
        setTimeout(() => {
            const firstInput = document.querySelector('.pin-input');
            if (firstInput) firstInput.focus();
        }, 300);
    }
    
    // Hide lock screen and unlock app
    async unlockApp() {
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.classList.remove('active');
        }
        
        this.isUnlocked = true;
        
        // Decrypt entries if they are encrypted
        if (this.unlockKey) {
            await this.decryptAllEntries();
        }
        
        // Re-render dashboard to show entries
        this.showDashboard();
        this.startAutoLockTimer();
        this.showToast('Welcome back. 🌸');
    }
    
    // Lock the app
    async lockApp() {
        // Encrypt entries before locking
        if (this.unlockKey && this.privacy.isLocked) {
            await this.encryptAllEntries();
        }
        
        this.isUnlocked = false;
        this.unlockKey = null;
        this.clearAutoLockTimer();
        
        // Show lock screen (which will hide and clear entries)
        this.showLockScreen();
    }
    
    // Check entered PIN
    async checkPin() {
        const pin = this.getPinFromInputs();
        
        if (pin.length !== 4) return;
        
        const hash = await this.hashPin(pin);
        
        if (hash === this.privacy.pinHash) {
            // Correct PIN - derive encryption key
            this.unlockKey = await this.deriveKey(pin);
            await this.unlockApp();
        } else {
            // Incorrect PIN - shake animation
            this.shakePinInputs();
            this.clearPinInput();
            
            // Show subtle error
            const lockMessage = document.querySelector('.lock-message');
            if (lockMessage) {
                const originalText = lockMessage.textContent;
                lockMessage.textContent = 'Try again...';
                lockMessage.style.color = 'var(--text-accent)';
                
                setTimeout(() => {
                    lockMessage.textContent = originalText;
                    lockMessage.style.color = '';
                }, 2000);
            }
        }
    }
    
    // Get PIN from input fields
    getPinFromInputs() {
        const inputs = document.querySelectorAll('.pin-input');
        return Array.from(inputs).map(input => input.value).join('');
    }
    
    // Clear PIN inputs
    clearPinInput() {
        const inputs = document.querySelectorAll('.pin-input');
        inputs.forEach(input => {
            input.value = '';
        });
        if (inputs[0]) inputs[0].focus();
    }
    
    // Shake animation for wrong PIN
    shakePinInputs() {
        const container = document.querySelector('.pin-inputs');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 500);
        }
    }
    
    // Set up Calm Code
    async setCalmCode(pin) {
        const hash = await this.hashPin(pin);
        this.privacy.isLocked = true;
        this.privacy.pinHash = hash;
        this.unlockKey = await this.deriveKey(pin);
        
        // Encrypt all existing entries
        await this.encryptAllEntries();
        
        this.saveData();
        this.isUnlocked = true;
        this.startAutoLockTimer();
        this.showToast('Your journal is now protected. ✨');
    }
    
    // Remove Calm Code
    async removeCalmCode() {
        // Decrypt all entries first
        if (this.unlockKey) {
            await this.decryptAllEntries();
        }
        
        this.privacy.isLocked = false;
        this.privacy.pinHash = null;
        this.privacy.autoLockEnabled = false;
        this.unlockKey = null;
        this.isUnlocked = false;
        
        this.clearAutoLockTimer();
        this.saveData();
        this.showToast('Privacy protection removed. 🍃');
    }
    
    // Encrypt all entries
    async encryptAllEntries() {
        if (!this.unlockKey) return;
        
        for (let entry of this.entries) {
            // Check if already encrypted (has 'encrypted' flag)
            if (entry.encrypted) continue;
            
            // Encrypt text and note
            if (entry.text) {
                entry.text = await this.encryptText(entry.text, this.unlockKey);
            }
            if (entry.note) {
                entry.note = await this.encryptText(entry.note, this.unlockKey);
            }
            entry.encrypted = true;
        }
        
        this.saveData();
    }
    
    // Decrypt all entries
    async decryptAllEntries() {
        if (!this.unlockKey) return;
        
        for (let entry of this.entries) {
            // Check if encrypted
            if (!entry.encrypted) continue;
            
            // Decrypt text and note
            if (entry.text) {
                const decrypted = await this.decryptText(entry.text, this.unlockKey);
                if (decrypted) entry.text = decrypted;
            }
            if (entry.note) {
                const decrypted = await this.decryptText(entry.note, this.unlockKey);
                if (decrypted) entry.note = decrypted;
            }
            entry.encrypted = false;
        }
    }
    
    // Auto-lock timer
    startAutoLockTimer() {
        this.clearAutoLockTimer();
        
        if (this.privacy.autoLockEnabled && this.privacy.isLocked) {
            const minutes = this.privacy.autoLockMinutes || 5;
            this.autoLockTimer = setTimeout(() => {
                this.lockApp();
            }, minutes * 60 * 1000);
        }
    }
    
    clearAutoLockTimer() {
        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
            this.autoLockTimer = null;
        }
    }
    
    // Reset auto-lock timer on user activity
    resetAutoLockTimer() {
        if (this.isUnlocked && this.privacy.autoLockEnabled) {
            this.startAutoLockTimer();
        }
    }
    
    // Show forgot code modal
    showForgotCodeModal() {
        const modal = document.getElementById('forgotCodeModal');
        if (modal) {
            // Store previous focus
            this.previousFocusElement = document.activeElement;
            
            modal.classList.add('active');
            
            // Focus first interactive element and trap focus
            setTimeout(() => {
                const exportBtn = document.getElementById('exportAndResetBtn');
                if (exportBtn) exportBtn.focus();
                this.trapFocus(modal);
            }, 100);
        }
    }
    
    // Close forgot code modal
    closeForgotCodeModal() {
        const modal = document.getElementById('forgotCodeModal');
        if (modal) {
            modal.classList.remove('active');
            this.removeFocusTrap(modal);
        }
        
        // Return focus
        if (this.previousFocusElement) {
            this.previousFocusElement.focus();
            this.previousFocusElement = null;
        }
    }
    
    // Export encrypted data and reset journal
    exportAndReset() {
        // First, export the encrypted backup
        this.exportEncryptedBackup();
        
        // Then reset after a brief delay to ensure download completes
        setTimeout(() => {
            localStorage.removeItem('dailyWinsData');
            this.showToast('Backup exported. Reloading with fresh journal... 🌿');
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }, 500);
    }
    
    // Export encrypted backup (keeps entries encrypted)
    exportEncryptedBackup() {
        if (this.entries.length === 0) {
            this.showToast('No entries to backup. 🌸');
            return;
        }
        
        const data = {
            entries: this.entries, // Keep encrypted state as-is
            theme: this.currentTheme,
            tags: this.tags,
            prettyMode: this.prettyMode,
            celebrationMode: this.celebrationMode,
            privacy: this.privacy, // Include privacy settings with hash
            exportedAt: new Date().toISOString(),
            encrypted: true, // Flag to indicate this is encrypted
            note: 'This backup contains encrypted entries. You will need your original Calm Code to decrypt them.'
        };
        
        // Create JSON download
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `daily-wins-encrypted-backup-${Date.now()}.json`;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
        
        this.showToast('Encrypted backup downloaded! 📦');
    }
    
    // Toggle auto-lock
    toggleAutoLock(enabled) {
        this.privacy.autoLockEnabled = enabled;
        this.saveData();
        
        if (enabled) {
            this.startAutoLockTimer();
        } else {
            this.clearAutoLockTimer();
        }
    }
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new DailyWinsApp();
    
    // Handle window resize for particles
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.app.prettyMode) {
                window.app.initParticles();
            }
        }, 500);
    });
    
    // Reset auto-lock timer on user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        document.addEventListener(event, () => {
            if (window.app) {
                window.app.resetAutoLockTimer();
            }
        }, { passive: true });
    });
});

