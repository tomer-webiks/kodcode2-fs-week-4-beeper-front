var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var LEBANON_BOUNDS = {
    north: 34.69,
    south: 33.05,
    east: 36.62,
    west: 35.10
};
var API_URL = 'http://localhost:3000/api';
var map;
var markers = {};
var currentBeeperId;
document.addEventListener('DOMContentLoaded', function () {
    var _a, _b, _c;
    initMap();
    loadBeepers();
    (_a = document.getElementById('add-beeper-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', handleAddBeeper);
    (_b = document.getElementById('confirmUpdate')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', updateBeeper);
    (_c = document.getElementById('cancelUpdate')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', closeModal);
});
function initMap() {
    map = L.map('map', {
        maxBounds: [
            [LEBANON_BOUNDS.south, LEBANON_BOUNDS.west],
            [LEBANON_BOUNDS.north, LEBANON_BOUNDS.east]
        ]
    }).setView([33.8938, 35.5018], 8); // Centered on Lebanon
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    // Add click event listener to the map
    map.on('click', onMapClick);
}
function loadBeepers() {
    return __awaiter(this, void 0, void 0, function () {
        var response, beepers, beeperList_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/beepers"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    beepers = _a.sent();
                    beeperList_1 = document.getElementById('beepers');
                    if (beeperList_1) {
                        beeperList_1.innerHTML = '';
                        beepers.forEach(function (beeper) {
                            var li = document.createElement('li');
                            li.innerHTML = "\n                    <span class=\"beeper-info\">Beeper ".concat(beeper.id, " - Status: ").concat(beeper.status, "</span>\n                    <button onclick=\"showUpdateModal('").concat(beeper.id, "', '").concat(beeper.status, "')\">Update</button>\n                    <button onclick=\"deleteBeeper('").concat(beeper.id, "')\">Delete</button>\n                    <button onclick=\"activateBeeper('").concat(beeper.id, "')\">Activate</button>\n                    <span class=\"countdown\" id=\"countdown-").concat(beeper.id, "\"></span>\n                ");
                            beeperList_1.appendChild(li);
                            addMarkerToMap(beeper);
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading beepers:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleAddBeeper(event) {
    return __awaiter(this, void 0, void 0, function () {
        var form, statusSelect, status, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    form = event.target;
                    statusSelect = form.elements.namedItem('status');
                    status = statusSelect.value;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/beepers"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: status })
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        loadBeepers();
                        form.reset();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error adding beeper:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function showUpdateModal(id, currentStatus) {
    currentBeeperId = id;
    var modal = document.getElementById('updateModal');
    var select = document.getElementById('statusSelect');
    var statusOptions = ['produced', 'explosives_added', 'shipped', 'deployed', 'detonated'];
    select.innerHTML = statusOptions.map(function (status) {
        return "<option value=\"".concat(status, "\" ").concat(status === currentStatus ? 'selected' : '', ">").concat(status, "</option>");
    }).join('');
    modal.style.display = 'block';
}
function updateBeeper() {
    return __awaiter(this, void 0, void 0, function () {
        var select, newStatus, response, errorData, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    select = document.getElementById('statusSelect');
                    newStatus = select.value;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/beepers/").concat(currentBeeperId), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    loadBeepers();
                    closeModal();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    errorData = _a.sent();
                    alert("Failed to update beeper: ".concat(errorData.message));
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error updating beeper:', error_3);
                    alert('Failed to update beeper. Please try again.');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function closeModal() {
    var modal = document.getElementById('updateModal');
    modal.style.display = 'none';
}
function deleteBeeper(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this beeper?')) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/beepers/").concat(id), {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        loadBeepers();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error deleting beeper:', error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function activateBeeper(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response, countdown, errorData, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/beepers/").concat(id, "/activate"), {
                            method: 'POST'
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    countdown = (_a.sent()).countdown;
                    startCountdown(id, countdown);
                    // We'll update the beeper's status locally instead of reloading all beepers
                    updateBeeperStatus(id, 'deployed');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    errorData = _a.sent();
                    console.error('Error activating beeper:', errorData.message);
                    alert("Failed to activate beeper: ".concat(errorData.message));
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    console.error('Error activating beeper:', error_5);
                    alert('Failed to activate beeper. Please try again.');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function startCountdown(id, countdown) {
    var countdownElement = document.getElementById("countdown-".concat(id));
    if (countdownElement) {
        countdownElement.textContent = " Detonating in ".concat(countdown, " seconds");
        var interval_1 = setInterval(function () {
            countdown--;
            if (countdown >= 0) {
                countdownElement.textContent = " Detonating in ".concat(countdown, " seconds");
            }
            else {
                clearInterval(interval_1);
                countdownElement.textContent = ' Detonated!';
                updateBeeperStatus(id, 'detonated');
            }
        }, 1000);
    }
}
function updateBeeperStatus(id, newStatus) {
    var beeperElement = document.querySelector("li:has(button[onclick*=\"'".concat(id, "'\"])"));
    if (beeperElement) {
        var statusSpan = beeperElement.querySelector('.beeper-info');
        if (statusSpan) {
            statusSpan.textContent = "Beeper ".concat(id, " - Status: ").concat(newStatus);
        }
        // Update the marker on the map
        if (markers[id]) {
            markers[id].setPopupContent("Beeper ".concat(id, " - Status: ").concat(newStatus));
        }
    }
}
function addMarkerToMap(beeper) {
    if (beeper.lat && beeper.lon) {
        if (markers[beeper.id]) {
            markers[beeper.id].setLatLng([beeper.lat, beeper.lon]);
            markers[beeper.id].setPopupContent("Beeper ".concat(beeper.id, " - Status: ").concat(beeper.status));
        }
        else {
            var marker = L.marker([beeper.lat, beeper.lon]).addTo(map);
            marker.bindPopup("Beeper ".concat(beeper.id, " - Status: ").concat(beeper.status));
            markers[beeper.id] = marker;
        }
    }
}
;
function onMapClick(e) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, lat, lng, response, newBeeper, errorData, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = e.latlng, lat = _a.lat, lng = _a.lng;
                    if (lat < LEBANON_BOUNDS.south || lat > LEBANON_BOUNDS.north ||
                        lng < LEBANON_BOUNDS.west || lng > LEBANON_BOUNDS.east) {
                        alert("Please select a location within Lebanon.");
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/beepers"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ lat: lat, lon: lng, status: 'produced' })
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    newBeeper = _b.sent();
                    addMarkerToMap(newBeeper);
                    loadBeepers(); // Refresh the beeper list
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    errorData = _b.sent();
                    alert("Failed to create beeper: ".concat(errorData.message));
                    _b.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_6 = _b.sent();
                    console.error('Error creating beeper:', error_6);
                    alert('Failed to create beeper. Please try again.');
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Make functions available globally
window.showUpdateModal = showUpdateModal;
window.deleteBeeper = deleteBeeper;
window.activateBeeper = activateBeeper;
