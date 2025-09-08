        // Time slots configuration
        const TIME_SLOTS = [
            { time: '10:00-10:50', type: 'morning' },
            { time: '10:50-11:40', type: 'morning' },
            { time: '11:40-12:30', type: 'morning' },
            { time: '12:30-1:20', type: 'morning' },
            { time: '1:20-2:20', type: 'lunch' },
            { time: '2:20-3:10', type: 'afternoon' },
            { time: '3:10-4:00', type: 'afternoon' },
            { time: '4:00-4:50', type: 'afternoon' }
        ];

        const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Global faculty schedule to track assignments across all branches/semesters
        let globalFacultySchedule = {};
        let programCount = 0;
        let dragSource = null;
        let currentTimetables = [];
        
        // Undo/Redo functionality
        let actionHistory = [];
        let currentHistoryIndex = -1;
        const MAX_HISTORY = 50;
        
        // Session management
        let currentSession = "Default Session";

        // Room database
        const ROOMS = [
            "Room 101", "Room 102", "Room 103", "Room 104", "Room 105",
            "Lab A", "Lab B", "Lab C", "Auditorium", "Conference Room", "Other"
        ];

        // Branch options
        const BRANCHES = [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics and Communication",
            "Computer Science and Engineering",
            "Other"
        ];

        // Add a new program
        function addProgram() {
            programCount++;
            const programId = `program-${programCount}`;
            const programsContainer = document.getElementById('programsContainer');
            
            const programDiv = document.createElement('div');
            programDiv.className = 'program-container';
            programDiv.id = programId;
            programDiv.innerHTML = `
                <div class="program-header">
                    <div class="program-title">Program ${programCount}</div>
                    <div class="program-controls">
                        <button class="remove-btn" onclick="removeProgram('${programId}')">Remove Program</button>
                    </div>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label for="branch-${programCount}">Branch:</label>
                        <select id="branch-${programCount}" class="branch-select" onchange="handleBranchChange(${programCount})">
                            <option value="">Select Branch</option>
                            ${BRANCHES.map(branch => `<option value="${branch}">${branch}</option>`).join('')}
                        </select>
                        <input type="text" id="custom-branch-${programCount}" class="custom-branch-input" placeholder="Specify branch">
                    </div>
                    <div class="control-group">
                        <label for="semester-${programCount}">Semester:</label>
                        <select id="semester-${programCount}" required>
                            <option value="">Select Semester</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                            <option value="4">Semester 4</option>
                            <option value="5">Semester 5</option>
                            <option value="6">Semester 6</option>
                            <option value="7">Semester 7</option>
                            <option value="8">Semester 8</option>
                        </select>
                    </div>
                </div>
                <table class="subject-table">
                    <thead>
                        <tr>
                            <th>Subject Name</th>
                            <th>Subject Code</th>
                            <th>Faculty Name</th>
                            <th>L</th>
                            <th>T</th>
                            <th>P (Hours per Group)</th>
                            <th>No. of Groups</th>
                            <th>Room Preference</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="subjectTableBody-${programCount}">
                        <tr>
                            <td><input type="text" class="subject-name" placeholder="e.g., Data Structures"></td>
                            <td><input type="text" class="subject-code" placeholder="e.g., CS201"></td>
                            <td><input type="text" class="faculty-name" placeholder="e.g., Dr. Smith"></td>
                            <td><input type="number" class="ltp-input lecture-count" min="0" max="5" value="3"></td>
                            <td><input type="number" class="ltp-input tutorial-count" min="0" max="3" value="1"></td>
                            <td><input type="number" class="ltp-input practical-count" min="0" max="4" value="2"></td>
                            <td><input type="number" class="groups-input" min="1" max="8" value="2"></td>
                            <td>
                                <select class="room-input" onchange="handleRoomChange(this)">
                                    <option value="">No preference</option>
                                    ${ROOMS.map(room => `<option value="${room}">${room}</option>`).join('')}
                                </select>
                                <input type="text" class="custom-room-input" placeholder="Room number">
                            </td>
                            <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
                        </tr>
                    </tbody>
                </table>
                <div class="button-group">
                    <button class="btn-secondary" onclick="addSubjectRow('${programCount}')">
                        ➕ Add Subject
                    </button>
                </div>
            `;
            
            programsContainer.appendChild(programDiv);
        }

        // Handle branch selection change
        function handleBranchChange(programNum) {
            const branchSelect = document.getElementById(`branch-${programNum}`);
            const customBranchInput = document.getElementById(`custom-branch-${programNum}`);
            
            if (branchSelect.value === "Other") {
                customBranchInput.style.display = "block";
            } else {
                customBranchInput.style.display = "none";
            }
        }

        // Handle room selection change
        function handleRoomChange(selectElement) {
            const customRoomInput = selectElement.parentElement.querySelector('.custom-room-input');
            
            if (selectElement.value === "Other") {
                customRoomInput.style.display = "inline-block";
            } else {
                customRoomInput.style.display = "none";
            }
        }

        // Remove a program
        function removeProgram(programId) {
            const program = document.getElementById(programId);
            if (document.querySelectorAll('.program-container').length > 1) {
                program.remove();
                // Update program count
                programCount = document.querySelectorAll('.program-container').length;
            } else {
                showMessage('At least one program is required', 'error');
            }
        }

        // Add subject row to a specific program
        function addSubjectRow(programId) {
            const tbody = document.getElementById(`subjectTableBody-${programId}`);
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" class="subject-name" placeholder="e.g., Data Structures"></td>
                <td><input type="text" class="subject-code" placeholder="e.g., CS201"></td>
                <td><input type="text" class="faculty-name" placeholder="e.g., Dr. Smith"></td>
                <td><input type="number" class="ltp-input lecture-count" min="0" max="5" value="0"></td>
                <td><input type="number" class="ltp-input tutorial-count" min="0" max="3" value="0"></td>
                <td><input type="number" class="ltp-input practical-count" min="0" max="4" value="0"></td>
                <td><input type="number" class="groups-input" min="1" max="8" value="2"></td>
                <td>
                    <select class="room-input" onchange="handleRoomChange(this)">
                        <option value="">No preference</option>
                        ${ROOMS.map(room => `<option value="${room}">${room}</option>`).join('')}
                    </select>
                    <input type="text" class="custom-room-input" placeholder="Room number">
                </td>
                <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
            `;
            tbody.appendChild(newRow);
        }

        function removeRow(button) {
            const row = button.closest('tr');
            const tbody = row.parentElement;
            if (tbody.children.length > 1) {
                row.remove();
            } else {
                showMessage('At least one subject is required', 'error');
            }
        }

        function clearAll() {
            if (confirm('Are you sure you want to clear all programs and data?')) {
                document.getElementById('programsContainer').innerHTML = '';
                document.getElementById('messageContainer').innerHTML = '';
                document.getElementById('timetablesOutput').classList.add('hidden');
                document.getElementById('programTabs').innerHTML = '';
                document.getElementById('timetableViews').innerHTML = '';
                programCount = 0;
                addProgram(); // Add one program by default
                actionHistory = [];
                currentHistoryIndex = -1;
                globalFacultySchedule = {};
            }
        }

        function showMessage(message, type) {
            const container = document.getElementById('messageContainer');
            container.innerHTML = `
                <div class="${type === 'error' ? 'error-message' : 'success-message'}">
                    ${type === 'error' ? '❌' : '✅'} ${message}
                </div>
            `;
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    container.innerHTML = '';
                }, 5000);
            }
        }

        function showNotification(message, type) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.className = 'notification';
            }, 3000);
        }

        function collectAllProgramsData() {
            const programs = [];
            const programContainers = document.querySelectorAll('.program-container');
            
            if (programContainers.length === 0) {
                throw new Error('Please add at least one program');
            }
            
            programContainers.forEach((container, index) => {
                const programId = container.id;
                const programNum = programId.split('-')[1];
                
                const branchSelect = document.getElementById(`branch-${programNum}`);
                const customBranchInput = document.getElementById(`custom-branch-${programNum}`);
                const branch = branchSelect.value === "Other" ? customBranchInput.value.trim() : branchSelect.value;
                
                const semester = document.getElementById(`semester-${programNum}`).value;
                
                if (!branch || !semester) {
                    throw new Error(`Program ${index + 1}: Please select branch and semester`);
                }
                
                const subjects = [];
                const rows = container.querySelectorAll(`#subjectTableBody-${programNum} tr`);
                const subjectCodes = new Set();
                
                rows.forEach((row, rowIndex) => {
                    const subjectName = row.querySelector('.subject-name').value.trim();
                    const subjectCode = row.querySelector('.subject-code').value.trim();
                    const facultyName = row.querySelector('.faculty-name').value.trim();
                    const lectures = parseInt(row.querySelector('.lecture-count').value) || 0;
                    const tutorials = parseInt(row.querySelector('.tutorial-count').value) || 0;
                    const practicals = parseInt(row.querySelector('.practical-count').value) || 0;
                    const groups = parseInt(row.querySelector('.groups-input').value) || 2;
                    
                    const roomSelect = row.querySelector('.room-input');
                    const customRoomInput = row.querySelector('.custom-room-input');
                    const roomPreference = roomSelect.value === "Other" ? customRoomInput.value.trim() : roomSelect.value;
                    
                    if (!subjectName || !subjectCode || !facultyName) {
                        throw new Error(`Program ${index + 1}: All subject fields are required`);
                    }
                    
                    // Check for duplicate subject codes
                    if (subjectCodes.has(subjectCode)) {
                        throw new Error(`Program ${index + 1}: Duplicate subject code "${subjectCode}"`);
                    }
                    subjectCodes.add(subjectCode);
                    
                    subjects.push({
                        name: subjectName,
                        code: subjectCode,
                        faculty: facultyName,
                        lectures: lectures,
                        tutorials: tutorials,
                        practicals: practicals,
                        groups: groups,
                        roomPreference: roomPreference
                    });
                });
                
                if (subjects.length === 0) {
                    throw new Error(`Program ${index + 1}: Please add at least one subject with complete details`);
                }
                
                programs.push({
                    id: programId,
                    branch: branch,
                    semester: semester,
                    subjects: subjects
                });
            });
            
            return programs;
        }

        function initializeTimetable() {
            const timetable = {};
            DAYS.forEach(day => {
                timetable[day] = {};
                TIME_SLOTS.forEach(slot => {
                    if (slot.type !== 'lunch') {
                        timetable[day][slot.time] = null;
                    }
                });
            });
            return timetable;
        }

        function checkFacultyAvailability(faculty, day, timeSlot) {
            if (!faculty) return true;
            
            if (!globalFacultySchedule[faculty]) {
                globalFacultySchedule[faculty] = {};
            }
            if (!globalFacultySchedule[faculty][day]) {
                globalFacultySchedule[faculty][day] = {};
            }
            return !globalFacultySchedule[faculty][day][timeSlot];
        }

        function assignFacultySlot(faculty, day, timeSlot, assignment) {
            if (!faculty) return;
            
            if (!globalFacultySchedule[faculty]) {
                globalFacultySchedule[faculty] = {};
            }
            if (!globalFacultySchedule[faculty][day]) {
                globalFacultySchedule[faculty][day] = {};
            }
            globalFacultySchedule[faculty][day][timeSlot] = assignment;
        }

        function removeFacultyAssignment(faculty, day, timeSlot) {
            if (globalFacultySchedule[faculty] && 
                globalFacultySchedule[faculty][day] && 
                globalFacultySchedule[faculty][day][timeSlot]) {
                delete globalFacultySchedule[faculty][day][timeSlot];
            }
        }

        function scheduleProgramSessions(timetable, program) {
            const errors = [];
            const { branch, semester, subjects } = program;
            
            // Schedule lectures and tutorials (morning slots)
            subjects.forEach(subject => {
                let lecturesScheduled = 0;
                let tutorialsScheduled = 0;
                
                // Schedule lectures
                for (let i = 0; i < subject.lectures && lecturesScheduled < subject.lectures; i++) {
                    let scheduled = false;
                    for (const day of DAYS) {
                        if (scheduled) break;
                        for (const slot of TIME_SLOTS) {
                            if (slot.type === 'morning' && !timetable[day][slot.time]) {
                                if (checkFacultyAvailability(subject.faculty, day, slot.time)) {
                                    timetable[day][slot.time] = {
                                        type: 'lecture',
                                        subject: subject.name,
                                        code: subject.code,
                                        faculty: subject.faculty,
                                        room: subject.roomPreference || getAvailableRoom(day, slot.time)
                                    };
                                    assignFacultySlot(subject.faculty, day, slot.time, 
                                        `${branch}-Sem${semester}-${subject.code}`);
                                    lecturesScheduled++;
                                    scheduled = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!scheduled) {
                        errors.push(`Unable to schedule all lectures for ${subject.name} - Faculty ${subject.faculty} conflict or insufficient slots`);
                        break;
                    }
                }
                
                // Schedule tutorials
                for (let i = 0; i < subject.tutorials && tutorialsScheduled < subject.tutorials; i++) {
                    let scheduled = false;
                    for (const day of DAYS) {
                        if (scheduled) break;
                        for (const slot of TIME_SLOTS) {
                            if (slot.type === 'morning' && !timetable[day][slot.time]) {
                                if (checkFacultyAvailability(subject.faculty, day, slot.time)) {
                                    timetable[day][slot.time] = {
                                        type: 'tutorial',
                                        subject: subject.name,
                                        code: subject.code,
                                        faculty: subject.faculty,
                                        room: subject.roomPreference || getAvailableRoom(day, slot.time)
                                    };
                                    assignFacultySlot(subject.faculty, day, slot.time, 
                                        `${branch}-Sem${semester}-${subject.code}`);
                                    tutorialsScheduled++;
                                    scheduled = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!scheduled) {
                        errors.push(`Unable to schedule all tutorials for ${subject.name} - Faculty ${subject.faculty} conflict or insufficient slots`);
                        break;
                    }
                }
            });
            
            // Schedule practicals (afternoon slots) - Each group gets the full hours
            const practicalSubjects = subjects.filter(s => s.practicals > 0);
            
            if (practicalSubjects.length > 0) {
                // Create a list of all practical sessions needed (per group)
                const practicalSessions = [];
                
                practicalSubjects.forEach(subject => {
                    for (let group = 1; group <= subject.groups; group++) {
                        for (let i = 0; i < subject.practicals; i++) {
                            practicalSessions.push({
                                subject: subject,
                                group: group
                            });
                        }
                    }
                });
                
                // Shuffle practical sessions to distribute them more evenly
                practicalSessions.sort(() => Math.random() - 0.5);
                
                // Schedule each practical session
                practicalSessions.forEach(session => {
                    const { subject, group } = session;
                    let scheduled = false;
                    
                    for (const day of DAYS) {
                        if (scheduled) break;
                        for (const slot of TIME_SLOTS) {
                            if (slot.type === 'afternoon' && !timetable[day][slot.time]) {
                                if (checkFacultyAvailability(subject.faculty, day, slot.time)) {
                                    timetable[day][slot.time] = {
                                        type: 'practical',
                                        subject: subject.name,
                                        code: subject.code,
                                        faculty: subject.faculty,
                                        group: `Group ${group}`,
                                        room: subject.roomPreference || getAvailableRoom(day, slot.time)
                                    };
                                    
                                    assignFacultySlot(subject.faculty, day, slot.time, 
                                        `${branch}-Sem${semester}-${subject.code}-Practical-G${group}`);
                                    scheduled = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (!scheduled) {
                        errors.push(`Unable to schedule all practicals for ${subject.name} Group ${group} - Faculty ${subject.faculty} conflict or insufficient afternoon slots`);
                    }
                });
            }
            
            return errors;
        }

        function getAvailableRoom(day, timeSlot) {
            // Simple room assignment logic
            const roomIndex = Math.floor(Math.random() * ROOMS.length);
            return ROOMS[roomIndex];
        }

        function fillVacantSlots(timetable) {
            for (const day of DAYS) {
                for (const slot of TIME_SLOTS) {
                    if (slot.type !== 'lunch' && !timetable[day][slot.time]) {
                        if (slot.type === 'morning') {
                            // Alternate between Library and TPPG for morning slots
                            timetable[day][slot.time] = Math.random() > 0.5 ? {
                                type: 'library',
                                subject: 'Library',
                                code: 'LIB',
                                faculty: 'Librarian',
                                room: 'Library'
                            } : {
                                type: 'tppg',
                                subject: 'TPPG (Training & Placement)',
                                code: 'TPPG',
                                faculty: 'TPO',
                                room: 'Conference Room'
                            };
                        } else {
                            // Mentor-Mentee for afternoon slots
                            timetable[day][slot.time] = {
                                type: 'mentor',
                                subject: 'Mentor-Mentee Interaction',
                                code: 'MENT',
                                faculty: 'Mentor',
                                room: 'Various'
                            };
                        }
                    }
                }
            }
        }

        function showLoading() {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-overlay';
            loadingDiv.id = 'loadingOverlay';
            loadingDiv.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loadingDiv);
        }

        function hideLoading() {
            const loadingDiv = document.getElementById('loadingOverlay');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }

        function generateAllTimetables() {
            try {
                showLoading();
                
                // Reset global faculty schedule
                globalFacultySchedule = {};
                
                // Collect all programs data
                const programs = collectAllProgramsData();
                
                // Validate and generate timetable for each program
                const timetables = [];
                const allErrors = [];
                
                // First pass: Check if there are enough slots for all programs
                programs.forEach(program => {
                    const totalMorningNeeded = program.subjects.reduce((sum, s) => sum + s.lectures + s.tutorials, 0);
                    const totalAfternoonNeeded = program.subjects.reduce((sum, s) => sum + (s.practicals * s.groups), 0);
                    const availableMorning = DAYS.length * TIME_SLOTS.filter(s => s.type === 'morning').length;
                    const availableAfternoon = DAYS.length * TIME_SLOTS.filter(s => s.type === 'afternoon').length;
                    
                    if (totalMorningNeeded > availableMorning) {
                        throw new Error(`${program.branch} Sem ${program.semester}: Not enough morning periods. Required: ${totalMorningNeeded}, Available: ${availableMorning}`);
                    }
                    
                    if (totalAfternoonNeeded > availableAfternoon) {
                        throw new Error(`${program.branch} Sem ${program.semester}: Not enough afternoon periods. Required: ${totalAfternoonNeeded}, Available: ${availableAfternoon}`);
                    }
                });
                
                // Second pass: Generate timetables
                programs.forEach(program => {
                    const timetable = initializeTimetable();
                    const errors = scheduleProgramSessions(timetable, program);
                    
                    if (errors.length > 0) {
                        allErrors.push(...errors.map(error => `${program.branch} Sem ${program.semester}: ${error}`));
                    }
                    
                    // Fill vacant slots if enabled
                    if (document.getElementById('autoFillVacant').checked) {
                        fillVacantSlots(timetable);
                    }
                    
                    timetables.push({
                        program: program,
                        timetable: timetable,
                        errors: errors
                    });
                });
                
                if (allErrors.length > 0) {
                    showMessage('Scheduling conflicts detected:<br>' + allErrors.join('<br>'), 'error');
                } else {
                    showMessage('All timetables generated successfully!', 'success');
                }
                
                // Store current timetables for drag and drop
                currentTimetables = timetables;
                
                // Save to history for undo/redo
                saveToHistory();
                
                // Display all timetables
                displayAllTimetables(timetables);
                
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        function checkFacultyConflicts() {
            const facultyAssignments = {};
            const conflicts = [];
            
            // Reset all conflict highlighting
            document.querySelectorAll('.faculty-conflict').forEach(el => {
                el.classList.remove('faculty-conflict');
                el.classList.remove('faculty-conflict-tooltip');
            });
            
            if (!document.getElementById('highlightConflicts').checked) return;
            
            // Collect all faculty assignments
            currentTimetables.forEach((timetableData, programIndex) => {
                const program = timetableData.program;
                DAYS.forEach(day => {
                    TIME_SLOTS.forEach(slot => {
                        if (slot.type !== 'lunch') {
                            const session = timetableData.timetable[day][slot.time];
                            if (session && session.faculty) {
                                const key = `${session.faculty}-${day}-${slot.time}`;
                                if (!facultyAssignments[key]) {
                                    facultyAssignments[key] = [];
                                }
                                facultyAssignments[key].push({
                                    programIndex,
                                    day,
                                    time: slot.time,
                                    session
                                });
                            }
                        }
                    });
                });
            });
            
            // Find conflicts
            for (const key in facultyAssignments) {
                if (facultyAssignments[key].length > 1) {
                    conflicts.push(...facultyAssignments[key]);
                }
            }
            
            // Highlight conflicts
            conflicts.forEach(conflict => {
                const cell = document.querySelector(`[data-program="${conflict.programIndex}"][data-day="${conflict.day}"][data-time="${conflict.time}"]`);
                if (cell) {
                    cell.classList.add('faculty-conflict');
                    cell.classList.add('faculty-conflict-tooltip');
                }
            });
            
            return conflicts;
        }

        function displayAllTimetables(timetables) {
            const output = document.getElementById('timetablesOutput');
            const tabsContainer = document.getElementById('programTabs');
            const viewsContainer = document.getElementById('timetableViews');
            const statsContainer = document.getElementById('timetableStats');
            
            tabsContainer.innerHTML = '';
            viewsContainer.innerHTML = '';
            
            // Calculate statistics
            let totalSlots = 0;
            let filledSlots = 0;
            let lectureCount = 0;
            let tutorialCount = 0;
            let practicalCount = 0;
            let activityCount = 0;
            
            timetables.forEach((timetableData, index) => {
                const program = timetableData.program;
                const timetableId = `timetable-${index}`;
                const tabId = `tab-${index}`;
                
                // Create tab
                const tab = document.createElement('div');
                tab.className = `program-tab ${index === 0 ? 'active' : ''}`;
                tab.id = tabId;
                tab.textContent = `${program.branch} - Sem ${program.semester}`;
                tab.onclick = () => activateTab(index);
                tabsContainer.appendChild(tab);
                
                // Create timetable view
                const view = document.createElement('div');
                view.className = `timetable-view ${index === 0 ? 'active' : ''}`;
                view.id = timetableId;
                
                let html = `
                    <div class="timetable-container">
                        <h2 style="margin: 20px 0;">Timetable for ${program.branch} - Semester ${program.semester}</h2>
                        <table class="timetable">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    ${DAYS.map(day => `<th>${day}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                TIME_SLOTS.forEach(slot => {
                    html += '<tr>';
                    html += `<td class="time-slot">${slot.time}</td>`;
                    
                    if (slot.type === 'lunch') {
                        html += `<td colspan="6" class="lunch-break">LUNCH BREAK</td>`;
                    } else {
                        DAYS.forEach(day => {
                            const session = timetableData.timetable[day][slot.time];
                            if (session) {
                                let cellClass = '';
                                if (session.type === 'lecture') {
                                    cellClass = 'lecture-cell';
                                    lectureCount++;
                                    filledSlots++;
                                } else if (session.type === 'tutorial') {
                                    cellClass = 'tutorial-cell';
                                    tutorialCount++;
                                    filledSlots++;
                                } else if (session.type === 'practical') {
                                    cellClass = 'practical-cell';
                                    practicalCount++;
                                    filledSlots++;
                                } else if (session.type === 'library') {
                                    cellClass = 'library-cell';
                                    activityCount++;
                                    filledSlots++;
                                } else if (session.type === 'tppg') {
                                    cellClass = 'tppg-cell';
                                    activityCount++;
                                    filledSlots++;
                                } else if (session.type === 'mentor') {
                                    cellClass = 'mentor-cell';
                                    activityCount++;
                                    filledSlots++;
                                }
                                
                                html += `<td class="${cellClass}" 
                                    draggable="true"
                                    data-day="${day}" 
                                    data-time="${slot.time}"
                                    data-program="${index}"
                                    data-type="${session.type}"
                                    data-subject="${session.subject}"
                                    data-code="${session.code}"
                                    data-faculty="${session.faculty}"
                                    ${session.group ? `data-group="${session.group}"` : ''}
                                    ondragstart="dragStart(event)" 
                                    ondragover="dragOver(event)" 
                                    ondrop="drop(event)" 
                                    ondragenter="dragEnter(event)" 
                                    ondragleave="dragLeave(event)">
                                    <strong>${session.code}</strong><br>
                                    ${session.subject}<br>
                                    <em>${session.faculty}</em>
                                    ${session.room ? `<div class="room-assignment">${session.room}</div>` : ''}
                                    ${session.group ? `<div class="group-info">${session.group}</div>` : ''}
                                </td>`;
                            } else {
                                html += `<td draggable="true"
                                    data-day="${day}" 
                                    data-time="${slot.time}"
                                    data-program="${index}"
                                    ondragstart="dragStart(event)" 
                                    ondragover="dragOver(event)" 
                                    ondrop="drop(event)" 
                                    ondragenter="dragEnter(event)" 
                                    ondragleave="dragLeave(event)">-</td>`;
                            }
                            totalSlots++;
                        });
                    }
                    
                    html += '</tr>';
                });
                
                html += `
                            </tbody>
                        </table>
                        <div style="margin-top: 20px;">
                            <button class="btn-export" onclick="exportToCSV('${program.branch}', '${program.semester}', ${index})">
                                📥 Export to CSV
                            </button>
                        </div>
                    </div>
                `;
                
                view.innerHTML = html;
                viewsContainer.appendChild(view);
            });
            
            // Display statistics if enabled
            if (document.getElementById('showStats').checked) {
                const vacantSlots = totalSlots - filledSlots;
                const facultyConflicts = checkFacultyConflicts();
                
                statsContainer.innerHTML = `
                    <h3>📊 Timetable Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${totalSlots}</div>
                            <div class="stat-label">Total Slots</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${filledSlots}</div>
                            <div class="stat-label">Filled Slots</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${vacantSlots}</div>
                            <div class="stat-label">Vacant Slots</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${lectureCount}</div>
                            <div class="stat-label">Lectures</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${tutorialCount}</div>
                            <div class="stat-label">Tutorials</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${practicalCount}</div>
                            <div class="stat-label">Practicals</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${activityCount}</div>
                            <div class="stat-label">Activities</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${Math.round((filledSlots/totalSlots)*100)}%</div>
                            <div class="stat-label">Utilization</div>
                        </div>
                        ${facultyConflicts.length > 0 ? `
                        <div class="stat-item" style="grid-column: 1 / -1;">
                            <div class="stat-value" style="color: #c53030;">${facultyConflicts.length}</div>
                            <div class="stat-label">Faculty Conflicts Detected</div>
                        </div>
                        ` : ''}
                    </div>
                `;
                statsContainer.style.display = 'block';
            } else {
                statsContainer.style.display = 'none';
            }
            
            output.classList.remove('hidden');
            
            // Initialize toolbox drag and drop
            initToolboxDragDrop();
        }

        function activateTab(index) {
            // Deactivate all tabs
            document.querySelectorAll('.program-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Deactivate all views
            document.querySelectorAll('.timetable-view').forEach(view => {
                view.classList.remove('active');
            });
            
            // Activate selected tab and view
            document.getElementById(`tab-${index}`).classList.add('active');
            document.getElementById(`timetable-${index}`).classList.add('active');
        }

        // Undo/Redo functionality
        function saveToHistory() {
            // Remove any future history if we're not at the end
            if (currentHistoryIndex < actionHistory.length - 1) {
                actionHistory = actionHistory.slice(0, currentHistoryIndex + 1);
            }
            
            // Deep clone currentTimetables
            const clone = JSON.parse(JSON.stringify(currentTimetables));
            actionHistory.push(clone);
            
            // Limit history size
            if (actionHistory.length > MAX_HISTORY) {
                actionHistory.shift();
            }
            
            currentHistoryIndex = actionHistory.length - 1;
        }

        function undoAction() {
            if (currentHistoryIndex > 0) {
                currentHistoryIndex--;
                currentTimetables = JSON.parse(JSON.stringify(actionHistory[currentHistoryIndex]));
                displayAllTimetables(currentTimetables);
                showNotification('Undo successful', 'success');
            } else {
                showNotification('No more actions to undo', 'error');
            }
        }

        function redoAction() {
            if (currentHistoryIndex < actionHistory.length - 1) {
                currentHistoryIndex++;
                currentTimetables = JSON.parse(JSON.stringify(actionHistory[currentHistoryIndex]));
                displayAllTimetables(currentTimetables);
                showNotification('Redo successful', 'success');
            } else {
                showNotification('No more actions to redo', 'error');
            }
        }

        // Drag and Drop Functions
        function dragStart(e) {
            if (!document.getElementById('enableDragDrop').checked) return;
            
            dragSource = e.target;
            e.dataTransfer.setData('text/plain', e.target.id);
            e.target.classList.add('drag-source');
            
            // For toolbox items
            if (e.target.classList.contains('toolbox-item')) {
                e.dataTransfer.setData('toolbox-type', e.target.dataset.type);
            }
        }

        function dragOver(e) {
            if (!document.getElementById('enableDragDrop').checked) return;
            e.preventDefault();
        }

        function dragEnter(e) {
            if (!document.getElementById('enableDragDrop').checked) return;
            e.preventDefault();
            e.target.classList.add('drag-over');
        }

        function dragLeave(e) {
            if (!document.getElementById('enableDragDrop').checked) return;
            e.target.classList.remove('drag-over');
        }

        function drop(e) {
            if (!document.getElementById('enableDragDrop').checked) return;
            e.preventDefault();
            e.target.classList.remove('drag-over');
            
            // Save current state for undo
            saveToHistory();
            
            // Handle toolbox items
            if (e.dataTransfer.getData('toolbox-type')) {
                const itemType = e.dataTransfer.getData('toolbox-type');
                
                if (itemType === 'empty') {
                    // Clear the cell
                    e.target.innerHTML = '-';
                    e.target.removeAttribute('data-type');
                    e.target.removeAttribute('data-subject');
                    e.target.removeAttribute('data-code');
                    e.target.removeAttribute('data-faculty');
                    e.target.removeAttribute('data-group');
                    e.target.className = '';
                    
                    // Update the currentTimetables data structure
                    const programIndex = parseInt(e.target.getAttribute('data-program'));
                    const day = e.target.getAttribute('data-day');
                    const time = e.target.getAttribute('data-time');
                    
                    // Remove faculty assignment if it exists
                    const oldSession = currentTimetables[programIndex].timetable[day][time];
                    if (oldSession && oldSession.faculty) {
                        removeFacultyAssignment(oldSession.faculty, day, time);
                    }
                    
                    currentTimetables[programIndex].timetable[day][time] = null;
                } else {
                    let displayText, cellClass, code, faculty, room;
                    
                    switch(itemType) {
                        case 'library':
                            displayText = 'Library';
                            cellClass = 'library-cell';
                            code = 'LIB';
                            faculty = 'Librarian';
                            room = 'Library';
                            break;
                        case 'tppg':
                            displayText = 'TPPG (Training & Placement)';
                            cellClass = 'tppg-cell';
                            code = 'TPPG';
                            faculty = 'TPO';
                            room = 'Conference Room';
                            break;
                        case 'mentor':
                            displayText = 'Mentor-Mentee Interaction';
                            cellClass = 'mentor-cell';
                            code = 'MENT';
                            faculty = 'Mentor';
                            room = 'Various';
                            break;
                    }
                    
                    e.target.innerHTML = `
                        <strong>${code}</strong><br>
                        ${displayText}<br>
                        <em>${faculty}</em>
                        <div class="room-assignment">${room}</div>
                    `;
                    e.target.className = cellClass;
                    e.target.setAttribute('data-type', itemType);
                    e.target.setAttribute('data-subject', displayText);
                    e.target.setAttribute('data-code', code);
                    e.target.setAttribute('data-faculty', faculty);
                    
                    // Update the currentTimetables data structure
                    const programIndex = parseInt(e.target.getAttribute('data-program'));
                    const day = e.target.getAttribute('data-day');
                    const time = e.target.getAttribute('data-time');
                    
                    // Remove old faculty assignment if it exists
                    const oldSession = currentTimetables[programIndex].timetable[day][time];
                    if (oldSession && oldSession.faculty) {
                        removeFacultyAssignment(oldSession.faculty, day, time);
                    }
                    
                    // Add new faculty assignment
                    if (faculty !== 'Librarian' && faculty !== 'TPO' && faculty !== 'Mentor') {
                        assignFacultySlot(faculty, day, time, `${code}-${itemType}`);
                    }
                    
                    currentTimetables[programIndex].timetable[day][time] = {
                        type: itemType,
                        subject: displayText,
                        code: code,
                        faculty: faculty,
                        room: room
                    };
                }
                
                // Check for conflicts after update
                checkFacultyConflicts();
                return;
            }
            
            // Handle timetable cell to cell drag and drop
            if (dragSource) {
                if (e.target.tagName === 'TD' && dragSource !== e.target) {
                    // Get program, day, and time for both source and target
                    const sourceProgramIndex = parseInt(dragSource.getAttribute('data-program'));
                    const sourceDay = dragSource.getAttribute('data-day');
                    const sourceTime = dragSource.getAttribute('data-time');
                    
                    const targetProgramIndex = parseInt(e.target.getAttribute('data-program'));
                    const targetDay = e.target.getAttribute('data-day');
                    const targetTime = e.target.getAttribute('data-time');
                    
                    // Get the sessions
                    const sourceSession = currentTimetables[sourceProgramIndex].timetable[sourceDay][sourceTime];
                    const targetSession = currentTimetables[targetProgramIndex].timetable[targetDay][targetTime];
                    
                    // Check for faculty conflicts if moving to a different program
                    if (sourceProgramIndex !== targetProgramIndex && sourceSession && sourceSession.faculty) {
                        if (!checkFacultyAvailability(sourceSession.faculty, targetDay, targetTime)) {
                            showNotification(`Faculty ${sourceSession.faculty} is already scheduled at ${targetDay} ${targetTime}`, 'error');
                            dragSource.classList.remove('drag-source');
                            dragSource = null;
                            return;
                        }
                    }
                    
                    // Swap cell contents
                    const tempHTML = e.target.innerHTML;
                    const tempClass = e.target.className;
                    const tempData = {};
                    
                    // Store target data attributes
                    for (let i = 0; i < e.target.attributes.length; i++) {
                        const attr = e.target.attributes[i];
                        if (attr.name.startsWith('data-')) {
                            tempData[attr.name] = attr.value;
                        }
                    }
                    
                    // Set target content and attributes from source
                    e.target.innerHTML = dragSource.innerHTML;
                    e.target.className = dragSource.className;
                    
                    // Copy data attributes from source to target
                    for (let i = 0; i < dragSource.attributes.length; i++) {
                        const attr = dragSource.attributes[i];
                        if (attr.name.startsWith('data-')) {
                            e.target.setAttribute(attr.name, attr.value);
                        }
                    }
                    
                    // Set source content and attributes from target
                    dragSource.innerHTML = tempHTML;
                    dragSource.className = tempClass;
                    
                    // Copy data attributes from target to source
                    for (const key in tempData) {
                        dragSource.setAttribute(key, tempData[key]);
                    }
                    
                    // Update faculty assignments
                    if (sourceSession && sourceSession.faculty) {
                        removeFacultyAssignment(sourceSession.faculty, sourceDay, sourceTime);
                        assignFacultySlot(sourceSession.faculty, targetDay, targetTime, 
                            `${sourceSession.code}-${sourceSession.type}`);
                    }
                    
                    if (targetSession && targetSession.faculty) {
                        removeFacultyAssignment(targetSession.faculty, targetDay, targetTime);
                        assignFacultySlot(targetSession.faculty, sourceDay, sourceTime, 
                            `${targetSession.code}-${targetSession.type}`);
                    }
                    
                    // Update the currentTimetables data structure
                    currentTimetables[sourceProgramIndex].timetable[sourceDay][sourceTime] = targetSession;
                    currentTimetables[targetProgramIndex].timetable[targetDay][targetTime] = sourceSession;
                    
                    // Check for conflicts after update
                    checkFacultyConflicts();
                }
                
                dragSource.classList.remove('drag-source');
                dragSource = null;
            }
        }

        function initToolboxDragDrop() {
            const toolboxItems = document.querySelectorAll('.toolbox-item');
            toolboxItems.forEach(item => {
                item.setAttribute('draggable', 'true');
                item.addEventListener('dragstart', dragStart);
            });
        }

        function exportToCSV(branch, semester, timetableIndex) {
            const table = document.getElementById(`timetable-${timetableIndex}`).querySelector('.timetable');
            if (!table) return;
            
            let csv = `Timetable for ${branch} - Semester ${semester}\n\n`;
            
            // Add headers
            const headers = ['Time'];
            DAYS.forEach(day => headers.push(day));
            csv += headers.join(',') + '\n';
            
            // Add data rows
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const rowData = [];
                
                cells.forEach((cell, index) => {
                    if (index === 0) {
                        // Time slot
                        rowData.push(cell.textContent.trim());
                    } else if (cell.getAttribute('colspan') === '6') {
                        // Lunch break
                        rowData.push('LUNCH BREAK');
                        for (let i = 1; i < 6; i++) rowData.push('');
                    } else {
                        // Regular cell
                        const text = cell.textContent.trim().replace(/\n/g, ' ');
                        rowData.push(text === '-' ? '' : text);
                    }
                });
                
                if (rowData.length > 0) {
                    csv += rowData.join(',') + '\n';
                }
            });
            
            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `timetable_${branch.replace(/\s+/g, '_')}_sem${semester}_${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showNotification('Timetable exported to CSV successfully!', 'success');
        }

        function saveTimetable() {
            if (currentTimetables.length === 0) {
                showMessage('No timetable to save', 'error');
                return;
            }
            
            const dataToSave = {
                programs: collectAllProgramsData(),
                timetables: currentTimetables,
                session: currentSession
            };
            
            localStorage.setItem('savedTimetable', JSON.stringify(dataToSave));
            showNotification('Timetable saved successfully!', 'success');
        }

        function loadTimetable() {
            const savedData = localStorage.getItem('savedTimetable');
            if (!savedData) {
                showMessage('No saved timetable found', 'error');
                return;
            }
            
            try {
                const data = JSON.parse(savedData);
                // Clear existing programs
                clearAll();
                
                // Load programs and subjects
                data.programs.forEach((program, index) => {
                    if (index > 0) addProgram();
                    
                    const programNum = index + 1;
                    
                    // Set branch
                    const branchSelect = document.getElementById(`branch-${programNum}`);
                    const customBranchInput = document.getElementById(`custom-branch-${programNum}`);
                    
                    if (BRANCHES.includes(program.branch)) {
                        branchSelect.value = program.branch;
                        customBranchInput.style.display = 'none';
                    } else {
                        branchSelect.value = "Other";
                        customBranchInput.value = program.branch;
                        customBranchInput.style.display = 'block';
                    }
                    
                    // Set semester
                    document.getElementById(`semester-${programNum}`).value = program.semester;
                    
                    // Clear existing subjects
                    const tbody = document.getElementById(`subjectTableBody-${programNum}`);
                    tbody.innerHTML = '';
                    
                    // Add subjects
                    program.subjects.forEach(subject => {
                        const newRow = document.createElement('tr');
                        newRow.innerHTML = `
                            <td><input type="text" class="subject-name" value="${subject.name}"></td>
                            <td><input type="text" class="subject-code" value="${subject.code}"></td>
                            <td><input type="text" class="faculty-name" value="${subject.faculty}"></td>
                            <td><input type="number" class="ltp-input lecture-count" min="0" max="5" value="${subject.lectures}"></td>
                            <td><input type="number" class="ltp-input tutorial-count" min="0" max="3" value="${subject.tutorials}"></td>
                            <td><input type="number" class="ltp-input practical-count" min="0" max="4" value="${subject.practicals}"></td>
                            <td><input type="number" class="groups-input" min="1" max="8" value="${subject.groups || 2}"></td>
                            <td>
                                <select class="room-input" onchange="handleRoomChange(this)">
                                    <option value="">No preference</option>
                                    ${ROOMS.map(room => `<option value="${room}" ${subject.roomPreference === room ? 'selected' : ''}>${room}</option>`).join('')}
                                </select>
                                <input type="text" class="custom-room-input" placeholder="Room number" value="${ROOMS.includes(subject.roomPreference) ? '' : subject.roomPreference}" style="${ROOMS.includes(subject.roomPreference) ? 'display: none;' : 'display: inline-block;'}">
                            </td>
                            <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
                        `;
                        tbody.appendChild(newRow);
                    });
                });
                
                // Set current timetables
                currentTimetables = data.timetables;
                
                // Set current session if available
                if (data.session) {
                    currentSession = data.session;
                }
                
                // Display timetables
                displayAllTimetables(data.timetables);
                
                showNotification('Timetable loaded successfully!', 'success');
            } catch (error) {
                showMessage('Error loading timetable: ' + error.message, 'error');
            }
        }

        // Initialize with one program
        window.addEventListener('DOMContentLoaded', () => {
            addProgram();
            
            // Try to load saved timetable
            const savedData = localStorage.getItem('savedTimetable');
            if (savedData) {
                if (confirm('A saved timetable was found. Would you like to load it?')) {
                    loadTimetable();
                }
            }
        });