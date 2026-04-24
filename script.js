// disclaimer: ai was only consulted to fixing the popup aspect of the forms (the modal opening closing and form resetting).

let events = [];
let classes = [];
let activeClassFilters = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedYear = null;
let selectedMonth = null;
let selectedDay = null;
let editingEventId = null;
let editingEventDate = null;
let editingClassId = null;

function startCalendar() {
    let savedData = loadData();
    if (!savedData) { // we'll leave this in since we have to do an in class demonstration
        loadSampleData();
    }

    renderClassList();
    renderCalendar();
    
    let today = new Date();
    selectDay(today.getFullYear(), today.getMonth(), today.getDate());
    
    setupModals();
    setupButtons();
}

function saveData() {
    let dataToSave = {
        events: events,
        classes: classes,
        activeClassFilters: activeClassFilters
    };
    localStorage.setItem("calendarData", JSON.stringify(dataToSave));
}

function loadData() {
    let savedData = localStorage.getItem("calendarData");
    if (savedData) {
        let data = JSON.parse(savedData);
        events = data.events || [];
        classes = data.classes || [];
        activeClassFilters = data.activeClassFilters || [];
        return true;
    }
    return false;
}

function loadSampleData() {
    classes = [
        { id: "cs444", name: "CS 444 - HCI", color: "#3b82f6" },
        { id: "psy335", name: "PSY 335 - Psychology", color: "#10b981" },
        { id: "cs375", name: "CS 375 - Computer Systems", color: "#f59e0b" },
        { id: "cs366", name: "CS 366 - Systems Programming", color: "#ef4444" }
    ];
    
    activeClassFilters = [];
    for (let i = 0; i < classes.length; i++) {
        activeClassFilters.push(classes[i].id);
    }
    
    events = [];
}

function setupModals() {
    let closeBtns = document.querySelectorAll(".close-btn");
    for (let i = 0; i < closeBtns.length; i++) {
        closeBtns[i].onclick = function() {
            let modal = this.closest(".modal");
            if (modal) modal.style.display = "none";
        };
    }
    
    document.getElementById("cancelEventBtn").onclick = function() {
        document.getElementById("eventModal").style.display = "none";
        editingEventId = null;
    };
    
    document.getElementById("cancelClassBtn").onclick = function() {
        document.getElementById("classModal").style.display = "none";
        editingClassId = null;
    };
    
    document.getElementById("eventForm").onsubmit = saveEvent;
    document.getElementById("classForm").onsubmit = saveClass;
    
    let noEndTimeCheck = document.getElementById("noEndTime");
    noEndTimeCheck.onchange = function() {
        let endGroup = document.querySelector(".end-time-group");
        if (this.checked) {
            endGroup.style.opacity = "0.5";
            endGroup.style.pointerEvents = "none";
        } else {
            endGroup.style.opacity = "1";
            endGroup.style.pointerEvents = "auto";
        }
    };
    
    document.getElementById("classColor").oninput = function() {
        document.getElementById("colorSample").style.background = this.value;
    };
}

function formatDate(year, month, day) {
    let monthNum = month + 1;
    let monthStr = monthNum < 10 ? "0" + monthNum : "" + monthNum;
    let dayStr = day < 10 ? "0" + day : "" + day;
    return year + "-" + monthStr + "-" + dayStr;
}

function getEventsForDate(dateStr) {
    let result = [];
    for (let i = 0; i < events.length; i++) {
        if (events[i].date === dateStr) {
            result.push(events[i]);
        }
    }
    return result;
}

function getClassInfo(classId) {
    for (let i = 0; i < classes.length; i++) {
        if (classes[i].id === classId) {
            return { color: classes[i].color, name: classes[i].name };
        }
    }
    return { color: "#999999", name: "No Class" };
}

function isClassFilterActive(classId) {
    for (let i = 0; i < activeClassFilters.length; i++) {
        if (activeClassFilters[i] === classId) {
            return true;
        }
    }
    return false;
}

function filterEventsByClass(eventsArray) {
    let result = [];
    for (let i = 0; i < eventsArray.length; i++) {
        if (isClassFilterActive(eventsArray[i].classId) || !eventsArray[i].classId) {
            result.push(eventsArray[i]);
        }
    }
    return result;
}

