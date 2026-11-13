import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * jsdom no implementa `<dialog>` modal. Se simulan `showModal` y `close` para
 * poder probar los diálogos; el foco atrapado y el fondo inerte los aporta el
 * navegador real.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
        this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
    };
}

afterEach(() => {
    cleanup();
});
