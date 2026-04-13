 // disclaimer: my initial code was passed through ai with the prompt to shorten and clean up messy logic, however it should be noted that the features were designed and implemented by me

let events = new Map();
let classes = new Map();
let activeFilters = new Set();
let currentDate = new Date();
let selectedDay = null;
let editingEvent = null, editingClass = null;

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

function loadSamples() {
  const sampleClasses = [
    { id: "cs444", name: "CS 444 - HCI", color: "#3b82f6" },
    { id: "psy335", name: "PSY - 335", color: "#10b981" },
    { id: "cs375", name: "CS 375 - Computer Systems", color: "#f59e0b" },
    { id: "cs366", name: "CS 366 - Systems Programming", color: "#ef4444" },
    { id: "cs346", name: "CS 346 - Intro to IoT", color: "#7bff00" }
  ];
  sampleClasses.forEach(c => { classes.set(c.id, c); activeFilters.add(c.id); });

  const today = new Date();
  const key = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  
  events.set(key(2026, 3, 14), [
    { id: crypto.randomUUID(), title: "Quiz 2", type: "Quiz", time: "4:30PM", note: "Can have a 1/2 sheet of paper notes", classId: "cs366", completed: false },
  ]);
  events.set(key(2026, 3, 13), [
    { id: crypto.randomUUID(), title: "Exam 4", type: "Exam", time: "10:00AM", note: "", classId: "psy335", completed: false }
  ]);
  events.set(key(2026, 3, 30), [
    { id: crypto.randomUUID(), title: "Final Presentation", type: "Exam", time: "3PM", note: "", classId: "cs444", completed: false }
  ]);
  events.set(key(2026, 3, 14), [
    { id: crypto.randomUUID(), title: "Finish Tic-Tac-Toe", type: "Task", time: "", note: "", classId: "cs366", completed: false }
  ]);
  events.set(key(2026, 3, 21), [
    { id: crypto.randomUUID(), title: "Begin Making Final Presentation Slides", type: "Other", time: "", note: "", classId: "cs366", completed: false }
  ]);
}

function saveData() {
  localStorage.setItem('classes', JSON.stringify([...classes.values()]));
  localStorage.setItem('events', JSON.stringify([...events.entries()]));
}

function loadData() {
  const savedClasses = localStorage.getItem('classes');
  if(savedClasses) {
    JSON.parse(savedClasses).forEach(c => classes.set(c.id, c));
    activeFilters.clear();
    classes.forEach(c => activeFilters.add(c.id));
  }
  const savedEvents = localStorage.getItem('events');
  if(savedEvents) events = new Map(JSON.parse(savedEvents));
  if(classes.size === 0) loadSamples();
  if(events.size === 0 && classes.size > 0) loadSamples();
}

function formatDate(y,m,d) { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function escape(s) { return s?.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]) || ''; }
function truncate(s, n) { return s?.length > n ? s.slice(0,n-3)+'...' : s || ''; }

function toggleComplete(dateKey, eventId, checked) {
  const dayEvents = events.get(dateKey);
  if(dayEvents) {
    const event = dayEvents.find(e => e.id === eventId);
    if(event) {
      event.completed = checked;
      saveData();
      renderCalendar();
      if(selectedDay) showEvents(selectedDay.y, selectedDay.m, selectedDay.d);
    }
  }
}