function renderCalendar() {
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("month-year").innerHTML = monthNames[currentMonth] + " " + currentYear;
    
    let html = "";
    html += '<div class="day-header">Sun</div>';
    html += '<div class="day-header">Mon</div>';
    html += '<div class="day-header">Tue</div>';
    html += '<div class="day-header">Wed</div>';
    html += '<div class="day-header">Thu</div>';
    html += '<div class="day-header">Fri</div>';
    html += '<div class="day-header">Sat</div>';
    
    let dayCounter = 1;
    for (let i = 0; i < 42; i++) {
        if (i < firstDayOfMonth || dayCounter > daysInMonth) { 
            html += '<div class="day-cell empty"></div>';
        } else {
            let dateStr = formatDate(currentYear, currentMonth, dayCounter);
            let dayEvents = getEventsForDate(dateStr);
            let visibleEvents = filterEventsByClass(dayEvents);
            
            let eventsHtml = "";
            if (visibleEvents.length > 0) {
                eventsHtml = '<div class="events">';
                let maxToShow = Math.min(visibleEvents.length, 2);
                for (let e = 0; e < maxToShow; e++) {
                    let event = visibleEvents[e];
                    let completedClass = event.completed ? "completed" : "";
                    let classInfo = getClassInfo(event.classId);
                    eventsHtml += '<div class="event-tag ' + completedClass + '" style="border-left:3px solid ' + classInfo.color + '">' + event.title + '</div>';
                }
                if (visibleEvents.length > 2) {
                    eventsHtml += '<div class="event-tag">+' + (visibleEvents.length - 2) + ' more</div>';
                }
                eventsHtml += '</div>';
            }
            
            let isSelected = (selectedYear === currentYear && selectedMonth === currentMonth && selectedDay === dayCounter);
            let selectedClass = isSelected ? "selected-day" : "";
            
            html += '<div class="day-cell ' + selectedClass + '" data-year="' + currentYear + '" data-month="' + currentMonth + '" data-day="' + dayCounter + '">';
            html += '<div class="day-number">' + dayCounter + '</div>';
            html += eventsHtml;
            html += '</div>';
            
            dayCounter++;
        }
    }
    
    document.getElementById("calendarGrid").innerHTML = html;
    
    let dayCells = document.querySelectorAll(".day-cell:not(.empty)");
    for (let i = 0; i < dayCells.length; i++) {
        dayCells[i].onclick = function() {
            let year = parseInt(this.getAttribute("data-year"));
            let month = parseInt(this.getAttribute("data-month"));
            let day = parseInt(this.getAttribute("data-day"));
            selectDay(year, month, day);
        };
    }
}

function selectDay(year, month, day) {
    selectedYear = year;
    selectedMonth = month;
    selectedDay = day;
    renderCalendar();
    showEventsForDay(year, month, day);
}

function showEventsForDay(year, month, day) {
    let dateStr = formatDate(year, month, day);
    let dayEvents = getEventsForDate(dateStr);
    let visibleEvents = filterEventsByClass(dayEvents);
    
    let dateObj = new Date(year, month, day);
    let options = { weekday: "long", month: "long", day: "numeric" };
    document.getElementById("selectedDate").innerHTML = dateObj.toLocaleDateString("en-US", options);
    
    let eventsList = document.getElementById("eventsList");
    if (visibleEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No events for this day</div>';
        return;
    }
    
    let html = "";
    for (let i = 0; i < visibleEvents.length; i++) {
        let e = visibleEvents[i];
        let classInfo = getClassInfo(e.classId);
        let checkedAttr = e.completed ? "checked" : "";
        let strikeStyle = e.completed ? 'style="text-decoration: line-through; opacity: 0.6;"' : "";
        
        html += '<div class="event-card" style="border-left:4px solid ' + classInfo.color + '">';
        html += '<div class="event-content">';
        html += '<div class="event-header">';
        html += '<input type="checkbox" class="event-checkbox" data-id="' + e.id + '" ' + checkedAttr + '>';
        html += '<h4 ' + strikeStyle + '>' + e.title + '</h4>';
        html += '<span class="event-type">' + e.type + '</span>';
        html += '</div>';
        html += '<div class="event-details">' + e.time + '</div>';
        html += '<div class="event-note">' + e.note + '</div>';
        html += '<div class="event-note" style="color:' + classInfo.color + '">' + classInfo.name + '</div>';
        html += '</div>';
        html += '<div class="event-actions">';
        html += '<button class="action-btn edit-event" data-id="' + e.id + '">Edit</button>';
        html += '<button class="action-btn delete-event" data-id="' + e.id + '">Del</button>';
        html += '</div>';
        html += '</div>';
    }
    
    eventsList.innerHTML = html;
    
    let checkboxes = document.querySelectorAll(".event-checkbox");
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].onchange = function() {
            let eventId = this.getAttribute("data-id");
            toggleEventComplete(eventId, this.checked);
        };
    }
    
    let editBtns = document.querySelectorAll(".edit-event");
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].onclick = function() {
            let eventId = this.getAttribute("data-id");
            openEventModal(eventId);
        };
    }
    
    let deleteBtns = document.querySelectorAll(".delete-event");
    for (let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].onclick = function() {
            let eventId = this.getAttribute("data-id");
            if (confirm("Delete this event?")) {
                deleteEventById(eventId);
                showEventsForDay(selectedYear, selectedMonth, selectedDay);
                renderCalendar();
            }
        };
    }
}

