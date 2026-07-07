let serviceId = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Edit service cargado');
    
    const params = new URLSearchParams(window.location.search);
    serviceId = parseInt(params.get('id'));
    
    if (!serviceId) {
        showToast('❌ Servicio no encontrado', 'error');
        setTimeout(() => window.location.href = 'services.html', 1500);
        return;
    }
    
    await loadServiceData(serviceId);
});

async function loadServiceData(id) {
    try {
        console.log('Cargando servicio ID:', id);
        const service = await getServiceById(id);
        
        if (!service) {
            showToast('❌ Servicio no encontrado', 'error');
            setTimeout(() => window.location.href = 'services.html', 1500);
            return;
        }
        
        document.getElementById('editServiceId').value = service.id;
        document.getElementById('editServiceDate').value = service.date;
        document.getElementById('editServiceType').value = service.type;
        document.getElementById('editServiceOdometer').value = service.odometer;
        document.getElementById('editServiceNextKm').value = service.nextKm;
        document.getElementById('editServiceNotes').value = service.notes || '';
        
        console.log('Servicio cargado correctamente');
        
    } catch (error) {
        console.error('Error al cargar servicio:', error);
        showToast('❌ Error al cargar: ' + error.message, 'error');
    }
}

// ===== ACTUALIZAR =====
document.getElementById('editServiceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const id = parseInt(document.getElementById('editServiceId').value);
        const date = document.getElementById('editServiceDate').value;
        const type = document.getElementById('editServiceType').value.trim();
        const odometer = parseFloat(document.getElementById('editServiceOdometer').value);
        const nextKm = parseFloat(document.getElementById('editServiceNextKm').value);
        const notes = document.getElementById('editServiceNotes').value.trim();
        
        // Validaciones
        if (!date) {
            showToast('❌ La fecha es obligatoria', 'error');
            return;
        }
        if (!type) {
            showToast('❌ Escribe el tipo de servicio', 'error');
            return;
        }
        if (!odometer || isNaN(odometer) || odometer < 0) {
            showToast('❌ Odómetro inválido', 'error');
            return;
        }
        if (!nextKm || isNaN(nextKm) || nextKm <= 0) {
            showToast('❌ Próximo servicio inválido', 'error');
            return;
        }
        if (nextKm <= odometer) {
            showToast('❌ El próximo servicio debe ser MAYOR al odómetro actual', 'error');
            return;
        }
        
        await updateService(id, { date, type, odometer, nextKm, notes });
        showToast('✅ Servicio actualizado', 'success');
        setTimeout(() => window.location.href = 'services.html', 1500);
        
    } catch (error) {
        console.error('Error al actualizar:', error);
        showToast('❌ Error al actualizar: ' + error.message, 'error');
    }
});

// ===== ELIMINAR =====
document.getElementById('deleteServiceBtn').addEventListener('click', async () => {
    if (!confirm('¿Eliminar este servicio permanentemente?')) return;
    
    try {
        await deleteService(parseInt(document.getElementById('editServiceId').value));
        showToast('🗑️ Servicio eliminado', 'success');
        setTimeout(() => window.location.href = 'services.html', 1500);
    } catch (error) {
        console.error('Error al eliminar:', error);
        showToast('❌ Error al eliminar: ' + error.message, 'error');
    }
});