document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard iniciado');
    
    try {
        // ===== NOMBRE DEL AUTO =====
        const carNameElement = document.getElementById('carName');
        if (carNameElement) {
            carNameElement.textContent = getCarName();
        }

        // ===== EDITAR NOMBRE (LÁPIZ) =====
        const editBtn = document.getElementById('editCarName');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newName = prompt('✏️ Editar nombre del auto:', getCarName());
                if (newName && newName.trim()) {
                    saveCarName(newName.trim());
                    document.getElementById('carName').textContent = newName.trim();
                    showToast('✅ Nombre actualizado', 'success');
                }
            });
        }

        // ===== ODÓMETRO - CLIC PARA EDITAR =====
        const odoElement = document.getElementById('currentOdometer');
        if (odoElement) {
            odoElement.addEventListener('click', () => {
                const current = document.getElementById('currentOdometer').textContent.replace(/,/g, '');
                const input = document.getElementById('odoInput');
                if (input) {
                    input.value = current;
                    document.getElementById('odoModal').classList.add('active');
                    setTimeout(() => {
                        input.focus();
                        input.select();
                    }, 100);
                }
            });
        }

        // ===== MODAL =====
        // Cancelar
        const cancelBtn = document.getElementById('odoCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.getElementById('odoModal').classList.remove('active');
            });
        }

        // Guardar
        const saveBtn = document.getElementById('odoSave');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const input = document.getElementById('odoInput');
                const value = parseFloat(input.value);
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
        }

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('odoModal');
                if (modal) modal.classList.remove('active');
            }
        });

        // Cerrar modal clic fuera
        const modal = document.getElementById('odoModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // ===== BOTÓN NUEVA CARGA =====
        const addBtn = document.getElementById('addFuelBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                window.location.href = 'add-fuel.html';
            });
        }

        // ===== BOTÓN SERVICIOS (CORREGIDO) =====
        const serviceBtn = document.getElementById('serviceBtn');
        if (serviceBtn) {
            // Eliminar event listeners anteriores (si los hay)
            const newBtn = serviceBtn.cloneNode(true);
            serviceBtn.parentNode.replaceChild(newBtn, serviceBtn);
            
            newBtn.addEventListener('click', () => {
                console.log('Navegando a servicios desde Inicio');
                window.location.href = 'services.html';
            });
        }

        // ===== ACTUALIZAR DATOS =====
        await updateDashboard();
        
    } catch (error) {
        console.error('Error al iniciar dashboard:', error);
        showToast('❌ Error al cargar la app', 'error');
    }
});

// ===== FUNCIÓN ACTUALIZAR DASHBOARD =====
async function updateDashboard() {
    try {
        console.log('Actualizando dashboard...');
        
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
        
        const odoElement = document.getElementById('currentOdometer');
        if (odoElement) {
            odoElement.textContent = formatNumber(currentOdometer);
        }

        // Últimas cargas
        const container = document.getElementById('lastFuels');
        if (!container) return;

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
                            <span class="fuel-date-compact">${formatDateShort(fuel.date)}</span>
                            <span class="fuel-details-compact">
                                <span class="fuel-liters-compact">⛽ ${fuel.liters.toFixed(1)} L</span>
                                <span class="fuel-cost-compact">$${fuel.totalCost.toFixed(2)}</span>
                            </span>
                        </div>
                        <div class="fuel-right-compact">
                            <span class="fuel-consumption-compact ${consumptionClass}">
                                ${emoji} ${consumption > 0 ? consumption.toFixed(1) : '0.0'} km/L
                            </span>
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        // Alerta servicio
        const nextService = await getNextService(currentOdometer);
        const alertDiv = document.getElementById('serviceAlert');
        if (!alertDiv) return;

        if (nextService) {
            const kmLeft = nextService.nextKm - currentOdometer;
            if (kmLeft <= 500 && kmLeft > 0) {
                alertDiv.style.display = 'flex';
                const detailEl = document.getElementById('serviceDetail');
                const kmEl = document.getElementById('serviceKm');
                if (detailEl) detailEl.textContent = nextService.type;
                if (kmEl) {
                    kmEl.textContent = `Faltan ${formatNumber(kmLeft)} km (${formatNumber(nextService.nextKm)} km)`;
                    kmEl.style.color = kmLeft <= 100 ? '#ef4444' : kmLeft <= 300 ? '#f59e0b' : '#10b981';
                }
            } else {
                alertDiv.style.display = 'none';
            }
        } else {
            alertDiv.style.display = 'none';
        }
        
        console.log('Dashboard actualizado correctamente');
        
    } catch (error) {
        console.error('Error al actualizar dashboard:', error);
        const container = document.getElementById('lastFuels');
        if (container) {
            container.innerHTML = `<div class="empty-state-mini">Error al cargar datos</div>`;
        }
    }
}

// ===== FUNCIÓN GLOBAL PARA EDITAR CARGA =====
window.editFuel = function(id) {
    window.location.href = `edit-fuel.html?id=${id}`;
};