let fuelId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    fuelId = parseInt(params.get('id'));
    
    if (!fuelId) {
        showToast('❌ Carga no encontrada', 'error');
        setTimeout(() => location.href = 'index.html', 1500);
        return;
    }
    
    await loadFuelData(fuelId);
    
    document.getElementById('editFuelLiters').addEventListener('input', calculateTotal);
    document.getElementById('editFuelPrice').addEventListener('input', calculateTotal);
});

async function loadFuelData(id) {
    try {
        const allFuels = await getAllFuels();
        const fuel = allFuels.find(f => f.id === id);
        
        if (!fuel) {
            showToast('❌ Carga no encontrada', 'error');
            setTimeout(() => location.href = 'index.html', 1500);
            return;
        }
        
        document.getElementById('editFuelId').value = fuel.id;
        document.getElementById('editFuelDate').value = fuel.date;
        document.getElementById('editFuelOdometer').value = fuel.odometer;
        document.getElementById('editFuelLiters').value = fuel.liters;
        document.getElementById('editFuelPrice').value = fuel.pricePerLiter;
        document.getElementById('editTotalCost').textContent = `$${fuel.totalCost.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al cargar', 'error');
    }
}

function calculateTotal() {
    const liters = parseFloat(document.getElementById('editFuelLiters').value) || 0;
    const price = parseFloat(document.getElementById('editFuelPrice').value) || 0;
    document.getElementById('editTotalCost').textContent = `$${(liters * price).toFixed(2)}`;
}

document.getElementById('editFuelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editFuelId').value);
    const date = document.getElementById('editFuelDate').value;
    const odometer = parseFloat(document.getElementById('editFuelOdometer').value);
    const liters = parseFloat(document.getElementById('editFuelLiters').value);
    const price = parseFloat(document.getElementById('editFuelPrice').value);
    
    if (!date || !odometer || !liters || !price) {
        showToast('❌ Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (odometer < 0 || liters <= 0 || price <= 0) {
        showToast('❌ Valores inválidos', 'error');
        return;
    }
    
    try {
        await updateFuel(id, { date, odometer, liters, pricePerLiter: price, totalCost: liters * price });
        showToast('✅ Carga actualizada', 'success');
        setTimeout(() => location.href = 'index.html', 1500);
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al actualizar', 'error');
    }
});

document.getElementById('deleteFuelBtn').addEventListener('click', async () => {
    if (!confirm('¿Eliminar esta carga permanentemente?')) return;
    
    try {
        await deleteFuel(parseInt(document.getElementById('editFuelId').value));
        showToast('🗑️ Carga eliminada', 'success');
        setTimeout(() => location.href = 'index.html', 1500);
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al eliminar', 'error');
    }
});