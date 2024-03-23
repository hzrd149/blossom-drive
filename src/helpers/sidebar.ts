
export function toggleSidebar() {
    dispatchEvent(new CustomEvent('toggle-sidebar'));
}

export function hideSidebar() {
    dispatchEvent(new CustomEvent('hide-sidebar'));
}

export function doToggleSidebar() {
    window.addEventListener('toggle-sidebar', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('-translate-x-56');
    });
}

export function doHideSidebar() {
    window.addEventListener('hide-sidebar', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.add('-translate-x-56');
    });
}