function renderCalendar() {
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  document.getElementById('month-year').innerText = `${['January','February','March','April','May','June','July','August','September','October','November','December'][m]} ${y}`;
  
  const firstDay = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  let html = '<div class="day-header">Sun</div><div class="day-header">Mon</div><div class="day-header">Tue</div><div class="day-header">Wed</div><div class="day-header">Thu</div><div class="day-header">Fri</div><div class="day-header">Sat</div>';
  
  for(let i=0, day=1; i<42; i++) {
    if(i < firstDay || day > daysInMonth) html += '<div class="day-cell empty"></div>';
    else {
      const dateKey = formatDate(y,m,day);
      const allEvents = events.get(dateKey) || [];
      const visibleEvents = allEvents.filter(e => !e.classId || activeFilters.has(e.classId));
      const eventsHtml = visibleEvents.length ? `<div class="events">${visibleEvents.slice(0,2).map(e => `<div class="event-tag ${e.completed ? 'completed' : ''}" style="border-left:3px solid ${classes.get(e.classId)?.color||'#999'}">${escape(truncate(e.title,20))}</div>`).join('')}${visibleEvents.length>2 ? `<div class="event-tag">+${visibleEvents.length-2} more</div>` : ''}</div>` : '';
      const isSelected = selectedDay && selectedDay.y === y && selectedDay.m === m && selectedDay.d === day;
      html += `<div class="day-cell ${isSelected ? 'selected-day' : ''}" data-year="${y}" data-month="${m}" data-day="${day}"><div class="day-number">${day}</div>${eventsHtml}</div>`;
      day++;
    }
  }
  document.getElementById('calendarGrid').innerHTML = html;
  document.querySelectorAll('.day-cell:not(.empty)').forEach(cell => {
    cell.onclick = () => {
      const y = parseInt(cell.dataset.year);
      const m = parseInt(cell.dataset.month);
      const d = parseInt(cell.dataset.day);
      selectDay(y, m, d);
    };
  });
}

function selectDay(y, m, d) {
  selectedDay = { y, m, d };
  renderCalendar();
  showEvents(y, m, d);
}

