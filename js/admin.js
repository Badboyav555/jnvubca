(function() {
    'use strict';

    // ============ PASSWORD MANAGEMENT ============
    const DEFAULT_PASSWORD = 'admin123';
    let isAuthenticated = false;

    // Get stored password or use default
    function getStoredPassword() {
        return localStorage.getItem('bca_admin_password') || DEFAULT_PASSWORD;
    }

    // Save new password
    function savePassword(newPass) {
        localStorage.setItem('bca_admin_password', newPass);
    }

    // Check if already logged in
    function checkSession() {
        const session = localStorage.getItem('bca_admin_session');
        if (session === 'true') {
            showDashboard();
        }
    }

    // Login
    function login(password) {
        const storedPassword = getStoredPassword();
        if (password === storedPassword) {
            localStorage.setItem('bca_admin_session', 'true');
            showDashboard();
            return true;
        }
        return false;
    }

    // Logout
    function logout() {
        localStorage.removeItem('bca_admin_session');
        hideDashboard();
    }

    // Show Dashboard
    function showDashboard() {
        isAuthenticated = true;
        document.getElementById('passwordGate').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        loadLeads();
    }

    // Hide Dashboard
    function hideDashboard() {
        isAuthenticated = false;
        document.getElementById('passwordGate').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('adminPassword').value = '';
    }

    // ============ SUPABASE CONFIG ============
    const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    let supabase = null;
    try {
        if (typeof window.supabase !== 'undefined' && SUPABASE_URL.includes('supabase')) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.log('Supabase not configured');
    }

    // ============ EVENT LISTENERS ============
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', function() {
        const password = document.getElementById('adminPassword').value;
        const errorEl = document.getElementById('loginError');
        
        if (login(password)) {
            errorEl.style.display = 'none';
        } else {
            errorEl.style.display = 'block';
        }
    });

    // Enter key for password input
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });

    // Change Password
    document.getElementById('changePasswordBtn').addEventListener('click', function() {
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const output = document.getElementById('password-output');
        
        if (!currentPass || !newPass) {
            output.innerHTML = '<span style="color:#ef4444;">Please fill both fields</span>';
            return;
        }
        
        if (newPass.length < 6) {
            output.innerHTML = '<span style="color:#ef4444;">Password must be at least 6 characters</span>';
            return;
        }
        
        if (currentPass !== getStoredPassword()) {
            output.innerHTML = '<span style="color:#ef4444;">❌ Current password is wrong!</span>';
            return;
        }
        
        savePassword(newPass);
        output.innerHTML = '<span style="color:#16a34a;">✅ Password updated successfully!</span>';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
    });

    // ============ NOTE GENERATOR ============
    document.getElementById('note-generator').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const subject = document.getElementById('gen-subject').value.trim();
        const unit = document.getElementById('gen-unit').value.trim();
        const lang = document.getElementById('gen-lang').value;
        const markdown = document.getElementById('gen-markdown').value;
        const output = document.getElementById('generate-output');
        
        if (!subject || !unit || !markdown) {
            output.innerHTML = '<span style="color:#ef4444;">Please fill all fields</span>';
            return;
        }
        
        const filename = `${unit}-${lang}.md`;
        const folderPath = `notes/${subject}/`;
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        output.innerHTML = `
            <span style="color:#16a34a;">✅ File generated!</span><br>
            <strong>${filename}</strong><br>
            <small style="color:#64748b;">Save in: ${folderPath}</small><br>
            <small style="color:#64748b;">URL: notes.html?subject=${subject}&note=${unit}</small>
        `;
    });

    // ============ LINK GENERATOR ============
    document.getElementById('copy-link-btn').addEventListener('click', function() {
        const subject = document.getElementById('link-subject').value.trim();
        const unit = document.getElementById('link-unit').value.trim();
        const output = document.getElementById('link-output');
        
        if (!subject || !unit) {
            output.innerHTML = '<span style="color:#ef4444;">Enter subject and unit IDs</span>';
            return;
        }
        
        const link = `${window.location.origin}/notes.html?subject=${subject}&note=${unit}`;
        navigator.clipboard.writeText(link).then(() => {
            output.innerHTML = `<span style="color:#16a34a;">✅ Copied!</span><br><small style="word-break:break-all;">${link}</small>`;
        });
    });

    // ============ LIVE MARKDOWN PREVIEW ============
    const previewTextarea = document.getElementById('preview-markdown');
    const previewBox = document.getElementById('live-preview');
    
    if (previewTextarea && previewBox && typeof marked !== 'undefined') {
        previewTextarea.addEventListener('input', function() {
            previewBox.innerHTML = marked.parse(this.value);
        });
    }

    // ============ LEADS MANAGEMENT ============
    async function loadLeads() {
        const tbody = document.getElementById('leads-tbody');
        const countEl = document.getElementById('lead-count');
        
        if (!tbody || !isAuthenticated) return;
        
        tbody.innerHTML = '<tr><td colspan="5">Loading leads...</td></tr>';
        
        let leads = [];
        
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('leads')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                leads = data || [];
            } else {
                // Fallback: get from localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('bca_unlock_')) {
                        const parts = key.replace('bca_unlock_', '').split('_');
                        leads.push({
                            id: i,
                            name: 'Local User',
                            mobile: 'N/A',
                            note_title: parts.join('/'),
                            created_at: new Date().toISOString()
                        });
                    }
                }
            }
            
            if (leads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#94a3b8;">No leads collected yet</td></tr>';
            } else {
                tbody.innerHTML = leads.map(lead => `
                    <tr>
                        <td>${escapeHtml(lead.name || 'N/A')}</td>
                        <td>${escapeHtml(lead.mobile || 'N/A')}</td>
                        <td><span class="badge">${escapeHtml(lead.note_title || 'N/A')}</span></td>
                        <td>${formatDate(lead.created_at)}</td>
                        <td>
                            <button onclick="deleteLead('${lead.id}')" style="background:none;border:none;cursor:pointer;font-size:1.1rem;" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('');
            }
            
            if (countEl) {
                countEl.textContent = `Total Leads: ${leads.length}`;
            }
            
        } catch (error) {
            console.error('Error loading leads:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="color:#ef4444;">Error loading leads</td></tr>';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    }

    // Delete lead
    window.deleteLead = async function(id) {
        if (!confirm('Delete this lead permanently?')) return;
        
        if (supabase) {
            const { error } = await supabase.from('leads').delete().eq('id', id);
            if (error) {
                alert('Error deleting lead');
                return;
            }
        }
        
        loadLeads();
    };

    // Export CSV
    document.getElementById('export-csv').addEventListener('click', async function() {
        let leads = [];
        
        if (supabase) {
            const { data } = await supabase.from('leads').select('*');
            leads = data || [];
        } else {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('bca_unlock_')) {
                    leads.push({
                        name: 'User',
                        mobile: 'N/A',
                        note_title: key.replace('bca_unlock_', ''),
                        created_at: new Date().toISOString()
                    });
                }
            }
        }
        
        if (leads.length === 0) {
            alert('No leads to export');
            return;
        }
        
        const csv = [
            ['Name', 'Mobile', 'Note Title', 'Date'],
            ...leads.map(l => [l.name, l.mobile, l.note_title, l.created_at])
        ].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bca-leads-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Refresh leads
    document.getElementById('refresh-leads').addEventListener('click', loadLeads);

    // Search leads
    document.getElementById('lead-search').addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const rows = document.querySelectorAll('#leads-tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });

    // ============ INITIALIZE ============
    checkSession();

})();
