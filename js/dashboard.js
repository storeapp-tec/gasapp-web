// Botón para servicios (actualizado)
document.getElementById('serviceBtn').addEventListener('click', async () => {
    try {
        const services = await getAllServices();
        if (services.length === 0) {
            // Si no hay servicios, ir a agregar
            location.href = 'add-service.html';
            return;
        }
        
        // Mostrar lista de servicios para seleccionar
        let options = '0: Agregar nuevo servicio\n';
        services.forEach((s, index) => {
            options += `${index + 1}: ${s.type} (próximo: ${formatNumber(s.nextKm)} km)\n`;
        });
        options += '\nSelecciona un número o escribe 0 para nuevo:';
        
        const choice = prompt(options);
        if (choice === null) return; // Cancelar
        
        const index = parseInt(choice);
        if (isNaN(index)) {
            showToast('❌ Opción inválida', 'error');
            return;
        }
        
        if (index === 0) {
            location.href = 'add-service.html';
        } else if (index > 0 && index <= services.length) {
            const service = services[index - 1];
            location.href = `edit-service.html?id=${service.id}`;
        } else {
            showToast('❌ Opción inválida', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al cargar servicios', 'error');
    }
});