function toggleEventComplete(eventId, isChecked) {
    for (let i = 0; i < events.length; i++) {
        if (events[i].id === eventId) {
            events[i].completed = isChecked;
            break;
        }
    }
    saveData();
    renderCalendar();
    showEventsForDay(selectedYear, selectedMonth, selectedDay);
}

function deleteEventById(eventId) {
    let newEvents = [];
    for (let i = 0; i < events.length; i++) {
        if (events[i].id !== eventId) {
            newEvents.push(events[i]);
        }
    }
    events = newEvents;
    saveData();
}

function openEventModal(eventId = null) {
    let modal = document.getElementById("eventModal");
    let title = document.getElementById("eventModalTitle");
    let classSelect = document.getElementById("eventClass");
    
    classSelect.innerHTML = '<option value="">-- No Class --</option>';
    for (let i = 0; i < classes.length; i++) {
        classSelect.innerHTML += '<option value="' + classes[i].id + '">' + classes[i].name + '</option>';
    }
    
    if (eventId) {
        title.innerHTML = "Edit Event";
        editingEventId = eventId;
        
        let eventToEdit = null;
        for (let i = 0; i < events.length; i++) {
            if (events[i].id === eventId) {
                eventToEdit = events[i];
                editingEventDate = eventToEdit.date;
                break;
            }
        }
        
        if (eventToEdit) {
            document.getElementById("eventTitle").value = eventToEdit.title;
            document.getElementById("eventType").value = eventToEdit.type;
            document.getElementById("eventNote").value = eventToEdit.note;
            document.getElementById("eventClass").value = eventToEdit.classId || "";
            
            let timeStr = eventToEdit.time;
            if (timeStr === "All day") {
                document.getElementById("eventStartHour").value = "";
                document.getElementById("eventStartMinute").value = "";
                document.getElementById("eventEndHour").value = "";
                document.getElementById("eventEndMinute").value = "";
                document.getElementById("noEndTime").checked = true;
            } else if (timeStr.includes(" - ")) {
                let parts = timeStr.split(" - ");
                let startParts = parts[0].match(/(\d+):(\d+)\s+(AM|PM)/);
                let endParts = parts[1].match(/(\d+):(\d+)\s+(AM|PM)/);
                
                if (startParts) {
                    document.getElementById("eventStartHour").value = startParts[1];
                    document.getElementById("eventStartMinute").value = startParts[2];
                    document.getElementById("eventStartAmPm").value = startParts[3];
                }
                if (endParts) {
                    document.getElementById("eventEndHour").value = endParts[1];
                    document.getElementById("eventEndMinute").value = endParts[2];
                    document.getElementById("eventEndAmPm").value = endParts[3];
                    document.getElementById("noEndTime").checked = false;
                }
            } else {
                let parts = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/);
                if (parts) {
                    document.getElementById("eventStartHour").value = parts[1];
                    document.getElementById("eventStartMinute").value = parts[2];
                    document.getElementById("eventStartAmPm").value = parts[3];
                    document.getElementById("eventEndHour").value = "";
                    document.getElementById("eventEndMinute").value = "";
                    document.getElementById("noEndTime").checked = true;
                }
            }
        }
    } else {
        title.innerHTML = "Add Event";
        editingEventId = null;
        editingEventDate = null;
        document.getElementById("eventForm").reset();
        document.getElementById("eventType").value = "Assignment";
        document.getElementById("noEndTime").checked = false;
    }
    
    modal.style.display = "block";
}

