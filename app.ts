// import { cursorTo } from "readline";

declare const L: any;

// Comment
const STATUSES = ['manufactured', 'assembled', 'shipped', 'deployed', 'detonated'];
const LEBANON_BOUNDS = {
    north: 34.69,
    south: 33.05,
    east: 36.62,
    west: 35.10
};

interface Beeper {
    id: string;
    name: string;
    status: 'manufactured' | 'assembled' | 'shipped' | 'deployed' | 'detonated';
    lat?: number;
    lon?: number;
    productionDate: Date;
    deploymentDate?: Date;
}

// -- VARIABLES --
const API_URL = 'http://localhost:3000/api';
let map: any;
let markers: { [id: string]: any } = {};
let currentBeeperId: string;
let selectedBeeper: string | null = null;


document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadBeepers();
    document.getElementById('add-beeper-form')?.addEventListener('submit', handleAddBeeper);
    // document.getElementById('confirmUpdate')?.addEventListener('click', updateBeeper);
    // document.getElementById('cancelUpdate')?.addEventListener('click', closeModal);
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
                li.id = beeper.id;
                li.innerHTML = `
                    <span class="beeper-info">Beeper ${beeper.name} - Status: ${beeper.status}</span>`;

                if (beeper.status !== 'detonated') {
                    if (beeper.status === 'shipped') {
                        li.innerHTML += `<button class="deployable" onclick="selectBeeper('${beeper.id}')">Deploy</button>`;
                    } else if (beeper.status === 'deployed') {
                        li.innerHTML += `<span class="countdown" id="countdown-${beeper.id}"></span>`;
                        li.innerHTML += `<button class="detonatable" onclick="updateStatus('${beeper.id}', '${beeper.status}')">Detonate</button>`;
                    } else {
                        li.innerHTML += `<button onclick="updateStatus('${beeper.id}', '${beeper.status}')">Update Status</button>`;
                    }
    
                    if (beeper.status !== 'deployed') {
                        li.innerHTML += `<button onclick="deleteBeeper('${beeper.id}')">Delete</button>`;
                    }
                }

                if (beeper.status === 'detonated') {
                    li.className = 'detonated';
                }

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
    const nameAttribute = form.elements.namedItem('beeperName') as HTMLInputElement;
    const name = nameAttribute.value;

    try {
        const response = await fetch(`${API_URL}/beepers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        if (response.ok) {
            loadBeepers();
            form.reset();
        }
    } catch (error) {
        console.error('Error adding beeper:', error);
    }
}

async function updateStatus(beeperId: string, currentStatus: string) {
    const curSIndex: number = STATUSES.findIndex(s => s === currentStatus);

    if (curSIndex === -1 || curSIndex === STATUSES.length) {
        alert(`can't change status: ${STATUSES[curSIndex]} >>`);
        return;
    }

    const newStatus: string = STATUSES[curSIndex + 1];

    try {
        const response = await fetch(`${API_URL}/beepers/${beeperId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: newStatus })
        });
        if (response.ok) {
            const resObj = await response.json();
            console.log(resObj);
            if (newStatus === 'detonated')
                startCountdown(beeperId, resObj.countdown);
            else
                loadBeepers();  // Refresh the beeper list
        } else {
            const errorData = await response.json();
            console.error('Error deploying beeper:', errorData.message);
            alert(`Failed to deploy beeper: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error deploying beeper:', error);
        alert('Failed to create beeper. Please try again.');
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

async function selectBeeper(id: string) {
    selectedBeeper = id;

    (document.getElementById(id) as HTMLLIElement).className = 'deployed';
}

function startCountdown(id: string, countdown: number) {
    const countdownElement = document.getElementById(`countdown-${id}`);
    if (countdownElement) {
        (countdownElement.parentElement?.querySelector("button") as HTMLButtonElement).className = 'removeElement';
        countdownElement.textContent = ` Detonating in ${countdown} seconds`;
        const interval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownElement.textContent = ` Detonating in ${countdown} seconds`;
            } else {
                clearInterval(interval);
                countdownElement.textContent = ' Detonated!';
                (countdownElement.parentElement as HTMLLIElement).className = 'detonated';
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
    // alert(selectedBeeper);
    if (!selectedBeeper) 
        return;

    const { lat, lng } = e.latlng;
    
    if (lat < LEBANON_BOUNDS.south || lat > LEBANON_BOUNDS.north || 
        lng < LEBANON_BOUNDS.west || lng > LEBANON_BOUNDS.east) {
        alert("Please select a location within Lebanon.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/beepers/${selectedBeeper}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat: lat,
                lon: lng,
                status: 'deployed' })
        });
        if (response.ok) {
            const newBeeper = await response.json();
            addMarkerToMap(newBeeper);
            loadBeepers();  // Refresh the beeper list
        } else {
            const errorData = await response.json();
            console.error('Error deploying beeper:', errorData.message);
            alert(`Failed to deploy beeper: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error deploying beeper:', error);
        alert('Failed to create beeper. Please try again.');
    }

    selectedBeeper = -1;
}

// Make functions available globally
// (window as any).showUpdateModal = showUpdateModal;
(window as any).deleteBeeper = deleteBeeper;
(window as any).selectBeeper = selectBeeper;
(window as any).updateStatus = updateStatus;