const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const events = {};
let currentMonth;
let currentDate;

function generateCalendar() {
    const grid = document.getElementById('month-grid');
    grid.innerHTML = '';
    months.forEach((month, index) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month';
        const title = document.createElement('h3');
        title.innerText = month;
        monthDiv.appendChild(title);

        const exportButton = document.createElement('button');
        exportButton.className = 'export-button';
        exportButton.innerText = 'Baixar Escala';
        exportButton.onclick = () => exportMonthToPDF(index);
        monthDiv.appendChild(exportButton);

        const dayNamesDiv = document.createElement('div');
        dayNamesDiv.className = 'day-names';
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].forEach(day => {
            const dayName = document.createElement('div');
            dayName.innerText = day;
            dayNamesDiv.appendChild(dayName);
        });
        monthDiv.appendChild(dayNamesDiv);

        const daysDiv = document.createElement('div');
        daysDiv.className = 'days';

        const firstDay = new Date(2025, index, 1).getDay();
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'day empty-day';
            daysDiv.appendChild(emptyDiv);
        }

        const daysInMonth = new Date(2025, index + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';

            const key = `${index}-${day}`;
            if (events[key]) {
                if (events[key].type === "culto") {
                    dayDiv.classList.add('culto');
                } else if (events[key].type === "evento") {
                    dayDiv.classList.add('evento');
                }
            }

            dayDiv.innerText = day;
            dayDiv.onclick = () => openDateSelector(index, day);
            daysDiv.appendChild(dayDiv);
        }
        monthDiv.appendChild(daysDiv);
        grid.appendChild(monthDiv);
    });

    generateNotesBackground();
}


function generateNotesBackground() {
    const notesBackground = document.getElementById('notes-background');
    const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
    const fixedPositions = [
        { top: '10%', left: '10%', size: '100px' },
        { top: '20%', left: '30%', size: '150px' },
        { top: '50%', left: '20%', size: '120px' },
        { top: '40%', left: '70%', size: '180px' },
        { top: '80%', left: '40%', size: '110px' },
        { top: '60%', left: '60%', size: '140px' }
    ];

    fixedPositions.forEach(pos => {
        const note = document.createElement('div');
        note.className = 'note';
        note.innerText = notes[Math.floor(Math.random() * notes.length)];
        note.style.top = pos.top;
        note.style.left = pos.left;
        note.style.fontSize = pos.size;
        notesBackground.appendChild(note);
    });
}

let currentEventIndex = null;

function openDateSelector(monthIndex, day) {
    currentMonth = monthIndex;
    currentDate = day;
    const modal = document.getElementById('eventModal');
    const title = document.getElementById('modal-title');
    title.innerText = `Eventos em ${day} de ${months[monthIndex]}`;
    modal.style.display = 'block';

    const currentList = document.getElementById('current-performers-list');
    currentList.innerHTML = '';
    if (events[`${monthIndex}-${day}`]) {
        events[`${monthIndex}-${day}`].performers.forEach((performer, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${performer}
                <button class="" onclick="editEvent(${index})">Editar</button>
                <button style="background-color: #dc3545;" onclick="deleteEvent(${index})">Excluir</button>`;
            currentList.appendChild(listItem);
        });
    }
}

function closeModal() {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'none';
}

function saveEvent() {
    const performerInput = document.getElementById('performer');
    const performer = performerInput.value;
    const eventTypeInput = document.querySelector('input[name="event-type"]:checked');
    if (!performer || !eventTypeInput) return;

    const eventType = eventTypeInput.value;
    const key = `${currentMonth}-${currentDate}`;
    if (currentEventIndex !== null) {
        events[key].performers[currentEventIndex] = performer;
        currentEventIndex = null;
    } else {
        if (!events[key]) {
            events[key] = { performers: [], type: eventType };
        } else {
            events[key].type = eventType; // Atualiza o tipo se já houver um evento
        }
        events[key].performers.push(performer);
    }

    performerInput.value = '';
    closeModal();
    generateCalendar();
}

function deleteEvent(index = null) {
    if (index === null) return;

    const key = `${currentMonth}-${currentDate}`;
    if (events[key]) {
        events[key].performers.splice(index, 1);
        if (events[key].performers.length === 0) {
            delete events[key];
        }
    }

    closeModal();
    generateCalendar();
}

function editEvent(index) {
    const performerInput = document.getElementById('performer');
    const currentPerformer = events[`${currentMonth}-${currentDate}`].performers[index];
    performerInput.value = currentPerformer;
    currentEventIndex = index;
    closeModal();
    openDateSelector(currentMonth, currentDate);
}

function exportMonthToPDF(monthIndex) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const title = `Eventos do mês de ${months[monthIndex]}`;
    doc.text(title, 10, 10);

    let y = 20;
    for (let day = 1; day <= 31; day++) {
        const key = `${monthIndex}-${day}`;
        if (events[key]) {
            doc.text(`${day} de ${months[monthIndex]}: ${events[key].performers.join(', ')}`, 10, y);
            y += 10;
        }
    }
    doc.save(`${months[monthIndex]}-eventos.pdf`);
}

window.onload = generateCalendar;