function saveEvent(e) {
    e.preventDefault();
    
    let title = document.getElementById("eventTitle").value.trim();
    if (!title) return;
    
    let type = document.getElementById("eventType").value;
    let note = document.getElementById("eventNote").value;
    let classId = document.getElementById("eventClass").value || null;
    
    let startHour = document.getElementById("eventStartHour").value;
    let startMinute = document.getElementById("eventStartMinute").value;
    let startAmPm = document.getElementById("eventStartAmPm").value;
    let endHour = document.getElementById("eventEndHour").value;
    let endMinute = document.getElementById("eventEndMinute").value;
    let endAmPm = document.getElementById("eventEndAmPm").value;
    let noEndTime = document.getElementById("noEndTime").checked;
    
    let time = "";
    if (!startHour || !startMinute) {
        time = "All day";
    } else {
        let startTime = startHour + ":" + startMinute + " " + startAmPm;
        if (noEndTime || !endHour || !endMinute) {
            time = startTime;
        } else {
            let endTime = endHour + ":" + endMinute + " " + endAmPm;
            time = startTime + " - " + endTime;
        }
    }
    
    if (editingEventId) {
        for (let i = 0; i < events.length; i++) {
            if (events[i].id === editingEventId) {
                events[i].title = title;
                events[i].type = type;
                events[i].time = time;
                events[i].note = note;
                events[i].classId = classId;
                break;
            }
        }
    } else {
        let year = selectedYear;
        let month = selectedMonth;
        let day = selectedDay;
        if (!year) {
            let today = new Date();
            year = today.getFullYear();
            month = today.getMonth();
            day = today.getDate();
        }
        
        let dateStr = formatDate(year, month, day);
        let newEvent = {
            id: Date.now() + "-" + Math.random(),
            date: dateStr,
            title: title,
            type: type,
            time: time,
            note: note,
            classId: classId,
            completed: false
        };
        events.push(newEvent);
    }

    saveData();
    
    document.getElementById("eventModal").style.display = "none";
    editingEventId = null;
    
    renderCalendar();
    if (selectedYear !== null) {
        showEventsForDay(selectedYear, selectedMonth, selectedDay);
    }

}

function openClassModal(classId = null) {
    let modal = document.getElementById("classModal");
    let title = document.getElementById("classModalTitle");
    
    if (classId) {
        title.innerHTML = "Edit Class";
        editingClassId = classId;
        
        let classToEdit = null;
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].id === classId) {
                classToEdit = classes[i];
                break;
            }
        }
        
        if (classToEdit) {
            document.getElementById("className").value = classToEdit.name;
            document.getElementById("classColor").value = classToEdit.color;
            document.getElementById("colorSample").style.background = classToEdit.color;
        }
    } else {
        title.innerHTML = "Add Class";
        editingClassId = null;
        document.getElementById("className").value = "";
        document.getElementById("classColor").value = "#3b82f6";
        document.getElementById("colorSample").style.background = "#3b82f6";
    }
    
    modal.style.display = "block";
}

function saveClass(e) {
    e.preventDefault();
    
    let name = document.getElementById("className").value.trim();
    if (!name) return;
    
    let color = document.getElementById("classColor").value;
    
    if (editingClassId) {
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].id === editingClassId) {
                classes[i].name = name;
                classes[i].color = color;
                break;
            }
        }
    } else {
        let newId = "class_" + Date.now();
        let newClass = {
            id: newId,
            name: name,
            color: color
        };
        classes.push(newClass);
        activeClassFilters.push(newId);
    }

    saveData();
    
    document.getElementById("classModal").style.display = "none";
    editingClassId = null;
    renderClassList();
    renderCalendar();
    if (selectedYear !== null) {
        showEventsForDay(selectedYear, selectedMonth, selectedDay);
    }
}

