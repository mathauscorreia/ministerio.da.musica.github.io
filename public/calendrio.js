const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const events = {};
let currentMonth;
let currentDate;
let currentEventIndex = null;

function closeModal() {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'none'; // Esconde o modal
}

// Função para carregar os eventos do servidor
async function loadEvents() {
    const response = await fetch('/api/events');
    const { data } = await response.json();
    console.log(data); // Verifique os dados do evento

    data.forEach(event => {
        const eventDate = new Date(event.data);
        const localEventDate = new Date(eventDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

        const monthIndex = localEventDate.getMonth();
        const day = localEventDate.getDate();
        const key = `${monthIndex}-${day}`;

        if (!events[key]) {
            events[key] = { performers: [], type: event.tipo_evento };
        }

        events[key].performers.push(event.artista);
    });

    generateCalendar();
}

// Função para gerar o calendário
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
                dayDiv.classList.add(events[key].type);
            }

            dayDiv.innerText = day;
            dayDiv.onclick = () => openDateSelector(index, day);
            daysDiv.appendChild(dayDiv);
        }
        monthDiv.appendChild(daysDiv);
        grid.appendChild(monthDiv);
    });

    generateNotesBackground(); // Função para adicionar fundo musical (opcional)
}

function openDateSelector(monthIndex, day) {
    currentMonth = monthIndex;
    currentDate = day;
    const modal = document.getElementById('eventModal');
    const title = document.getElementById('modal-title');
    title.innerText = `Eventos em ${day} de ${months[monthIndex]}`;
    modal.style.display = 'block';

    const currentList = document.getElementById('current-performers-list');
    currentList.innerHTML = ''; // Limpa a lista

    const key = `${monthIndex}-${day}`;
    if (events[key]) {
        events[key].performers.forEach((performer, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${performer.name}
                <button onclick="editEvent(${index})">Editar</button>
                <button style="background-color: #dc3545;" onclick="deleteEvent(${index})">Excluir</button>`;
            currentList.appendChild(listItem);
        });
    }
}

async function saveEvent() {
    const performerInput = document.getElementById('performer');
    const performer = performerInput.value.trim();
    const eventTypeInput = document.querySelector('input[name="event-type"]:checked');
    if (!performer || !eventTypeInput) return;

    const eventType = eventTypeInput.value;
    const key = `${currentMonth}-${currentDate}`;

    if (!events[key]) {
        events[key] = { performers: [], type: eventType };
    }

    events[key].type = eventType;

    let eventId = null;
    if (currentEventIndex !== null) {
        eventId = events[key].performers[currentEventIndex].id;
        events[key].performers[currentEventIndex] = { id: eventId, name: performer };
        currentEventIndex = null;
    } else {
        events[key].performers.push({ name: performer });
    }

    performerInput.value = '';
    closeModal();
    generateCalendar();

    // Enviar para o backend (criação ou edição)
    const response = await fetch(`/api/events${eventId ? `/${eventId}` : ''}`, {
        method: eventId ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: performer,
            date: `${currentMonth + 1}-${currentDate}-2025`, // Ajuste conforme necessário
            type: eventType,
        }),
    });

    const { success, data } = await response.json();
    if (!success) {
        console.error('Erro ao salvar evento');
    }
}

// Função para excluir evento
async function deleteEvent(index) {
    const key = `${currentMonth}-${currentDate}`;
    const eventToDelete = events[key]?.performers[index];
    if (!eventToDelete) return;

    // Excluir do array de eventos
    events[key].performers.splice(index, 1);

    // Se não houver mais artistas, deletar o evento do dia
    if (events[key].performers.length === 0) {
        delete events[key];
    }

    closeModal();
    generateCalendar(); // Atualiza o calendário

    // Excluir do backend
    const eventId = eventToDelete.id;
    if (eventId) {
        const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
        const { success } = await response.json();
        if (!success) {
            console.error('Erro ao excluir evento');
        }
    }
}

// Função para editar evento
function editEvent(index) {
    const performerInput = document.getElementById('performer');
    const key = `${currentMonth}-${currentDate}`;
    const currentPerformer = events[key].performers[index];
    performerInput.value = currentPerformer.name;
    currentEventIndex = index;
    closeModal();
    openDateSelector(currentMonth, currentDate);
}

// Função para exportar os eventos para PDF
function exportMonthToPDF(monthIndex) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const title = `Eventos do mês de ${months[monthIndex]}`;
    doc.setFontSize(16);
    doc.text(title, 10, 10);

    const tableColumn = ["Data", "Pessoas", "Tipo de Evento"];
    const tableRows = [];
    const daysInMonth = new Date(2025, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${monthIndex}-${day}`;
        if (events[key]) {
            events[key].performers.forEach(performer => {
                const eventType = events[key].type || "Sem Tipo";
                const rowData = [`${day}/${monthIndex + 1}/2025`, performer, eventType];
                tableRows.push(rowData);
            });
        }
    }

    if (tableRows.length === 0) {
        doc.text("Nenhum evento registrado para este mês.", 10, 30);
    } else {
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185] },
        });
    }

    doc.save(`${months[monthIndex]}-eventos.pdf`);
}

// Chama a função loadEvents() para carregar os eventos ao carregar a página
window.onload = loadEvents;
