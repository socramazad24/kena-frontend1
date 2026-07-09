# Arquitectura de Impresión - NUMERIX

## Descripción General

Sistema desacoplado de impresión preparado para múltiples tipos de
dispositivos (PDF, térmicas futuras) sin afectar el código existente.

## Componentes

### 1. Tipos (`types/print.types.ts`)
- Define todos los tipos de tickets (BET, PRIZE, CASH_CLOSURE, DAILY_REPORT)
- Define `PrintData`, `PrintJob`, `PrintOptions`, etc.

### 2. Interface (`services/print/print-adapter.interface.ts`)
- `IPrintAdapter`: contrato que todos los adaptadores deben cumplir
- Métodos: `process()`, `generateHtml()`, `isAvailable()`, `cancel()`

### 3. Adaptadores
- `PdfPrintAdapter`: implementación actual (genera PDFs)
- `ThermalPrintAdapter`: stub para impresoras térmicas futuras

### 4. Fábrica (`services/print/print-adapter.factory.ts`)
- Crea y cachea instancias de adaptadores
- `createAuto()`: selecciona el mejor disponible

### 5. Servicio (`services/print/print.service.ts`)
- API principal para el resto de la aplicación
- Maneja cola de trabajos, historial, reimpresión

### 6. Hook (`hooks/usePrint.ts`)
- Interfaz React para usar el servicio
- Maneja loading, errores, último trabajo

### 7. Builders (`services/print/print-builders.ts`)
- Funciones helper para construir `PrintData` desde entidades
- `buildBetPrintData()`, `buildPrizePrintData()`, etc.

### 8. Componentes UI
- `PrintButton`: botón que dispara impresión
- `QRCode`: componente para renderizar QR (placeholder)
- `PrintersPage`: panel de admin (futuro)

## Flujo de Impresión

```
Componente
  ↓ usePrint()
Hook
  ↓ printService.print()
Servicio
  ↓ PrintAdapterFactory.create()
Adaptador
  ↓ process() → genera PDF
  ↓ download/print
```

## Para Activar Impresora Térmica (Futuro)

1. Instalar librería: `npm install escpos`
2. Implementar `ThermalPrintAdapter.process()`:
   ```typescript
   async process(job, options) {
     const device = new escpos.USB();
     await device.open();
     // convertir PrintData a comandos ESC/POS
     device.close();
   }
   ```
3. Configurar conexión USB/Bluetooth/Red
4. Activar en producción

## Extensibilidad

Para agregar un nuevo tipo de impresión:
1. Crear nueva clase que implemente `IPrintAdapter`
2. Agregar el tipo en `AdapterType`
3. Registrar en `PrintAdapterFactory`
4. ¡Listo! No se modifica nada más.