function renderClassList() {
    let html = "";
    for (let i = 0; i < classes.length; i++) {
        let c = classes[i];
        let isChecked = isClassFilterActive(c.id) ? "checked" : "";
        html += '<div class="class-item" data-id="' + c.id + '">';
        html += '<input type="checkbox" class="class-checkbox" ' + isChecked + '>';
        html += '<span class="class-name" title="' + c.name + '">' + c.name + '</span>';
        html += '<div class="class-actions">';
        html += '<div class="class-color" style="background:' + c.color + '"></div>';
        html += '<button class="class-edit-btn" data-id="' + c.id + '">✏️</button>';
        html += '<button class="class-delete-btn" data-id="' + c.id + '">🗑️</button>';
        html += '</div>';
        html += '</div>';
    }
    
    document.getElementById("classesList").innerHTML = html;
    
    let checkboxes = document.querySelectorAll(".class-checkbox");
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].onclick = function(e) {
            e.stopPropagation();
            let classItem = this.closest(".class-item");
            let classId = classItem.getAttribute("data-id");
            
            if (this.checked) {
                activeClassFilters.push(classId);
            } else {
                let newFilters = [];
                for (let f = 0; f < activeClassFilters.length; f++) {
                    if (activeClassFilters[f] !== classId) {
                        newFilters.push(activeClassFilters[f]);
                    }
                }
                activeClassFilters = newFilters;
            }
            
            renderCalendar();
            if (selectedYear !== null) {
                showEventsForDay(selectedYear, selectedMonth, selectedDay);
            }
        };
    }
    
    let editBtns = document.querySelectorAll(".class-edit-btn");
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].onclick = function(e) {
            e.stopPropagation();
            let classId = this.getAttribute("data-id");
            openClassModal(classId);
        };
    }
    
    let deleteBtns = document.querySelectorAll(".class-delete-btn");
    for (let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].onclick = function(e) {
            e.stopPropagation();
            if (confirm("Delete this class? All events in this class will also be deleted.")) {
                let classId = this.getAttribute("data-id");
                
                let newClasses = [];
                for (let c = 0; c < classes.length; c++) {
                    if (classes[c].id !== classId) {
                        newClasses.push(classes[c]);
                    }
                }
                classes = newClasses;
                
                let newFilters = [];
                for (let f = 0; f < activeClassFilters.length; f++) {
                    if (activeClassFilters[f] !== classId) {
                        newFilters.push(activeClassFilters[f]);
                    }
                }
                activeClassFilters = newFilters;
                
                let newEvents = [];
                for (let ev = 0; ev < events.length; ev++) {
                    if (events[ev].classId !== classId) {
                        newEvents.push(events[ev]);
                    }
                }
                events = newEvents;
                saveData();
                renderClassList();
                renderCalendar();
                if (selectedYear !== null) {
                    showEventsForDay(selectedYear, selectedMonth, selectedDay);
                }
            }
        };
    }
    
    let classItems = document.querySelectorAll(".class-item");
    for (let i = 0; i < classItems.length; i++) {
        classItems[i].onclick = function(e) {
            if (e.target.type !== "checkbox" && !e.target.classList.contains("class-edit-btn") && !e.target.classList.contains("class-delete-btn") && !e.target.classList.contains("class-color")) {
                let cb = this.querySelector(".class-checkbox");
                cb.checked = !cb.checked;
                let clickEvent = new Event("click");
                cb.dispatchEvent(clickEvent);
            }
        };
    }
}

function goPrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function goNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function goToToday() {
    let today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    renderCalendar();
    selectDay(today.getFullYear(), today.getMonth(), today.getDate());
}

function selectAllClasses() {
    activeClassFilters = [];
    for (let i = 0; i < classes.length; i++) {
        activeClassFilters.push(classes[i].id);
    }
    saveData();
    renderClassList();
    renderCalendar();
    if (selectedYear !== null) {
        showEventsForDay(selectedYear, selectedMonth, selectedDay);
    }
}

function clearAllClasses() {
    activeClassFilters = [];
    saveData();
    renderClassList();
    renderCalendar();
    if (selectedYear !== null) {
        showEventsForDay(selectedYear, selectedMonth, selectedDay);
    }
}

function setupButtons() {
    document.getElementById("prevMonth").onclick = goPrevMonth;
    document.getElementById("nextMonth").onclick = goNextMonth;
    document.getElementById("todayBtn").onclick = goToToday;
    document.getElementById("addEventBtn").onclick = function() { openEventModal(); };
    document.getElementById("addClassBtn").onclick = function() { openClassModal(); };
    document.getElementById("selectAllBtn").onclick = selectAllClasses;
    document.getElementById("clearAllBtn").onclick = clearAllClasses;
}

startCalendar();
