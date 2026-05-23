(function() {
    'use strict';

    const semesters = [
        { id: 1, name: 'Semester 1', count: 5 },
        { id: 2, name: 'Semester 2', count: 6 },
        { id: 3, name: 'Semester 3', count: 5 },
        { id: 4, name: 'Semester 4', count: 6 },
        { id: 5, name: 'Semester 5', count: 5 },
        { id: 6, name: 'Semester 6', count: 4 }
    ];

    const subjects = {
        1: [
            { id: 'c-programming', name: 'C Programming', units: 5 },
            { id: 'mathematics-1', name: 'Mathematics I', units: 4 },
            { id: 'digital-electronics', name: 'Digital Electronics', units: 4 },
            { id: 'communication-skills', name: 'Communication Skills', units: 3 },
            { id: 'computer-fundamentals', name: 'Computer Fundamentals', units: 4 }
        ],
        2: [
            { id: 'data-structures', name: 'Data Structures', units: 5 },
            { id: 'mathematics-2', name: 'Mathematics II', units: 4 },
            { id: 'dbms', name: 'Database Management', units: 5 },
            { id: 'oop-cpp', name: 'OOP with C++', units: 5 },
            { id: 'operating-systems', name: 'Operating Systems', units: 4 },
            { id: 'web-technologies', name: 'Web Technologies', units: 4 }
        ],
        3: [
            { id: 'java', name: 'Java Programming', units: 5 },
            { id: 'computer-networks', name: 'Computer Networks', units: 5 },
            { id: 'software-engineering', name: 'Software Engineering', units: 4 },
            { id: 'python', name: 'Python Programming', units: 4 },
            { id: 'discrete-math', name: 'Discrete Mathematics', units: 4 }
        ]
    };

    const units = {
        'c-programming': [
            { id: 'unit1', name: 'Unit 1: Introduction to C', topics: 'Basics, Structure, Data Types, Operators' },
            { id: 'unit2', name: 'Unit 2: Control Statements', topics: 'If-else, Switch, Loops, Jump Statements' },
            { id: 'unit3', name: 'Unit 3: Arrays & Strings', topics: '1D Array, 2D Array, String Functions' },
            { id: 'unit4', name: 'Unit 4: Functions', topics: 'Types, Parameters, Recursion, Scope' },
            { id: 'unit5', name: 'Unit 5: Pointers & DMA', topics: 'Pointer Arithmetic, malloc, calloc, free' }
        ],
        'data-structures': [
            { id: 'unit1', name: 'Unit 1: Introduction to DS', topics: 'Types, Complexity Analysis, ADT' },
            { id: 'unit2', name: 'Unit 2: Arrays & Linked Lists', topics: 'Singly, Doubly, Circular Linked List' },
            { id: 'unit3', name: 'Unit 3: Stacks & Queues', topics: 'Implementation, Applications, Types' },
            { id: 'unit4', name: 'Unit 4: Trees', topics: 'Binary Tree, BST, Traversals' },
            { id: 'unit5', name: 'Unit 5: Graphs', topics: 'BFS, DFS, Shortest Path' }
        ],
        'java': [
            { id: 'unit1', name: 'Unit 1: Java Basics', topics: 'JVM, Data Types, OOP Concepts' },
            { id: 'unit2', name: 'Unit 2: Inheritance & Polymorphism', topics: 'Types, Overloading, Overriding' },
            { id: 'unit3', name: 'Unit 3: Exception Handling', topics: 'Try-catch, Throw, Custom Exceptions' },
            { id: 'unit4', name: 'Unit 4: Multithreading', topics: 'Thread, Runnable, Synchronization' },
            { id: 'unit5', name: 'Unit 5: Collections', topics: 'List, Set, Map, Iterator' }
        ],
        'dbms': [
            { id: 'unit1', name: 'Unit 1: Introduction to DBMS', topics: 'Architecture, Models, Keys' },
            { id: 'unit2', name: 'Unit 2: SQL Basics', topics: 'DDL, DML, DCL, Joins' },
            { id: 'unit3', name: 'Unit 3: Normalization', topics: '1NF, 2NF, 3NF, BCNF' },
            { id: 'unit4', name: 'Unit 4: Transactions', topics: 'ACID, Concurrency Control' },
            { id: 'unit5', name: 'Unit 5: Indexing', topics: 'B-Tree, Hash Index' }
        ],
        'mathematics-1': [
            { id: 'unit1', name: 'Unit 1: Matrices', topics: 'Types, Operations, Determinants' },
            { id: 'unit2', name: 'Unit 2: Differential Calculus', topics: 'Limits, Derivatives, Applications' },
            { id: 'unit3', name: 'Unit 3: Integral Calculus', topics: 'Integration, Definite Integrals' },
            { id: 'unit4', name: 'Unit 4: Vector Algebra', topics: 'Dot Product, Cross Product' }
        ],
        'digital-electronics': [
            { id: 'unit1', name: 'Unit 1: Number Systems', topics: 'Binary, Octal, Hex Conversions' },
            { id: 'unit2', name: 'Unit 2: Logic Gates', topics: 'AND, OR, NOT, NAND, NOR, XOR' },
            { id: 'unit3', name: 'Unit 3: Boolean Algebra', topics: 'Laws, K-Map, Simplification' },
            { id: 'unit4', name: 'Unit 4: Combinational Circuits', topics: 'Mux, Demux, Encoder, Decoder' }
        ],
        'communication-skills': [
            { id: 'unit1', name: 'Unit 1: Basics of Communication', topics: 'Types, Barriers, 7Cs' },
            { id: 'unit2', name: 'Unit 2: Written Communication', topics: 'Reports, Letters, Emails' },
            { id: 'unit3', name: 'Unit 3: Oral Communication', topics: 'Presentations, GD, Interviews' }
        ],
        'computer-fundamentals': [
            { id: 'unit1', name: 'Unit 1: Computer Basics', topics: 'Generations, Types, Components' },
            { id: 'unit2', name: 'Unit 2: Input/Output Devices', topics: 'Keyboard, Mouse, Printers' },
            { id: 'unit3', name: 'Unit 3: Memory & Storage', topics: 'RAM, ROM, HDD, SSD' },
            { id: 'unit4', name: 'Unit 4: Software Concepts', topics: 'System, Application, Utility Software' }
        ]
    };

    function getParam(p) {
        return new URLSearchParams(window.location.search).get(p);
    }

    function getPage() {
        const path = window.location.pathname.split('/').pop();
        return path.replace('.html', '') || 'index';
    }

    function renderSemesters() {
        const grid = document.getElementById('semester-grid');
        if (!grid) return;
        grid.innerHTML = semesters.map(s => `
            <a href="subject.html?sem=${s.id}" class="card">
                <h3>${s.name}</h3>
                <p>${s.count} Subjects</p>
            </a>
        `).join('');
    }

    function renderSubjects() {
        const semId = getParam('sem');
        const grid = document.getElementById('subject-grid');
        const heading = document.getElementById('subject-heading');
        if (!grid || !semId) return;
        
        const list = subjects[parseInt(semId)] || [];
        const sem = semesters.find(s => s.id === parseInt(semId));
        
        if (heading) {
            heading.textContent = sem ? `${sem.name} - Subjects` : 'Subjects';
        }
        
        grid.innerHTML = list.map(sub => `
            <a href="unit.html?subject=${sub.id}" class="card">
                <h3>${sub.name}</h3>
                <p>${sub.units} Units</p>
            </a>
        `).join('');
    }

    function renderUnits() {
        const subjectId = getParam('subject');
        const grid = document.getElementById('unit-grid');
        const heading = document.getElementById('unit-heading');
        const pyqList = document.getElementById('pyq-list');
        
        if (!grid || !subjectId) return;
        
        const unitList = units[subjectId] || [];
        const allSubjects = Object.values(subjects).flat();
        const subj = allSubjects.find(s => s.id === subjectId);
        
        if (heading) {
            heading.textContent = subj ? `${subj.name} - Units` : 'Units';
        }
        
        grid.innerHTML = unitList.map(u => `
            <a href="notes.html?subject=${subjectId}&note=${u.id}" class="unit-item">
                <div class="unit-info">
                    <h3>${u.name}</h3>
                    <span>${u.topics}</span>
                </div>
                <span class="read-badge">📝 Read Notes</span>
            </a>
        `).join('');
        
        if (pyqList) {
            const pyqs = [
                { q: 'Explain the basic structure of a C program.', a: 'A C program consists of preprocessor directives (#include), global declarations, main() function as entry point, and user-defined functions. Each statement ends with semicolon.', badge: 'Viva' },
                { q: 'What are the different data types in C?', a: 'Primary: int (2/4 bytes), float (4 bytes), char (1 byte), double (8 bytes). Derived: array, pointer, structure, union. Void type for empty values.', badge: 'Short' },
                { q: 'Difference between while and do-while loop.', a: 'While loop checks condition first, may not execute if false. Do-while executes at least once before checking condition. Syntax: while(cond){ } vs do{ }while(cond);', badge: 'Repeated' },
                { q: 'Explain call by value vs call by reference with example.', a: 'Call by value passes copy of variable (changes not reflected). Call by reference passes address using pointers (changes reflected). Reference uses & operator.', badge: 'Long' }
            ];
            pyqList.innerHTML = pyqs.map(pyq => `
                <div class="pyq-item" onclick="this.classList.toggle('open')">
                    <span class="pyq-badge">${pyq.badge}</span>
                    ${pyq.q}
                    <div class="pyq-answer">${pyq.a}</div>
                </div>
            `).join('');
        }
    }

    function renderTrending() {
        const grid = document.getElementById('trending-grid');
        if (!grid) return;
        
        const trending = [
            { id: 'c-programming', name: 'C Programming', sem: 'Semester 1' },
            { id: 'data-structures', name: 'Data Structures', sem: 'Semester 2' },
            { id: 'java', name: 'Java Programming', sem: 'Semester 3' },
            { id: 'dbms', name: 'Database Management', sem: 'Semester 2' }
        ];
        
        grid.innerHTML = trending.map(t => `
            <a href="unit.html?subject=${t.id}" class="card">
                <h3>${t.name}</h3>
                <p>${t.sem}</p>
            </a>
        `).join('');
    }

    function initSearch() {
        const input = document.getElementById('global-search');
        const dropdown = document.getElementById('search-results');
        if (!input || !dropdown) return;
        
        const searchIndex = [];
        
        Object.values(subjects).forEach(subs => {
            subs.forEach(s => {
                searchIndex.push({
                    name: s.name,
                    type: 'Subject',
                    url: `unit.html?subject=${s.id}`
                });
            });
        });
        
        Object.entries(units).forEach(([subjId, unitList]) => {
            unitList.forEach(u => {
                searchIndex.push({
                    name: u.name,
                    type: 'Unit',
                    url: `notes.html?subject=${subjId}&note=${u.id}`
                });
            });
        });
        
        input.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length < 2) {
                dropdown.classList.remove('active');
                return;
            }
            
            const matches = searchIndex.filter(item =>
                item.name.toLowerCase().includes(query)
            );
            
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(m => `
                    <a href="${m.url}">${m.type}: ${m.name}</a>
                `).join('');
            } else {
                dropdown.innerHTML = '<p>No results found</p>';
            }
            
            dropdown.classList.add('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Initialize based on page
    const page = getPage();
    
    if (page === 'index') {
        renderSemesters();
        renderTrending();
        initSearch();
    } else if (page === 'semester') {
        renderSemesters();
    } else if (page === 'subject') {
        renderSubjects();
    } else if (page === 'unit') {
        renderUnits();
    }

})();