function showEvents(y, m, d) {
  const dateKey = formatDate(y, m, d);
  const allEvents = events.get(dateKey) || [];
  const visibleEvents = allEvents.filter(e => !e.classId || activeFilters.has(e.classId));
  const date = new Date(y, m, d);
  document.getElementById('selectedDate').innerText = date.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  
  if(!visibleEvents.length) return document.getElementById('eventsList').innerHTML = '<div class="no-events">No events</div>';
  
  document.getElementById('eventsList').innerHTML = visibleEvents.map(e => `
    <div class="event-card" style="border-left:4px solid ${classes.get(e.classId)?.color||'#999'}">
      <div class="event-content">
        <div class="event-header">
          <input type="checkbox" class="event-checkbox" data-id="${e.id}" ${e.completed ? 'checked' : ''}>
          <h4 style="${e.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}" title="${escape(e.title)}">${escape(truncate(e.title,30))}</h4>
          <span class="event-type">${escape(e.type)}</span>
        </div>
        <div class="event-details">${escape(e.time)}</div>
        <div class="event-note">${escape(truncate(e.note,50))}</div>
        <div class="event-note" style="color:${classes.get(e.classId)?.color||'#999'}">${escape(classes.get(e.classId)?.name||'No Class')}</div>
      </div>
      <div class="event-actions">
        <button class="action-btn edit-event" data-id="${e.id}">Edit</button>
        <button class="action-btn delete-event" data-id="${e.id}">Del</button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.event-checkbox').forEach(cb => {
    cb.onchange = (e) => {
      e.stopPropagation();
      const eventId = cb.dataset.id;
      const isChecked = cb.checked;
      toggleComplete(dateKey, eventId, isChecked);
      const card = cb.closest('.event-card');
      const title = card.querySelector('h4');
      if(isChecked) {
        title.style.textDecoration = 'line-through';
        title.style.opacity = '0.6';
      } else {
        title.style.textDecoration = 'none';
        title.style.opacity = '1';
      }
    };
  });
  
  document.querySelectorAll('.edit-event').forEach(btn => btn.onclick = () => openEventModal(allEvents.find(e => e.id === btn.dataset.id), dateKey));
  document.querySelectorAll('.delete-event').forEach(btn => btn.onclick = () => { if(confirm('Delete?')) { events.set(dateKey, allEvents.filter(e => e.id !== btn.dataset.id)); if(!events.get(dateKey)?.length) events.delete(dateKey); saveData(); showEvents(y, m, d); renderCalendar(); } });
}

function renderClasses() {
  document.getElementById('classesList').innerHTML = [...classes.values()].map(c => `
    <div class="class-item" data-id="${c.id}">
      <input type="checkbox" class="class-checkbox" ${activeFilters.has(c.id) ? 'checked' : ''}>
      <span class="class-name" title="${escape(c.name)}">${escape(truncate(c.name,30))}</span>
      <div class="class-actions">
        <div class="class-color" style="background:${c.color}"></div>
        <button class="class-edit-btn">✏️</button>
        <button class="class-delete-btn">🗑️</button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.class-checkbox').forEach(cb => {
    cb.onclick = (e) => {
      e.stopPropagation();
      const id = cb.closest('.class-item').dataset.id;
      if(cb.checked) {
        activeFilters.add(id);
      } else {
        activeFilters.delete(id);
      }
      saveData();
      renderCalendar();
      if(selectedDay) showEvents(selectedDay.y, selectedDay.m, selectedDay.d);
    };
  });
  
  document.querySelectorAll('.class-color').forEach(color => color.onclick = e => {
    e.stopPropagation();
    const id = color.closest('.class-item').dataset.id;
    const picker = document.createElement('div');
    picker.className = 'custom-color-picker';
    colors.forEach(c => { let opt = document.createElement('div'); opt.className = 'color-option'; opt.style.background = c; opt.onclick = () => { classes.get(id).color = c; saveData(); renderClasses(); renderCalendar(); picker.remove(); }; picker.appendChild(opt); });
    let custom = document.createElement('div'); custom.className = 'custom-color-option'; custom.innerText = 'Custom...'; custom.onclick = () => { let input = document.createElement('input'); input.type = 'color'; input.value = classes.get(id).color; input.onchange = e2 => { classes.get(id).color = e2.target.value; saveData(); renderClasses(); renderCalendar(); input.remove(); }; input.click(); picker.remove(); }; picker.appendChild(custom);
    const rect = color.getBoundingClientRect();
    picker.style.cssText = `position:fixed;top:${rect.bottom+5}px;left:${rect.left}px;z-index:10000`;
    document.body.appendChild(picker);
    setTimeout(() => document.addEventListener('click', function close(e) { if(!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', close); } }), 0);
  });
  
  document.querySelectorAll('.class-edit-btn').forEach(btn => btn.onclick = (e) => {
    e.stopPropagation();
    openClassModal(classes.get(btn.closest('.class-item').dataset.id));
  });
  
  document.querySelectorAll('.class-delete-btn').forEach(btn => btn.onclick = (e) => {
    e.stopPropagation();
    if(confirm('Delete class and all its events?')) { 
      const id = btn.closest('.class-item').dataset.id; 
      classes.delete(id); 
      activeFilters.delete(id); 
      for(let [k,v] of events) events.set(k, v.filter(e => e.classId !== id)); 
      saveData(); 
      renderClasses(); 
      renderCalendar(); 
      if(selectedDay) showEvents(selectedDay.y, selectedDay.m, selectedDay.d); 
    }
  });
  
  document.querySelectorAll('.class-item').forEach(item => {
    item.onclick = (e) => {
      if(!e.target.classList.contains('class-checkbox') && 
         !e.target.classList.contains('class-color') && 
         !e.target.classList.contains('class-edit-btn') && 
         !e.target.classList.contains('class-delete-btn')) {
        let cb = item.querySelector('.class-checkbox');
        cb.checked = !cb.checked;
        const id = item.dataset.id;
        if(cb.checked) {
          activeFilters.add(id);
        } else {
          activeFilters.delete(id);
        }
        saveData();
        renderCalendar();
        if(selectedDay) showEvents(selectedDay.y, selectedDay.m, selectedDay.d);
      }
    };
  });
}

function openEventModal(event=null, dateKey=null) {
  const modal = document.getElementById('eventModal');
  document.getElementById('eventModalTitle').innerText = event ? 'Edit Event' : 'Add Event';
  document.getElementById('eventTitle').value = event?.title || '';
  document.getElementById('eventType').value = event?.type || 'Assignment';
  document.getElementById('eventTime').value = event?.time || '';
  document.getElementById('eventNote').value = event?.note || '';
  document.getElementById('eventClass').innerHTML = `<option value="">-- No Class --</option>${[...classes.values()].map(c => `<option value="${c.id}" ${event?.classId===c.id ? 'selected' : ''}>${escape(c.name)}</option>`).join('')}`;
  editingEvent = { event, dateKey };
  modal.style.display = 'block';
}

function closeEventModal() { document.getElementById('eventModal').style.display = 'none'; editingEvent = null; }

function openClassModal(cls=null) {
  const modal = document.getElementById('classModal');
  document.getElementById('classModalTitle').innerText = cls ? 'Edit Class' : 'Add Class';
  document.getElementById('className').value = cls?.name || '';
  document.getElementById('classColor').value = cls?.color || colors[0];
  document.getElementById('colorSample').style.background = cls?.color || colors[0];
  editingClass = cls;
  modal.style.display = 'block';
}

function closeClassModal() { document.getElementById('classModal').style.display = 'none'; editingClass = null; }

document.getElementById('eventForm').onsubmit = e => {
  e.preventDefault();
  const title = document.getElementById('eventTitle').value.trim();
  if(!title) return alert('Enter title');
  const type = document.getElementById('eventType').value;
  const time = document.getElementById('eventTime').value.trim() || 'All day';
  const note = document.getElementById('eventNote').value.trim();
  const classId = document.getElementById('eventClass').value || null;
  
  if(editingEvent?.event) {
    const dayEvents = events.get(editingEvent.dateKey);
    const idx = dayEvents.findIndex(ev => ev.id === editingEvent.event.id);
    if(idx !== -1) dayEvents[idx] = { ...dayEvents[idx], title, type, time, note, classId };
  } else {
    let y = selectedDay?.y, m = selectedDay?.m, d = selectedDay?.d;
    if(!y) { const today = new Date(); y = today.getFullYear(); m = today.getMonth(); d = today.getDate(); }
    const dateKey = formatDate(y, m, d);
    if(!events.has(dateKey)) events.set(dateKey, []);
    events.get(dateKey).push({ id: crypto.randomUUID(), title, type, time, note, classId, completed: false });
  }
  saveData(); closeEventModal(); renderCalendar();
  if(selectedDay) showEvents(selectedDay.y, selectedDay.m, selectedDay.d);
};

document.getElementById('classForm').onsubmit = e => {
  e.preventDefault();
  const name = document.getElementById('className').value.trim();
  if(!name) return alert('Enter class name');
  const color = document.getElementById('classColor').value;
  if(editingClass) { editingClass.name = name; editingClass.color = color; }
  else { const id = 'c'+Date.now(); classes.set(id, { id, name, color }); activeFilters.add(id); }
  saveData(); closeClassModal(); renderClasses(); renderCalendar();
};

document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); };
document.getElementById('todayBtn').onclick = () => { 
  currentDate = new Date(); 
  renderCalendar(); 
  const today = new Date();
  selectDay(today.getFullYear(), today.getMonth(), today.getDate());
};
document.getElementById('addEventBtn').onclick = () => openEventModal();
document.getElementById('addClassBtn').onclick = () => openClassModal();
document.getElementById('selectAllBtn').onclick = () => { activeFilters.clear(); classes.forEach((_,id)=>activeFilters.add(id)); saveData(); renderClasses(); renderCalendar(); if(selectedDay) showEvents(selectedDay.y, selectedDay.m, selectedDay.d); };
document.getElementById('clearAllBtn').onclick = () => { activeFilters.clear(); saveData(); renderClasses(); renderCalendar(); if(selectedDay) showEvents(selectedDay.y, selectedDay.m, selectedDay.d); };

document.querySelectorAll('.close-btn, #cancelEventBtn, #cancelClassBtn').forEach(btn => btn.onclick = () => { closeEventModal(); closeClassModal(); });
window.onclick = e => { if(e.target.classList.contains('modal')) { closeEventModal(); closeClassModal(); } };

document.getElementById('classColor').oninput = e => document.getElementById('colorSample').style.background = e.target.value;

loadData();
renderClasses();
currentDate = new Date();
renderCalendar();
setTimeout(() => {
  const today = new Date();
  selectDay(today.getFullYear(), today.getMonth(), today.getDate());
}, 100);
