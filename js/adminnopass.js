(function() {
    'use strict';

    const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    let supabase = null;
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.log('Supabase not configured');
    }

    // Note Generator
    const noteForm = document.getElementById('note-generator');
    if (noteForm) {
        noteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const subject = document.getElementById('gen-subject').value.trim();
            const unit = document.getElementById('gen-unit').value.trim();
            const lang = document.getElementById('gen-lang').value;
            const markdown = document.getElementById('gen-markdown').value;
            
            if (!subject || !unit || !markdown) {
                alert('Please fill all fields');
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
            
            const output = document.getElementById('generate-output');
            if (output) {
                output.innerHTML = `
                    ✅ File generated: <strong>${filename}</strong><br>
                    <small>Save in: ${folderPath}</small><br>
                    <small>URL: notes.html?subject=${subject}&note=${unit}</small>
                `;
            }
        });
    }

    // Link Generator
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const subject = document.getElementById('link-subject').value.trim();
            const unit = document.getElementById('link-unit').value.trim();
            
            if (!subject || !unit) {
                alert('Enter subject and unit IDs');
                return;
            }
            
            const link = `${window.location.origin}/notes.html?subject=${subject}&note=${unit}`;
            navigator.clipboard.writeText(link).then(() => {
                const output = document.getElementById('link-output');
                if (output) {
                    output.textContent = `✅ Copied: ${link}`;
                }
            });
        });
    }

    // Load Leads
    async function loadLeads() {
        const tbody = document.getElementById('leads-tbody');
        const countEl = document.getElementById('lead-count');
        
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="4">Loading leads...</td></tr>';
        
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
                            name: 'Local User',
                            mobile: 'N/A',
                            note_title: parts.join('/'),
                            created_at: new Date().toISOString()
                        });
                    }
                }
            }
            
            if (leads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;">No leads yet</td></tr>';
            } else {
                tbody.innerHTML = leads.map(lead => `
                    <tr>
                        <td>${escapeHtml(lead.name || 'N/A')}</td>
                        <td>${escapeHtml(lead.mobile || 'N/A')}</td>
                        <td>${escapeHtml(lead.note_title || 'N/A')}</td>
                        <td>${formatDate(lead.created_at)}</td>
                    </tr>
                `).join('');
            }
            
            if (countEl) {
                countEl.textContent = `Total Leads: ${leads.length}`;
            }
            
        } catch (error) {
            console.error('Error loading leads:', error);
            tbody.innerHTML = '<tr><td colspan="4">Error loading leads</td></tr>';
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

    // Export CSV
    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', async function() {
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
            a.download = `leads-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Refresh leads
    const refreshBtn = document.getElementById('refresh-leads');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadLeads);
    }

    // Search leads
    const searchInput = document.getElementById('lead-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#leads-tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // Initial load
    loadLeads();

})();
