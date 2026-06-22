export const WARRANTY_STATUS_LABELS = {
    NotActivated: 'Chưa kích hoạt',
    Active: 'Đang hiệu lực',
    Expired: 'Hết hạn',
    Cancelled: 'Đã hủy',
};

export const CLAIM_STATUS_LABELS = {
    Pending: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Received: 'Đã tiếp nhận',
    Diagnosing: 'Đang chẩn đoán',
    SentToBrand: 'Đã gửi hãng',
    WaitingParts: 'Chờ linh kiện',
    Repairing: 'Đang sửa chữa',
    ReadyToReturn: 'Sẵn sàng trả khách',
    Delivered: 'Đã trả khách',
    Completed: 'Hoàn tất',
    Rejected: 'Từ chối',
    Cancelled: 'Đã hủy',
};

export const REPAIR_STATUS_LABELS = {
    Pending: 'Chờ tiếp nhận',
    Intake: 'Đã tiếp nhận',
    Received: 'Đã tiếp nhận',
    Diagnosing: 'Đang chẩn đoán',
    WaitingCustomerApproval: 'Chờ khách duyệt chi phí',
    WaitingParts: 'Chờ linh kiện',
    Repairing: 'Đang sửa chữa',
    Testing: 'Đang kiểm tra',
    Completed: 'Hoàn tất sửa chữa',
    Delivered: 'Đã trả khách',
    Cancelled: 'Đã hủy',
    Rejected: 'Từ chối',
};

const labelFrom = (labels, status) => labels[status] || status || '—';

export const warrantyStatusLabel = (status) => labelFrom(WARRANTY_STATUS_LABELS, status);
export const claimStatusLabel = (status) => labelFrom(CLAIM_STATUS_LABELS, status);
export const repairStatusLabel = (status) => labelFrom(REPAIR_STATUS_LABELS, status);
