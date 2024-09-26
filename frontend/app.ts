declare const L: any;

const LEBANON_BOUNDS = {
    north: 34.69,
    south: 33.05,
    east: 36.62,
    west: 35.10
};

interface Beeper {
    id: string;
    status: 'produced' | 'explosives_added' | 'shipped' | 'deployed' | 'detonated';
    lat?: number;
    lon?: number;
    productionDate: Date;
    deploymentDate?: Date;
}

const API_URL = 'http://localhost:3000/api';
let map: any;
let markers: { [id: string]: any } = {};
let currentBeeperId: string;

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadBeepers();
    document.getElementById('add-beeper-form')?.addEventListener('submit', handleAddBeeper);
    document.getElementById('confirmUpdate')?.addEventListener('click', updateBeeper);
    document.getElementById('cancelUpdate')?.addEventListener('click', closeModal);
});

function initMap() {
    map = L.map('map', {
        maxBounds: [
            [LEBANON_BOUNDS.south, LEBANON_BOUNDS.west],
            [LEBANON_BOUNDS.north, LEBANON_BOUNDS.east]
        ]
    }).setView([33.8938, 35.5018], 8);  // Centered on Lebanon
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click event listener to the map
    map.on('click', onMapClick);
}

async function loadBeepers() {
    try {
        const response = await fetch(`${API_URL}/beepers`);
        const beepers: Beeper[] = await response.json();
        const beeperList = document.getElementById('beepers');
        if (beeperList) {
            beeperList.innerHTML = '';
            beepers.forEach(beeper => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="beeper-info">Beeper ${beeper.id} - Status: ${beeper.status}</span>
                    <button onclick="showUpdateModal('${beeper.id}', '${beeper.status}')">Update</button>
                    <button onclick="deleteBeeper('${beeper.id}')">Delete</button>
                    <button onclick="activateBeeper('${beeper.id}')">Activate</button>
                    <span class="countdown" id="countdown-${beeper.id}"></span>
                `;
                beeperList.appendChild(li);
                addMarkerToMap(beeper);
            });
        }
    } catch (error) {
        console.error('Error loading beepers:', error);
    }
}

async function handleAddBeeper(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const statusSelect = form.elements.namedItem('status') as HTMLSelectElement;
    const status = statusSelect.value;

    try {
        const response = await fetch(`${API_URL}/beepers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            loadBeepers();
            form.reset();
        }
    } catch (error) {
        console.error('Error adding beeper:', error);
    }
}

function showUpdateModal(id: string, currentStatus: string) {
    currentBeeperId = id;
    const modal = document.getElementById('updateModal') as HTMLElement;
    const select = document.getElementById('statusSelect') as HTMLSelectElement;
    const statusOptions = ['produced', 'explosives_added', 'shipped', 'deployed', 'detonated'];
    
    select.innerHTML = statusOptions.map(status => 
        `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`
    ).join('');

    modal.style.display = 'block';
}

async function updateBeeper() {
    const select = document.getElementById('statusSelect') as HTMLSelectElement;
    const newStatus = select.value;

    try {
        const response = await fetch(`${API_URL}/beepers/${currentBeeperId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            loadBeepers();
            closeModal();
        } else {
            const errorData = await response.json();
            alert(`Failed to update beeper: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error updating beeper:', error);
        alert('Failed to update beeper. Please try again.');
    }
}

function closeModal() {
    const modal = document.getElementById('updateModal') as HTMLElement;
    modal.style.display = 'none';
}

async function deleteBeeper(id: string) {
    if (confirm('Are you sure you want to delete this beeper?')) {
        try {
            const response = await fetch(`${API_URL}/beepers/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadBeepers();
            }
        } catch (error) {
            console.error('Error deleting beeper:', error);
        }
    }
}

async function activateBeeper(id: string) {
    try {
        const response = await fetch(`${API_URL}/beepers/${id}/activate`, {
            method: 'POST'
        });
        if (response.ok) {
            const { countdown } = await response.json();
            startCountdown(id, countdown);
            // We'll update the beeper's status locally instead of reloading all beepers
            updateBeeperStatus(id, 'deployed');
        } else {
            const errorData = await response.json();
            console.error('Error activating beeper:', errorData.message);
            alert(`Failed to activate beeper: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error activating beeper:', error);
        alert('Failed to activate beeper. Please try again.');
    }
}

function startCountdown(id: string, countdown: number) {
    const countdownElement = document.getElementById(`countdown-${id}`);
    if (countdownElement) {
        countdownElement.textContent = ` Detonating in ${countdown} seconds`;
        const interval = setInterval(() => {
            countdown--;
            if (countdown >= 0) {
                countdownElement.textContent = ` Detonating in ${countdown} seconds`;
            } else {
                clearInterval(interval);
                countdownElement.textContent = ' Detonated!';
                updateBeeperStatus(id, 'detonated');
            }
        }, 1000);
    }
}

function updateBeeperStatus(id: string, newStatus: string) {
    const beeperElement = document.querySelector(`li:has(button[onclick*="'${id}'"])`) as HTMLLIElement;
    if (beeperElement) {
        const statusSpan = beeperElement.querySelector('.beeper-info') as HTMLSpanElement;
        if (statusSpan) {
            statusSpan.textContent = `Beeper ${id} - Status: ${newStatus}`;
        }
        // Update the marker on the map
        if (markers[id]) {
            markers[id].setPopupContent(`Beeper ${id} - Status: ${newStatus}`);
        }
    }
}
function addMarkerToMap(beeper: Beeper) {
    if (beeper.lat && beeper.lon) {
        if (markers[beeper.id]) {
            markers[beeper.id].setLatLng([beeper.lat, beeper.lon]);
            markers[beeper.id].setPopupContent(`Beeper ${beeper.id} - Status: ${beeper.status}`);
        } else {
            const marker = L.marker([beeper.lat, beeper.lon]).addTo(map);
            marker.bindPopup(`Beeper ${beeper.id} - Status: ${beeper.status}`);
            markers[beeper.id] = marker;
        }
    }
};

async function onMapClick(e: L.LeafletMouseEvent) {
    const { lat, lng } = e.latlng;
    
    if (lat < LEBANON_BOUNDS.south || lat > LEBANON_BOUNDS.north || 
        lng < LEBANON_BOUNDS.west || lng > LEBANON_BOUNDS.east) {
        alert("Please select a location within Lebanon.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/beepers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lon: lng, status: 'produced' })
        });
        if (response.ok) {
            const newBeeper = await response.json();
            addMarkerToMap(newBeeper);
            loadBeepers();  // Refresh the beeper list
        } else {
            const errorData = await response.json();
            alert(`Failed to create beeper: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error creating beeper:', error);
        alert('Failed to create beeper. Please try again.');
    }
}

// Make functions available globally
(window as any).showUpdateModal = showUpdateModal;
(window as any).deleteBeeper = deleteBeeper;
(window as any).activateBeeper = activateBeeper;