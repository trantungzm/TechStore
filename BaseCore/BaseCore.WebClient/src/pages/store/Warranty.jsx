import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { setPageMeta } from '../../utils/store';

const policyGroups = [
    {
        icon: 'fa-shield-alt',
        title: 'Sản phẩm được bảo hành',
        items: [
            'Sản phẩm mua tại CNTHHT hoặc có thông tin đơn hàng hợp lệ',
            'Sản phẩm còn trong thời hạn bảo hành',
            'Lỗi phát sinh do nhà sản xuất',
            'Sản phẩm còn tem, số serial hoặc thông tin nhận diện hợp lệ nếu có',
        ],
    },
    {
        icon: 'fa-clipboard-check',
        title: 'Điều kiện bảo hành',
        items: [
            'Thời gian bảo hành tùy theo từng sản phẩm và hãng sản xuất',
            'Khách hàng cần cung cấp số điện thoại mua hàng, mã đơn hàng hoặc serial sản phẩm',
            'Sản phẩm cần còn nguyên trạng, không bị can thiệp sửa chữa trái phép',
            'Phụ kiện đi kèm được bảo hành theo chính sách riêng của từng hãng nếu có',
        ],
    },
    {
        icon: 'fa-exclamation-triangle',
        title: 'Trường hợp không được bảo hành',
        items: [
            'Sản phẩm bị rơi vỡ, móp méo, cong vênh',
            'Sản phẩm bị vào nước, ẩm mốc, cháy nổ',
            'Sản phẩm bị lỗi do sử dụng sai hướng dẫn',
            'Sản phẩm đã bị tự ý tháo mở hoặc sửa chữa bên ngoài',
            'Hết thời hạn bảo hành',
            'Không xác minh được thông tin mua hàng hoặc serial sản phẩm',
        ],
    },
];

const warrantySteps = [
    ['Tra cứu thông tin bảo hành', 'Khách hàng nhập số điện thoại, mã đơn hàng hoặc serial để kiểm tra sản phẩm.'],
    ['Gửi yêu cầu bảo hành', 'Khách hàng mô tả lỗi, chọn sản phẩm cần bảo hành và cung cấp thông tin liên hệ.'],
    ['Tiếp nhận sản phẩm', 'Khách hàng mang sản phẩm đến cửa hàng hoặc gửi qua đơn vị vận chuyển.'],
    ['Kỹ thuật kiểm tra', 'Bộ phận kỹ thuật kiểm tra tình trạng sản phẩm, xác định lỗi và điều kiện bảo hành.'],
    ['Hoàn tất xử lý', 'Sản phẩm được bảo hành, sửa chữa, đổi mới hoặc thông báo phương án xử lý phù hợp.'],
];

const warrantyStatuses = [
    ['Chờ tiếp nhận', 'Yêu cầu đã được gửi, chờ nhân viên xác nhận'],
    ['Đã tiếp nhận', 'Sản phẩm đã được cửa hàng tiếp nhận'],
    ['Đang kiểm tra', 'Kỹ thuật đang kiểm tra lỗi'],
    ['Đang gửi hãng', 'Sản phẩm được gửi đến trung tâm bảo hành hãng'],
    ['Đang xử lý', 'Sản phẩm đang được sửa chữa hoặc chờ linh kiện'],
    ['Hoàn tất', 'Sản phẩm đã xử lý xong'],
    ['Từ chối bảo hành', 'Sản phẩm không đủ điều kiện bảo hành miễn phí'],
];

const returnPolicies = [
    {
        icon: 'fa-sync-alt',
        title: 'Đổi trả trong 7 ngày',
        items: [
            'Áp dụng với sản phẩm lỗi do nhà sản xuất',
            'Sản phẩm còn đầy đủ hộp, phụ kiện, hóa đơn hoặc thông tin mua hàng nếu có',
            'Sản phẩm không bị trầy xước, rơi vỡ, vào nước do người dùng',
        ],
    },
    {
        icon: 'fa-ban',
        title: 'Không áp dụng đổi trả',
        items: [
            'Sản phẩm bị lỗi do người dùng sử dụng sai cách',
            'Sản phẩm bị rơi vỡ, cong vênh, vào nước, cháy nổ',
            'Sản phẩm thiếu phụ kiện, hộp hoặc có dấu hiệu can thiệp sửa chữa',
            'Sản phẩm thuộc nhóm không áp dụng đổi trả theo chính sách riêng nếu có',
        ],
    },
    {
        icon: 'fa-tools',
        title: 'Hỗ trợ sau thời gian đổi trả',
        items: [
            'Nếu quá thời gian đổi trả, sản phẩm sẽ được tiếp nhận theo chính sách bảo hành',
            'CNTHHT hỗ trợ kiểm tra và tư vấn phương án sửa chữa phù hợp',
            'Chi phí sửa chữa nếu có sẽ được thông báo trước cho khách hàng',
        ],
    },
];

