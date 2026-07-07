document.addEventListener('DOMContentLoaded', async () => {
    // Fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fuelDate').value = today;
    
    // Precargar odómetro con el último valor
    const lastFuel = await getLastFuel();
    if (lastFuel) {
        document.getElementById('fuelOdometer').placeholder = `Último: ${formatNumber(lastFuel.odometer)} km`;
        document.getElementById('fuelOdometer').value = lastFuel.odometer;
    }
    
    // Mostrar último precio
    const lastPrice = getLastPrice();
    if (lastPrice) {
        document.getElementById('lastPriceHint').textContent = `Último precio: $${parseFloat(lastPrice).toFixed(2)}`;
        document.getElementById('fuelPrice').value = lastPrice;
    }
    
    // Calcular costo total en tiempo real
    document.getElementById('fuelLiters').addEventListener('input', calculateTotal);
    document.getElementById('fuelPrice').addEventListener('input', calculateTotal);
    
    function calculateTotal() {
        const liters = parseFloat(document.getElementById('fuelLiters').value) || 0;
        const price = parseFloat(document.getElementById('fuelPrice').value) || 0;
        const total = liters * price;
        document.getElementById('totalCost').textContent = `$${total.toFixed(2)}`;
    }
});

// Enviar formulario
document.getElementById('fuelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const date = document.getElementById('fuelDate').value;
    const odometer = parseFloat(document.getElementById('fuelOdometer').value);
    const liters = parseFloat(document.getElementById('fuelLiters').value);
    const price = parseFloat(document.getElementById('fuelPrice').value);
    
    // Validaciones
    if (!date || !odometer || !liters || !price) {
        showToast('❌ Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (odometer < 0 || liters <= 0 || price <= 0) {
        showToast('❌ Valores inválidos', 'error');
        return;
    }
    
    // Verificar que el odómetro sea mayor al último
    const lastFuel = await getLastFuel();
    if (lastFuel && odometer <= lastFuel.odometer) {
        showToast(`❌ El odómetro debe ser mayor a ${formatNumber(lastFuel.odometer)} km`, 'error');
        return;
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
        
        // Redirigir al dashboard
        setTimeout(() => {
            location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al guardar', 'error');
    }
});