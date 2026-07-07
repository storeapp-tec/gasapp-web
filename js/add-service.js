document.addEventListener('DOMContentLoaded', async () => {
    console.log('Add service cargado');
    
    // Fecha actual
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('serviceDate');
    if (dateInput) dateInput.value = today;
    
    // Precargar odómetro actual
    const currentOdometer = await getCurrentOdometer();
    if (currentOdometer > 0) {
        const odoInput = document.getElementById('serviceOdometer');
        if (odoInput) {
            odoInput.value = currentOdometer;
            odoInput.placeholder = `Actual: ${formatNumber(currentOdometer)} km`;
        }
        const nextInput = document.getElementById('serviceNextKm');
        if (nextInput) {
            nextInput.placeholder = `Ej: ${currentOdometer + 5000}`;
        }
    }
});

// ===== ENVIAR FORMULARIO =====
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        console.log('Guardando servicio...');
        
        const date = document.getElementById('serviceDate').value;
        const type = document.getElementById('serviceType').value.trim();
        const odometer = parseFloat(document.getElementById('serviceOdometer').value);
        const nextKm = parseFloat(document.getElementById('serviceNextKm').value);
        const notes = document.getElementById('serviceNotes').value.trim();
        
        // ===== VALIDACIONES CON MENSAJES CLAROS =====
        
        if (!date) {
            showToast('❌ La fecha es obligatoria', 'error');
            return;
        }
        
        if (!type) {
            showToast('❌ Escribe el tipo de servicio', 'error');
            return;
        }
        
        if (!odometer || isNaN(odometer) || odometer < 0) {
            showToast('❌ El odómetro debe ser un número válido', 'error');
            return;
        }
        
        if (!nextKm || isNaN(nextKm) || nextKm <= 0) {
            showToast('❌ El próximo servicio debe ser un número válido', 'error');
            return;
        }
        
        if (nextKm <= odometer) {
            showToast('❌ El próximo servicio debe ser MAYOR al odómetro actual', 'error');
            return;
        }
        
        // ===== GUARDAR =====
        const entry = {
            date,
            type,
            odometer,
            nextKm,
            notes: notes || ''
        };
        
        console.log('Datos a guardar:', entry);
        
        await addService(entry);
        showToast('✅ Servicio guardado exitosamente', 'success');
        
        setTimeout(() => {
            window.location.href = 'services.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al guardar servicio:', error);
        showToast('❌ Error al guardar: ' + error.message, 'error');
    }
});

// ===== FUNCIÓN AUXILIAR =====
async function getCurrentOdometer() {
    const lastFuel = await getLastFuel();
    if (lastFuel) return lastFuel.odometer;
    const initialKm = getInitialKm();
    return initialKm || 0;
}