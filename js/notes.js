(function() {
    'use strict';

    // Supabase Configuration - REPLACE WITH YOUR OWN
    const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    let supabase = null;
    try {
        if (typeof window.supabase !== 'undefined' && SUPABASE_URL.includes('supabase')) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.log('Supabase not configured, using local storage');
    }

    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const subjectId = params.get('subject') || 'c-programming';
    const noteId = params.get('note') || 'unit1';
    let currentLang = localStorage.getItem('bca_lang') || 'en';
    let isUnlocked = false;

    // DOM elements
    const markdownBody = document.getElementById('markdown-body');
    const noteTitle = document.getElementById('note-title');
    const tocList = document.getElementById('toc-list');
    const lockOverlay = document.getElementById('preview-lock');
    const progressBar = document.getElementById('progress-bar');
    const langToggle = document.getElementById('lang-toggle');
    const langBadge = document.getElementById('lang-badge');
    const unlockModal = document.getElementById('unlock-modal');
    const imageModal = document.getElementById('image-modal');
    const imageModalImg = document.getElementById('image-modal-img');
    const toast = document.getElementById('toast');

    // Build file path: notes/c-programming/unit1-en.md
    function getFilePath() {
        return `notes/${subjectId}/${noteId}-${currentLang}.md`;
    }

    // Show toast message
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Load and render markdown
    async function loadNote() {
        try {
            markdownBody.innerHTML = '<p style="text-align:center;padding:2rem;">⏳ Loading notes...</p>';
            
            const filePath = getFilePath();
            console.log('Fetching:', filePath);
            
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`File not found: ${filePath}`);
            }
            
            const markdown = await response.text();
            const html = marked.parse(markdown);
            markdownBody.innerHTML = html;
            
            // Update title
            if (noteTitle) {
                const unitNum = noteId.replace('unit', 'Unit ');
                noteTitle.textContent = unitNum.charAt(0).toUpperCase() + unitNum.slice(1);
            }
            
            // Update language badge
            if (langBadge) {
                langBadge.textContent = currentLang === 'en' ? '🇬🇧 English' : '🇮🇳 हिन्दी';
            }
            
            // Update lang toggle button
            if (langToggle) {
                langToggle.textContent = currentLang === 'en' ? 'हिन्दी' : 'English';
            }
            
            // Check if unlocked
            const unlockKey = `bca_unlock_${subjectId}_${noteId}`;
            isUnlocked = localStorage.getItem(unlockKey) === 'true';
            
            if (!isUnlocked) {
                applyLock();
            } else {
                lockOverlay.classList.remove('visible');
            }
            
            // Generate Table of Contents
            generateTOC();
            
            // Add copy buttons to code blocks
            addCopyButtons();
            
            // Make images zoomable
            makeImagesZoomable();
            
        } catch (error) {
            console.error('Error loading note:', error);
            markdownBody.innerHTML = `
                <div style="text-align:center;padding:3rem;">
                    <p style="font-size:1.2rem;">😔 Note not found</p>
                    <p style="color:#64748b;margin-top:0.5rem;">File: ${getFilePath()}</p>
                    <p style="color:#94a3b8;font-size:0.85rem;">Create this file to see content</p>
                </div>
            `;
        }
    }

    // Apply 30% preview lock
    function applyLock() {
        const children = Array.from(markdownBody.children);
        const totalElements = children.length;
        
        if (totalElements <= 3) {
            lockOverlay.classList.remove('visible');
            return;
        }
        
        const visibleCount = Math.max(1, Math.ceil(totalElements * 0.3));
        
        for (let i = visibleCount; i < totalElements; i++) {
            children[i].style.display = 'none';
        }
        
        lockOverlay.classList.add('visible');
    }

    // Generate Table of Contents
    function generateTOC() {
        if (!tocList) return;
        
        const headings = markdownBody.querySelectorAll('h2, h3');
        tocList.innerHTML = '';
        
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const link = document.createElement('a');
            link.textContent = heading.textContent;
            link.href = `#${id}`;
            link.style.paddingLeft = heading.tagName === 'H3' ? '1.2rem' : '0';
            link.style.fontSize = heading.tagName === 'H3' ? '0.78rem' : '0.82rem';
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            
            tocList.appendChild(link);
        });
    }

    // Add copy buttons to code blocks
    function addCopyButtons() {
        document.querySelectorAll('.notes-body pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;
            
            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.textContent = '📋 Copy';
            
            button.addEventListener('click', function() {
                const code = pre.querySelector('code')?.textContent || pre.textContent;
                navigator.clipboard.writeText(code).then(() => {
                    button.textContent = '✅ Copied!';
                    setTimeout(() => {
                        button.textContent = '📋 Copy';
                    }, 2000);
                });
            });
            
            pre.style.position = 'relative';
            pre.appendChild(button);
        });
    }

    // Make images zoomable
    function makeImagesZoomable() {
        document.querySelectorAll('.notes-body img').forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function() {
                if (imageModal && imageModalImg) {
                    imageModalImg.src = this.src;
                    imageModal.classList.add('active');
                }
            });
        });
    }

    // Unlock note
    async function unlockNote(name, mobile) {
        try {
            // Save to Supabase if available
            if (supabase) {
                const { error } = await supabase.from('leads').insert([{
                    name: name,
                    mobile: mobile,
                    note_title: `${subjectId}/${noteId}`,
                    created_at: new Date().toISOString()
                }]);
                if (error) console.error('Supabase error:', error);
            }
            
            // Save to localStorage
            const unlockKey = `bca_unlock_${subjectId}_${noteId}`;
            localStorage.setItem(unlockKey, 'true');
            isUnlocked = true;
            
            // Show all hidden elements
            markdownBody.querySelectorAll('*').forEach(el => {
                el.style.display = '';
            });
            
            // Hide lock overlay
            lockOverlay.classList.remove('visible');
            
            // Close modal
            unlockModal.classList.remove('active');
            
            showToast('✅ Notes unlocked successfully!');
            
        } catch (error) {
            console.error('Unlock error:', error);
            // Unlock anyway
            localStorage.setItem(`bca_unlock_${subjectId}_${noteId}`, 'true');
            isUnlocked = true;
            markdownBody.querySelectorAll('*').forEach(el => el.style.display = '');
            lockOverlay.classList.remove('visible');
            unlockModal.classList.remove('active');
            showToast('✅ Notes unlocked!');
        }
    }

    // Event Listeners
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            localStorage.setItem('bca_lang', currentLang);
            loadNote();
        });
    }

    const unlockTrigger = document.getElementById('unlock-trigger');
    if (unlockTrigger) {
        unlockTrigger.addEventListener('click', function() {
            document.getElementById('lead-note-title').value = `${subjectId}/${noteId}`;
            unlockModal.classList.add('active');
        });
    }

    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('lead-name').value.trim();
            const mobile = document.getElementById('lead-mobile').value.trim();
            
            if (name && mobile && mobile.length >= 10) {
                unlockNote(name, mobile);
            } else {
                showToast('⚠️ Please enter valid name and mobile number');
            }
        });
    }

    // Close modals
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.remove('active');
        });
    });

    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    // Progress bar
    window.addEventListener('scroll', function() {
        if (!progressBar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(progress, 100) + '%';
    });

    // Load note on page load
    loadNote();

})();
