document.addEventListener('DOMContentLoaded', async () => {
    // Nombre del auto
    document.getElementById('carName').textContent = getCarName();

    // Editar nombre del auto
    document.getElementById('editCarName').addEventListener('click', () => {
        const newName = prompt('Nombre del auto:', getCarName());
        if (newName && newName.trim()) {
            saveCarName(newName.trim());
            document.getElementById('carName').textContent = newName.trim();
            showToast('✅ Nombre actualizado', 'success');
        }
    });

    // Editar odómetro - ABRIR MODAL
    document.getElementById('editOdometerBtn').addEventListener('click', () => {
        const current = document.getElementById('currentOdometer').textContent.replace(/,/g, '');
        document.getElementById('odoInput').value = current;
        document.getElementById('odoModal').classList.add('active');
        document.getElementById('odoInput').focus();
        document.getElementById('odoInput').select();
    });

    // Cancelar modal
    document.getElementById('odoCancel').addEventListener('click', () => {
        document.getElementById('odoModal').classList.remove('active');
    });

    // Guardar odómetro
    document.getElementById('odoSave').addEventListener('click', async () => {
        const value = parseFloat(document.getElementById('odoInput').value);
        if (!value || value < 0) {
            showToast('❌ Ingresa un valor válido', 'error');
            return;
        }
        saveInitialKm(value);
        document.getElementById('currentOdometer').textContent = formatNumber(value);
        document.getElementById('odoModal').classList.remove('active');
        showToast('✅ Odómetro actualizado', 'success');
        await updateDashboard();
    });

    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('odoModal').classList.remove('active');
        }
    });

    // Botón nueva carga
    document.getElementById('addFuelBtn').addEventListener('click', () => {
        location.href = 'add-fuel.html';
    });

    // Botón servicios - AHORA VA A services.html
    document.getElementById('serviceBtn').addEventListener('click', () => {
        location.href = 'services.html';
    });

    await updateDashboard();
});

async function updateDashboard() {
    try {
        const allFuels = await getAllFuels();
        const lastFuel = await getLastFuel();
        const initialKm = getInitialKm();

        // Odómetro
        let currentOdometer = 0;
        if (lastFuel) {
            currentOdometer = lastFuel.odometer;
        } else if (initialKm) {
            currentOdometer = initialKm;
        }
        document.getElementById('currentOdometer').textContent = formatNumber(currentOdometer);

        // Últimas cargas
        const container = document.getElementById('lastFuels');
        if (allFuels.length === 0) {
            container.innerHTML = `<div class="empty-state-mini">Sin registros</div>`;
        } else {
            const latest = allFuels.slice(0, 5);
            let html = '';
            for (let i = 0; i < latest.length; i++) {
                const fuel = latest[i];
                const prev = i < allFuels.length - 1 ? allFuels[i + 1] : null;
                let consumption = 0;
                if (prev) {
                    consumption = calculateConsumption(prev.odometer, fuel.odometer, fuel.liters);
                } else if (initialKm) {
                    consumption = calculateConsumption(initialKm, fuel.odometer, fuel.liters);
                }
                const consumptionClass = getConsumptionColor(consumption);
                const emoji = getConsumptionEmoji(consumption);

                html += `
                    <div class="fuel-item-compact" onclick="editFuel(${fuel.id})">
                        <div class="fuel-left-compact">
                            <div class="fuel-date-compact">${formatDateShort(fuel.date)}</div>
                            <div class="fuel-details-compact">
                                <span class="fuel-liters-compact">⛽ ${fuel.liters.toFixed(1)} L</span>
                                <span class="fuel-cost-compact">$${fuel.totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                        <div class="fuel-right-compact">
                            <div class="fuel-consumption-compact ${consumptionClass}">
                                ${emoji} ${consumption > 0 ? consumption.toFixed(1) : '0.0'} km/L
                            </div>
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        // Alerta servicio
        const nextService = await getNextService(currentOdometer);
        const alertDiv = document.getElementById('serviceAlert');
        if (nextService) {
            const kmLeft = nextService.nextKm - currentOdometer;
            if (kmLeft <= 500 && kmLeft > 0) {
                alertDiv.style.display = 'flex';
                document.getElementById('serviceDetail').textContent = nextService.type;
                document.getElementById('serviceKm').textContent = `Faltan ${formatNumber(kmLeft)} km (${formatNumber(nextService.nextKm)} km)`;
                document.getElementById('serviceKm').style.color = kmLeft <= 100 ? '#ef4444' : kmLeft <= 300 ? '#f59e0b' : '#10b981';
            } else {
                alertDiv.style.display = 'none';
            }
        } else {
            alertDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para editar carga (desde el dashboard)
function editFuel(id) {
    location.href = `edit-fuel.html?id=${id}`;
}