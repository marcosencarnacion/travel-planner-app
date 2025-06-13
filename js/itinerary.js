
document.addEventListener('DOMContentLoaded', () => {
    /* ---------- DOM refs ---------- */
    const addDayBtn = document.getElementById('addDayBtn');
    const deleteDayBtn = document.getElementById('deleteDayBtn');
    const daySelector = document.getElementById('daySelector');
    const itineraryContainer = document.getElementById('itineraryContainer');

    /* ---------- State ---------- */
    let currentDay = 1;
    let itineraryData = JSON.parse(localStorage.getItem('itineraryData')) || {};

    if (!Object.keys(itineraryData).length) {
        itineraryData.day1 = { notes: '', slots: [] };
        saveItinerary();
    }

    /* ---------- Init ---------- */
    loadDay(currentDay);
    renderDayTabs();

    /* ---------- Listeners ---------- */
    addDayBtn.addEventListener('click', () => {
        const newDayNum = Object.keys(itineraryData).length + 1;
        itineraryData[`day${newDayNum}`] = { notes: '', slots: [] };
        saveItinerary();
        renderDayTabs();
        switchDay(newDayNum);
    });

    deleteDayBtn.addEventListener('click', () => {
        if (Object.keys(itineraryData).length === 1) {
            alert('You must have at least one day in the itinerary.');
            return;
        }
        delete itineraryData[`day${currentDay}`];

        // Re‑index remaining days so they stay sequential.
        const reordered = {};
        Object.keys(itineraryData)
            .sort((a, b) => Number(a.replace('day', '')) - Number(b.replace('day', '')))
            .forEach((key, idx) => (reordered[`day${idx + 1}`] = itineraryData[key]));

        itineraryData = reordered;
        currentDay = Math.min(currentDay, Object.keys(itineraryData).length);
        saveItinerary();
        renderDayTabs();
        loadDay(currentDay);
    });

    /* ---------- Rendering ---------- */
    function renderDayTabs() {
        daySelector.innerHTML = '';
        Object.keys(itineraryData).forEach(dayKey => {
            const dayNum = Number(dayKey.replace('day', ''));
            const tab = document.createElement('div');
            tab.className = `day-tab ${dayNum === currentDay ? 'active' : ''}`;
            tab.textContent = `Day ${dayNum}`;
            tab.onclick = () => switchDay(dayNum);
            daySelector.appendChild(tab);
        });
    }

    function switchDay(dayNum) {
        currentDay = dayNum;
        renderDayTabs();
        loadDay(dayNum);
    }

    function loadDay(dayNum) {
        const dayKey = `day${dayNum}`;
        const dayData = itineraryData[dayKey];

        itineraryContainer.innerHTML = `
      <h3>Day ${dayNum}</h3>
      <div class="time-slots-container"></div>
      <button class="add-slot-btn">+ Add Time Slot</button>
      <div class="day-notes">
        <label>Notes:</label>
        <textarea class="notes-textarea">${dayData.notes}</textarea>
      </div>
    `;

        const timeSlotsContainer = itineraryContainer.querySelector('.time-slots-container');
        dayData.slots.forEach(s =>
            timeSlotsContainer.appendChild(createTimeSlotInput(s.time, s.activity))
        );

        itineraryContainer.querySelector('.add-slot-btn').onclick = () => {
            dayData.slots.push({ time: '', activity: '' });
            saveItinerary();
            timeSlotsContainer.appendChild(createTimeSlotInput('', ''));
        };

        itineraryContainer.querySelector('.notes-textarea').onchange = e => {
            dayData.notes = e.target.value;
            saveItinerary();
        };
    }

    /* ---------- Time‑slot factory ---------- */
    function createTimeSlotInput(time, activity) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';

        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.step = '900';     // 15‑minute intervals
        timeInput.value = time;

        const activityInput = document.createElement('input');
        activityInput.type = 'text';
        activityInput.placeholder = 'Activity description';
        activityInput.value = activity;

        const delBtn = document.createElement('button');
        delBtn.className = 'slot-delete-btn';
        delBtn.textContent = '×';
        delBtn.title = 'Remove this time slot';

        delBtn.onclick = () => {
            slot.remove();
            updateSlots();
        };

        [timeInput, activityInput].forEach(el => (el.onchange = updateSlots));

        slot.append(timeInput, activityInput, delBtn);
        return slot;
    }

    /* ---------- Helpers ---------- */
    function updateSlots() {
        const key = `day${currentDay}`;
        const slots = Array.from(itineraryContainer.querySelectorAll('.time-slot')).map(slot => ({
            time: slot.querySelector('input[type="time"]').value,
            activity: slot.querySelector('input[type="text"]').value
        })).filter(s => s.time || s.activity);

        itineraryData[key].slots = slots;
        saveItinerary();
    }

    function saveItinerary() {
        localStorage.setItem('itineraryData', JSON.stringify(itineraryData));
    }
});