const faqs = [
    ['Sản phẩm được bảo hành trong bao lâu?', 'Thời gian bảo hành phụ thuộc vào từng sản phẩm và chính sách của hãng sản xuất. Thông tin chi tiết được ghi nhận theo đơn hàng hoặc serial sản phẩm.'],
    ['Tôi cần chuẩn bị gì khi gửi bảo hành?', 'Bạn cần cung cấp số điện thoại mua hàng, mã đơn hàng hoặc serial sản phẩm. Nếu có hộp, phụ kiện và hóa đơn, vui lòng mang theo để quá trình xử lý nhanh hơn.'],
    ['Sản phẩm bị rơi vỡ có được bảo hành không?', 'Các lỗi do rơi vỡ, vào nước, cháy nổ hoặc sử dụng sai cách thường không thuộc phạm vi bảo hành miễn phí.'],
    ['Tôi có thể gửi bảo hành qua chuyển phát không?', 'Có. Bạn có thể gửi sản phẩm qua đơn vị vận chuyển sau khi liên hệ bộ phận hỗ trợ để được hướng dẫn đóng gói và cung cấp thông tin tiếp nhận.'],
    ['Thời gian xử lý bảo hành mất bao lâu?', 'Thời gian xử lý phụ thuộc vào tình trạng sản phẩm và chính sách của hãng. Chúng tôi sẽ cập nhật thông tin cho khách hàng trong quá trình xử lý.'],
    ['Tôi có được đổi sản phẩm mới không?', 'Nếu sản phẩm đủ điều kiện đổi trả hoặc hãng xác nhận lỗi cần đổi mới, chúng tôi sẽ hỗ trợ theo chính sách hiện hành.'],
    ['Nếu hết hạn bảo hành thì sao?', 'Nếu sản phẩm hết hạn bảo hành, CNTHHT vẫn có thể hỗ trợ kiểm tra và tư vấn phương án sửa chữa có phí nếu khách hàng đồng ý.'],
];

const initialForm = {
    name: '',
    phone: '',
    email: '',
    code: '',
    product: '',
    issue: '',
    method: '',
    returnAddress: '',
};

