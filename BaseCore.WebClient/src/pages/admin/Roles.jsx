import React, { useEffect, useState } from 'react';
import { roleApi } from '../../services/api';

const roleLabels = {
    Admin: 'Quản trị viên',
    Warehouse: 'Nhân viên kho',
    Technical: 'Kỹ thuật viên',
    User: 'Khách hàng',
};

const roleDescriptions = {
    Admin: 'Toàn quyền quản lý hệ thống',
    Warehouse: 'Quản lý tồn kho, nhập hàng và xử lý đơn',
    Technical: 'Xử lý kỹ thuật, bảo hành, sửa chữa và ticket hỗ trợ',
    User: 'Tài khoản khách hàng mua sắm',
};

const getRoleName = (role) => roleLabels[role?.name] || roleLabels[role?.id] || role?.name || '-';
const getRoleDescription = (role) => role?.descriptionVi || roleDescriptions[role?.name] || roleDescriptions[role?.id] || role?.description || '-';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const rolesRes = await roleApi.getAll();

            const roleItems = (Array.isArray(rolesRes.data) ? rolesRes.data : [])
                .filter((role) => ['Admin', 'User', 'Warehouse', 'Technical'].includes(role.name));

            setRoles(roleItems);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không thể tải dữ liệu vai trò');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Hệ thống</p>
                    <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Vai trò / Phân quyền</h2>
                </div>
                <div className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-4 py-2 text-sm font-semibold text-amber-800">
                   Hệ thống quản trị có 4 vai trò
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-md border border-rose-200 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                    <div className="border-b border-[var(--color-border)] px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Danh sách vai trò</h3>
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <div className="py-12 text-center text-sm font-medium text-[var(--color-fg-muted)]">Đang tải vai trò...</div>
                        ) : (
                            <div className="ts-table-container">
                                <table className="ts-table">
                                    <thead>
                                        <tr>
                                            <th className="ts-table-col-medium">Vai trò</th>
                                            <th className="ts-table-col-auto ts-table-hide-mobile">Mô tả</th>
                                            <th className="ts-table-col-narrow">Người dùng</th>
                                            <th className="ts-table-col-narrow ts-table-hide-mobile">Loại</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role) => (
                                            <tr key={role.id}>
                                                <td>
                                                    <div className="font-bold text-[var(--color-fg)]">{getRoleName(role)}</div>
                                                    <div className="text-xs text-[var(--color-fg-muted)]">{role.name}</div>
                                                </td>
                                                <td className="ts-table-hide-mobile text-[var(--color-fg-muted)]">{getRoleDescription(role)}</td>
                                                <td>
                                                    <span className="inline-flex rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-bold text-[var(--color-accent)] ring-1 ring-[var(--color-border)]">
                                                        {role.userCount || 0}
                                                    </span>
                                                </td>
                                                <td className="ts-table-hide-mobile text-[var(--color-fg-muted)]">Loại {role.userType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="space-y-5">
                    <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                        <div className="border-b border-[var(--color-border)] px-4 py-3">
                            <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Vai trò cố định</h3>
                        </div>
                        <div className="space-y-3 p-4 text-sm text-[var(--color-fg-muted)]">
                            <div>
                                <div className="font-semibold text-[var(--color-fg)]">Quản trị viên <span className="text-xs font-normal text-[var(--color-fg-dim)]">(Admin)</span></div>
                                <div>Quản trị hệ thống, quản lý tài khoản, cấu hình và vận hành tổng.</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[var(--color-fg)]">Nhân viên kho <span className="text-xs font-normal text-[var(--color-fg-dim)]">(Warehouse)</span></div>
                                <div>Quản lý kho, nhập xuất hàng, tồn kho và xử lý đơn tồn kho.</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[var(--color-fg)]">Kỹ thuật viên <span className="text-xs font-normal text-[var(--color-fg-dim)]">(Technical)</span></div>
                                <div>Xử lý bảo hành, sửa chữa, hỗ trợ kỹ thuật và ticket.</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[var(--color-fg)]">Khách hàng <span className="text-xs font-normal text-[var(--color-fg-dim)]">(User)</span></div>
                                <div>Tài khoản khách hàng dùng để mua hàng và theo dõi đơn.</div>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default Roles;
