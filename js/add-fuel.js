document.addEventListener('DOMContentLoaded', async () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fuelDate').value = today;
    
    const lastFuel = await getLastFuel();
    const initialKm = getInitialKm();
    
    if (lastFuel) {
        document.getElementById('fuelOdometer').placeholder = `Último: ${formatNumber(lastFuel.odometer)} km`;
        document.getElementById('fuelOdometer').value = lastFuel.odometer;
        document.getElementById('odoHint').textContent = `Último registro: ${formatNumber(lastFuel.odometer)} km`;
    } else if (initialKm) {
        document.getElementById('fuelOdometer').placeholder = `Km inicial: ${formatNumber(initialKm)} km`;
        document.getElementById('fuelOdometer').value = initialKm;
        document.getElementById('odoHint').textContent = `Km inicial configurado: ${formatNumber(initialKm)} km`;
    } else {
        document.getElementById('odoHint').textContent = '💡 Este será el kilometraje inicial de tu auto';
    }
    
    const lastPrice = getLastPrice();
    if (lastPrice) {
        document.getElementById('lastPriceHint').textContent = `Último precio: $${parseFloat(lastPrice).toFixed(2)}`;
        document.getElementById('fuelPrice').value = lastPrice;
    }
    
    document.getElementById('fuelLiters').addEventListener('input', calculateTotal);
    document.getElementById('fuelPrice').addEventListener('input', calculateTotal);
    
    function calculateTotal() {
        const liters = parseFloat(document.getElementById('fuelLiters').value) || 0;
        const price = parseFloat(document.getElementById('fuelPrice').value) || 0;
        const total = liters * price;
        document.getElementById('totalCost').textContent = `$${total.toFixed(2)}`;
    }
});

document.getElementById('fuelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const date = document.getElementById('fuelDate').value;
    const odometer = parseFloat(document.getElementById('fuelOdometer').value);
    const liters = parseFloat(document.getElementById('fuelLiters').value);
    const price = parseFloat(document.getElementById('fuelPrice').value);
    
    if (!date || !odometer || !liters || !price) {
        showToast('❌ Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (odometer < 0 || liters <= 0 || price <= 0) {
        showToast('❌ Valores inválidos', 'error');
        return;
    }
    
    const lastFuel = await getLastFuel();
    if (lastFuel && odometer <= lastFuel.odometer) {
        showToast(`❌ El odómetro debe ser mayor a ${formatNumber(lastFuel.odometer)} km`, 'error');
        return;
    }
    
    // Si es la primera vez, guardar km inicial
    const initialKm = getInitialKm();
    if (!initialKm && !lastFuel) {
        saveInitialKm(odometer);
    }
    
    const totalCost = liters * price;
    
    const entry = {
        date,
        odometer,
        liters,
        pricePerLiter: price,
        totalCost
    };
    
    try {
        await addFuel(entry);
        saveLastPrice(price);
        showToast('✅ Carga guardada exitosamente', 'success');
        
        setTimeout(() => {
            location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al guardar', 'error');
    }
});