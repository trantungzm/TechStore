// Thông báo toàn app: toast (nổi góc màn hình) + hộp xác nhận (modal) thay cho alert()/confirm().
// Dùng window event để gọi được từ bất kỳ đâu mà không cần truyền context.

export const toast = (message, variant = 'info') => {
    if (!message) return;
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: String(message), variant } }));
};
toast.success = (m) => toast(m, 'success');
toast.error = (m) => toast(m, 'danger');
toast.warning = (m) => toast(m, 'warning');
toast.info = (m) => toast(m, 'info');

// Trả về Promise<boolean>: true nếu người dùng đồng ý.
// Dùng: if (!(await confirmDialog({ message, tone: 'danger' }))) return;
export const confirmDialog = (options = {}) => new Promise((resolve) => {
    const detail = typeof options === 'string' ? { message: options } : options;
    window.dispatchEvent(new CustomEvent('app:confirm', { detail: { ...detail, resolve } }));
});

// Trả về Promise<string|null>: input value từ người dùng, hoặc null nếu hủy.
// Dùng: const pin = await promptDialog('Nhập mã PIN:', '');
export const promptDialog = (message = '', defaultValue = '') => new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('app:prompt', { detail: { message, defaultValue, resolve } }));
});