const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const buildRequestCode = () => {
    const now = new Date();
    const date = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('');
    return `BH-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const Warranty = () => {
    const [lookupValue, setLookupValue] = useState('');
    const [lookupError, setLookupError] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [formErrors, setFormErrors] = useState({});
    const [requestMessage, setRequestMessage] = useState('');
    const [requestCode, setRequestCode] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [openFaq, setOpenFaq] = useState(0);

    useEffect(() => {
        setPageMeta({
            title: 'Bảo hành & hỗ trợ sản phẩm | Electro',
            description: 'Tra cứu bảo hành, gửi yêu cầu hỗ trợ, xem chính sách đổi trả và quy trình xử lý sản phẩm gặp sự cố.',
        });
    }, []);

    useEffect(() => () => {
        imagePreviews.forEach((image) => URL.revokeObjectURL(image.url));
    }, [imagePreviews]);

    const lookupStatusClass = useMemo(() => (
        lookupResult?.status === 'Còn bảo hành' ? 'is-active' : 'is-expired'
    ), [lookupResult]);

    const handleLookup = (event) => {
        event.preventDefault();
        const keyword = lookupValue.trim();
        if (!keyword) {
            setLookupError('Vui lòng nhập thông tin cần tra cứu.');
            setLookupResult(null);
            return;
        }
        if (keyword.length < 5) {
            setLookupError('Thông tin tra cứu chưa hợp lệ.');
            setLookupResult(null);
            return;
        }

        const normalized = keyword.toLowerCase();
        const expired = normalized.includes('0002') || normalized.includes('expired') || normalized.includes('het-han');
        setLookupError('');
        setLookupResult(expired ? {
            product: 'MacBook Air M3 13 inch',
            orderCode: 'CNTHHT-2025-0002',
            serial: 'MBA-M3-DEMO',
            purchaseDate: '10/02/2025',
            warrantyPeriod: '12 tháng',
            status: 'Hết hạn bảo hành',
            warrantyUntil: '10/02/2026',
            suggestion: 'Vui lòng liên hệ hỗ trợ để được tư vấn phương án sửa chữa.',
        } : {
            product: 'iPhone 17 Series 256GB',
            orderCode: 'CNTHHT-2026-0001',
            serial: 'IP17-256-DEMO',
            purchaseDate: '12/05/2026',
            warrantyPeriod: '12 tháng',
            status: 'Còn bảo hành',
            warrantyUntil: '12/05/2027',
        });
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
        setFormErrors((current) => ({ ...current, [name]: '' }));
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []).slice(0, 3);
        imagePreviews.forEach((image) => URL.revokeObjectURL(image.url));
        setImagePreviews(files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        })));
    };

    const validateRequest = () => {
        const nextErrors = {};
        if (!formData.name.trim()) nextErrors.name = 'Vui lòng nhập họ và tên.';
        if (!formData.phone.trim()) nextErrors.phone = 'Vui lòng nhập số điện thoại.';
        if (!formData.code.trim()) nextErrors.code = 'Vui lòng nhập mã đơn hàng hoặc serial sản phẩm.';
        if (formData.issue.trim().length < 15) nextErrors.issue = 'Vui lòng mô tả lỗi tối thiểu 15 ký tự.';
        if (!formData.method) nextErrors.method = 'Vui lòng chọn hình thức gửi bảo hành.';
        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleRequestSubmit = (event) => {
        event.preventDefault();
        setRequestMessage('');
        setRequestCode('');
        if (!validateRequest()) return;

        setRequestCode(buildRequestCode());
        setRequestMessage('Yêu cầu bảo hành của bạn đã được gửi. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
        setFormData(initialForm);
        imagePreviews.forEach((image) => URL.revokeObjectURL(image.url));
        setImagePreviews([]);
    };

    return (
        <div className="warranty-page">
            <section className="warranty-hero">
                <div className="container">
                    <div className="warranty-hero-card">
                        <span className="warranty-eyebrow">CNTHHT Care</span>
                        <h1>Bảo hành & hỗ trợ sản phẩm</h1>
                        <p>CNTHHT hỗ trợ bảo hành chính hãng, đổi trả theo chính sách và tư vấn nhanh khi sản phẩm gặp sự cố.</p>
                        <div className="warranty-hero-actions">
                            <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => scrollToSection('warranty-lookup')}>Tra cứu bảo hành</button>
                            <button type="button" className="btn btn-outline-primary rounded-pill px-4" onClick={() => scrollToSection('warranty-request')}>Gửi yêu cầu hỗ trợ</button>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container warranty-content">
                <section id="warranty-policy" className="warranty-section">
                    <div className="warranty-section-heading">
                        <h2>Chính sách bảo hành</h2>
                        <p>Giúp khách hàng hiểu sản phẩm nào được bảo hành, điều kiện bảo hành và trường hợp không được bảo hành.</p>
                    </div>
                    <div className="warranty-card-grid">
                        {policyGroups.map((group) => (
                            <article className="warranty-info-card" key={group.title}>
                                <i className={`fas ${group.icon}`}></i>
                                <h3>{group.title}</h3>
                                <ul>
                                    {group.items.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </article>
                        ))}
                    </div>
                    <p className="warranty-note">Chính sách cụ thể có thể thay đổi tùy theo từng hãng sản xuất và tình trạng thực tế của sản phẩm.</p>
                </section>

                <section id="warranty-lookup" className="warranty-section">
                    <div className="warranty-section-heading">
                        <h2>Tra cứu bảo hành</h2>
                        <p>Nhập số điện thoại, mã đơn hàng hoặc số serial sản phẩm để kiểm tra thời hạn bảo hành.</p>
                    </div>
                    <div className="warranty-lookup-card">
                        <form className="warranty-lookup-form" onSubmit={handleLookup}>
                            <input
                                type="text"
                                value={lookupValue}
                                onChange={(event) => setLookupValue(event.target.value)}
                                placeholder="Nhập số điện thoại, mã đơn hàng hoặc số serial sản phẩm"
                            />
                            <button type="submit" className="btn btn-primary">Tra cứu</button>
                        </form>
                        {lookupError && <div className="warranty-error">{lookupError}</div>}
                        {lookupResult && (
                            <div className="warranty-result">
                                <div className="warranty-result-head">
                                    <div>
                                        <span>Sản phẩm</span>
                                        <strong>{lookupResult.product}</strong>
                                    </div>
                                    <span className={`warranty-status ${lookupStatusClass}`}>{lookupResult.status}</span>
                                </div>
                                <div className="warranty-result-grid">
                                    <p><span>Mã đơn hàng</span>{lookupResult.orderCode}</p>
                                    <p><span>Serial</span>{lookupResult.serial}</p>
                                    <p><span>Ngày mua</span>{lookupResult.purchaseDate}</p>
                                    <p><span>Thời hạn bảo hành</span>{lookupResult.warrantyPeriod}</p>
                                    <p><span>Hạn bảo hành đến</span>{lookupResult.warrantyUntil}</p>
                                </div>
                                {lookupResult.status === 'Còn bảo hành' ? (
                                    <button type="button" className="btn btn-primary rounded-pill" onClick={() => scrollToSection('warranty-request')}>Gửi yêu cầu bảo hành</button>
                                ) : (
                                    <p className="warranty-suggestion">{lookupResult.suggestion}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="warranty-status-board">
                        <h3>Trạng thái bảo hành</h3>
                        <div className="warranty-status-grid">
                            {warrantyStatuses.map(([status, description]) => (
                                <div className="warranty-status-item" key={status}>
                                    <strong>{status}</strong>
                                    <span>{description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="warranty-section">
                    <div className="warranty-section-heading">
                        <h2>Quy trình gửi bảo hành</h2>
                        <p>Luồng tiếp nhận và xử lý sản phẩm gặp sự cố tại CNTHHT.</p>
                    </div>
                    <div className="warranty-timeline">
                        {warrantySteps.map(([title, description], index) => (
                            <article className="warranty-step" key={title}>
                                <span>{index + 1}</span>
                                <h3>{title}</h3>
                                <p>{description}</p>
                            </article>
                        ))}
                    </div>

                    <div id="warranty-request" className="warranty-request-card">
                        <div className="warranty-section-heading is-compact">
                            <h2>Gửi yêu cầu bảo hành</h2>
                            <p>Điền thông tin để CNTHHT tiếp nhận và liên hệ hướng dẫn gửi sản phẩm.</p>
                        </div>
                        {requestMessage && (
                            <div className="warranty-success">
                                <strong>{requestMessage}</strong>
                                <span>Mã yêu cầu: {requestCode}</span>
                            </div>
                        )}
                        <form className="warranty-request-form" onSubmit={handleRequestSubmit}>
                            <label>
                                Họ và tên
                                <input name="name" value={formData.name} onChange={handleFormChange} />
                                {formErrors.name && <span>{formErrors.name}</span>}
                            </label>
                            <label>
                                Số điện thoại
                                <input name="phone" value={formData.phone} onChange={handleFormChange} />
                                {formErrors.phone && <span>{formErrors.phone}</span>}
                            </label>
                            <label>
                                Email nếu có
                                <input type="email" name="email" value={formData.email} onChange={handleFormChange} />
                            </label>
                            <label>
                                Mã đơn hàng / Serial sản phẩm
                                <input name="code" value={formData.code} onChange={handleFormChange} />
                                {formErrors.code && <span>{formErrors.code}</span>}
                            </label>
                            <label>
                                Sản phẩm cần bảo hành
                                <input name="product" value={formData.product} onChange={handleFormChange} />
                            </label>
                            <label className="is-wide">
                                Mô tả lỗi gặp phải
                                <textarea name="issue" value={formData.issue} onChange={handleFormChange} rows={4}></textarea>
                                {formErrors.issue && <span>{formErrors.issue}</span>}
                            </label>
                            <div className="warranty-method is-wide">
                                <strong>Hình thức gửi bảo hành</strong>
                                <div>
                                    <label>
                                        <input type="radio" name="method" value="store" checked={formData.method === 'store'} onChange={handleFormChange} />
                                        Mang đến cửa hàng
                                    </label>
                                    <label>
                                        <input type="radio" name="method" value="shipping" checked={formData.method === 'shipping'} onChange={handleFormChange} />
                                        Gửi chuyển phát
                                    </label>
                                </div>
                                {formErrors.method && <span>{formErrors.method}</span>}
                            </div>
                            {formData.method === 'shipping' && (
                                <label className="is-wide">
                                    Địa chỉ nhận lại sản phẩm
                                    <input name="returnAddress" value={formData.returnAddress} onChange={handleFormChange} />
                                </label>
                            )}
                            <label className="warranty-upload is-wide">
                                <i className="fas fa-camera"></i>
                                <strong>Upload hình ảnh lỗi</strong>
                                <small>Tối đa 3 ảnh, chỉ preview local</small>
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                            </label>
                            {imagePreviews.length > 0 && (
                                <div className="warranty-preview-list is-wide">
                                    {imagePreviews.map((image) => (
                                        <img src={image.url} alt={image.name} key={image.url} />
                                    ))}
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary warranty-submit">Gửi yêu cầu bảo hành</button>
                        </form>
                    </div>
                </section>

                <section className="warranty-section">
                    <div className="warranty-section-heading">
                        <h2>Chính sách đổi trả</h2>
                        <p>Đổi trả áp dụng theo điều kiện riêng và khác với quy trình bảo hành sản phẩm.</p>
                    </div>
                    <div className="warranty-card-grid">
                        {returnPolicies.map((policy) => (
                            <article className="warranty-info-card" key={policy.title}>
                                <i className={`fas ${policy.icon}`}></i>
                                <h3>{policy.title}</h3>
                                <ul>
                                    {policy.items.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </article>
                        ))}
                    </div>
                    <p className="warranty-note">Thời gian đổi trả và điều kiện áp dụng có thể thay đổi theo từng nhóm sản phẩm.</p>
                </section>

                <section id="warranty-faq" className="warranty-section">
                    <div className="warranty-section-heading">
                        <h2>Câu hỏi thường gặp</h2>
                        <p>Những thông tin khách hàng thường cần biết trước khi gửi sản phẩm bảo hành.</p>
                    </div>
                    <div className="warranty-faq-list">
                        {faqs.map(([question, answer], index) => (
                            <article className={`warranty-faq-item ${openFaq === index ? 'is-open' : ''}`} key={question}>
                                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                                    <span>{question}</span>
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                                {openFaq === index && <p>{answer}</p>}
                            </article>
                        ))}
                    </div>
                </section>

                <section className="warranty-section warranty-contact-section">
                    <div className="warranty-contact-card">
                        <div>
                            <span className="warranty-eyebrow">Hỗ trợ nhanh</span>
                            <h2>Thông tin liên hệ hỗ trợ</h2>
                            <p>Liên hệ CNTHHT để được tư vấn quy trình bảo hành, đổi trả hoặc gửi chuyển phát.</p>
                        </div>
                        <div className="warranty-contact-grid">
                            <p><i className="fas fa-phone-alt"></i><span>Hotline</span><strong>0327 188 459</strong></p>
                            <p><i className="fas fa-envelope"></i><span>Email</span><strong>support@cnthht.vn</strong></p>
                            <p><i className="fas fa-clock"></i><span>Thời gian hỗ trợ</span><strong>8:00 - 22:00 mỗi ngày</strong></p>
                        </div>
                        <div className="warranty-addresses">
                            <strong>Địa chỉ tiếp nhận bảo hành</strong>
                            <span>CNTHHT Store - 123 Nguyễn Trãi, Hà Nội</span>
                            <span>CNTHHT Store - 45 Cầu Giấy, Hà Nội</span>
                            <span>CNTHHT Store - 88 Lê Văn Lương, Hà Nội</span>
                        </div>
                        <div className="warranty-contact-actions">
                            <a className="btn btn-primary rounded-pill px-4" href="tel:0327188459">Gọi hỗ trợ</a>
                            <Link className="btn btn-outline-primary rounded-pill px-4" to="/contact">Liên hệ ngay</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Warranty;
