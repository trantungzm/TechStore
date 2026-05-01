export const formatCurrency = (value) => {
    const currency = localStorage.getItem('currency') || 'USD';
    const lang = localStorage.getItem('language') || 'English';
    const locale = lang === 'Vietnamese' ? 'vi-VN' : 'en-US';
    const rawVnd = Number(value || 0);
    if (currency === 'USD') {
        const rate = Number(localStorage.getItem('usdRateVnd') || 25000);
        const usdValue = rawVnd / (Number.isFinite(rate) && rate > 0 ? rate : 25000);
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
        }).format(usdValue);
    }
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(rawVnd);
};

const dictionary = {
    'English': {
        'Help': 'Help',
        'Support': 'Support',
        'Contact': 'Contact',
        'Call Us:': 'Call Us:',
        'Menu': 'Menu',
        'My Dashboard': 'My Dashboard',
        'Login': 'Login',
        'Order History': 'Order History',
        'My Cart': 'My Cart',
        'Admin Panel': 'Admin Panel',
        'Log Out': 'Log Out',
        'Search Looking For?': 'Search Looking For?',
        'All Category': 'All Category',
        'Advanced Filters': 'Advanced Filters',
        'Category': 'Category',
        'All Categories': 'All Categories',
        'Min Price': 'Min Price',
        'Max Price': 'Max Price',
        'Sort By': 'Sort By',
        'Default': 'Default',
        'Price: Low to High': 'Price: Low to High',
        'Price: High to Low': 'Price: High to Low',
        'Name: A to Z': 'Name: A to Z',
        'Name: Z to A': 'Name: Z to A',
        'In Stock Only': 'In Stock Only',
        'Apply Filters': 'Apply Filters',
        'Home': 'Home',
        'Shop': 'Shop',
        'Shop Cart': 'Shop Cart',
        'Checkout': 'Checkout',
        'Address': 'Address',
        'Mail Us': 'Mail Us',
        'Telephone': 'Telephone',
        'Newsletter': 'Newsletter',
        'Customer Service': 'Customer Service',
        'Returns': 'Returns',
        'Site Map': 'Site Map',
        'Information': 'Information',
        'About Us': 'About Us',
        'Delivery infomation': 'Delivery information',
        'Privacy Policy': 'Privacy Policy',
        'Terms & Conditions': 'Terms & Conditions',
        'Extras': 'Extras',
        'Brands': 'Brands',
        'Gift Vouchers': 'Gift Vouchers',
        'Wishlist': 'Wishlist',
        'Track Your Order': 'Track Your Order',
        'Product Details': 'Product Details',
        'Product not found': 'Product not found',
        'Unable to load product.': 'Unable to load product.',
        'Available': 'Available',
        'No description': 'No description',
        'Cart is empty.': 'Cart is empty.',
        'Go to shop': 'Go to shop',
        'Pages': 'Pages',
        'Contact Us': 'Contact Us',
        'Get in touch': 'Get in touch',
        'We are here for you!': 'We are here for you!',
        "Let's Connect": "Let's Connect",
        'Send Your Message': 'Send Your Message',
        'Your Name': 'Your Name',
        'Your Email': 'Your Email',
        'Your Phone': 'Your Phone',
        'Your Project': 'Your Project',
        'Subject': 'Subject',
        'Message': 'Message',
        'Send Message': 'Send Message',
        'Free Return': 'Free Return',
        '30 days money back guarantee!': '30 days money back guarantee!',
        'Free Shipping': 'Free Shipping',
        'Free shipping on all order': 'Free shipping on all order',
        'Support 24/7': 'Support 24/7',
        'We support online 24 hrs a day': 'We support online 24 hrs a day',
        'Receive Gift Card': 'Receive Gift Card',
        'Recieve gift all over oder $50': 'Recieve gift all over oder $50',
        'Secure Payment': 'Secure Payment',
        'We Value Your Security': 'We Value Your Security',
        'Online Service': 'Online Service',
        'Free return products in 30 days': 'Free return products in 30 days',
        'Special Offer': 'Special Offer',
        'Shop Now': 'Shop Now',
        'Terms and Condition Apply': 'Terms and Condition Apply',
        'Save Up To A $400': 'Save Up To A $400',
        'Save Up To A $200': 'Save Up To A $200',
        'On Selected Laptops & Desktop Or Smartphone': 'On Selected Laptops & Desktop Or Smartphone',
        'Shop Laptops': 'Shop Laptops',
        'Shop Smartphones': 'Shop Smartphones',
        'Cancel reason is required': 'Cancel reason is required',
        'Cancel request sent': 'Cancel request sent',
        'Enter your email': 'Enter your email',
        'SignUp': 'Sign Up',
        'Shop meta description': 'Browse tech products and filter by category and price.',
        'Product meta description': 'View product details, price, availability, and add to cart.',
        'Cart meta description': 'Review items in your cart and proceed to checkout.',
        'Checkout meta description': 'Enter shipping information and place your order.',
        'Wishlist meta description': 'Your saved products for later.',
        'Compare meta description': 'Compare products side-by-side.',
        'Contact meta description': 'Contact us for support and inquiries.',
        'Home meta description': 'Shop the latest technology products with great deals.',
        'Products': 'Products',
        'No products found': 'No products found.',
        'Name': 'Name',
        'Model': 'Model',
        'Quantity': 'Quantity',
        'Total': 'Total',
        'Max stock reached': 'Max stock reached',
    },
    'Vietnamese': {
        'Help': 'Trợ giúp',
        'Support': 'Hỗ trợ',
        'Contact': 'Liên hệ',
        'Call Us:': 'Gọi cho chúng tôi:',
        'Menu': 'Danh mục',
        'My Dashboard': 'Bảng điều khiển',
        'Login': 'Đăng nhập',
        'Order History': 'Lịch sử đơn hàng',
        'My Cart': 'Giỏ hàng',
        'Admin Panel': 'Trang quản trị',
        'Log Out': 'Đăng xuất',
        'Search Looking For?': 'Bạn tìm gì?',
        'All Category': 'Mọi danh mục',
        'Advanced Filters': 'Bộ lọc nâng cao',
        'Category': 'Danh mục',
        'All Categories': 'Tất cả danh mục',
        'Min Price': 'Giá tối thiểu',
        'Max Price': 'Giá tối đa',
        'Sort By': 'Sắp xếp theo',
        'Default': 'Mặc định',
        'Price: Low to High': 'Giá: Thấp đến Cao',
        'Price: High to Low': 'Giá: Cao đến Thấp',
        'Name: A to Z': 'Tên: A đến Z',
        'Name: Z to A': 'Tên: Z đến A',
        'In Stock Only': 'Chỉ còn hàng',
        'Apply Filters': 'Áp dụng',
        'Home': 'Trang chủ',
        'Shop': 'Cửa hàng',
        'Shop Cart': 'Giỏ hàng',
        'Checkout': 'Thanh toán',
        'Address': 'Địa chỉ',
        'Mail Us': 'Email',
        'Telephone': 'Điện thoại',
        'Newsletter': 'Bản tin',
        'Customer Service': 'Chăm sóc khách hàng',
        'Returns': 'Trả hàng',
        'Site Map': 'Sơ đồ trang',
        'Information': 'Thông tin',
        'About Us': 'Về chúng tôi',
        'Delivery infomation': 'Thông tin giao hàng',
        'Privacy Policy': 'Chính sách bảo mật',
        'Terms & Conditions': 'Điều khoản & Điều kiện',
        'Extras': 'Mở rộng',
        'Brands': 'Thương hiệu',
        'Gift Vouchers': 'Phiếu quà tặng',
        'Wishlist': 'Yêu thích',
        'Track Your Order': 'Theo dõi đơn hàng',
        'Product Details': 'Chi tiết sản phẩm',
        'Product not found': 'Không tìm thấy sản phẩm',
        'Unable to load product.': 'Không thể tải sản phẩm.',
        'Available': 'Số lượng',
        'No description': 'Chưa có mô tả',
        'Cart is empty.': 'Giỏ hàng trống.',
        'Go to shop': 'Tới cửa hàng',
        'Pages': 'Trang',
        'Contact Us': 'Liên hệ',
        'Get in touch': 'Kết nối',
        'We are here for you!': 'Chúng tôi luôn sẵn sàng hỗ trợ bạn!',
        "Let's Connect": 'Liên hệ',
        'Send Your Message': 'Gửi tin nhắn',
        'Your Name': 'Họ và tên',
        'Your Email': 'Email',
        'Your Phone': 'Số điện thoại',
        'Your Project': 'Dự án',
        'Subject': 'Tiêu đề',
        'Message': 'Nội dung',
        'Send Message': 'Gửi',
        'Free Return': 'Đổi trả miễn phí',
        '30 days money back guarantee!': 'Hoàn tiền trong 30 ngày!',
        'Free Shipping': 'Miễn phí vận chuyển',
        'Free shipping on all order': 'Miễn phí vận chuyển cho mọi đơn hàng',
        'Support 24/7': 'Hỗ trợ 24/7',
        'We support online 24 hrs a day': 'Hỗ trợ trực tuyến 24 giờ mỗi ngày',
        'Receive Gift Card': 'Nhận thẻ quà tặng',
        'Recieve gift all over oder $50': 'Nhận quà cho đơn hàng từ $50',
        'Secure Payment': 'Thanh toán an toàn',
        'We Value Your Security': 'Chúng tôi coi trọng bảo mật của bạn',
        'Online Service': 'Dịch vụ online',
        'Free return products in 30 days': 'Đổi trả miễn phí trong 30 ngày',
        'Special Offer': 'Ưu đãi đặc biệt',
        'Shop Now': 'Mua ngay',
        'Terms and Condition Apply': 'Áp dụng điều khoản & điều kiện',
        'Save Up To A $400': 'Giảm đến $400',
        'Save Up To A $200': 'Giảm đến $200',
        'On Selected Laptops & Desktop Or Smartphone': 'Áp dụng cho laptop/PC/điện thoại được chọn',
        'Shop Laptops': 'Mua Laptop',
        'Shop Smartphones': 'Mua Điện thoại',
        'Cancel reason is required': 'Vui lòng nhập lý do hủy đơn',
        'Cancel request sent': 'Đã gửi yêu cầu hủy',
        'Enter your email': 'Nhập email của bạn',
        'SignUp': 'Đăng ký',
        'Shop meta description': 'Duyệt sản phẩm công nghệ và lọc theo danh mục, giá.',
        'Product meta description': 'Xem chi tiết sản phẩm, giá, tồn kho và thêm vào giỏ.',
        'Cart meta description': 'Kiểm tra giỏ hàng và tiếp tục thanh toán.',
        'Checkout meta description': 'Nhập thông tin giao hàng và đặt đơn.',
        'Wishlist meta description': 'Danh sách sản phẩm bạn đã lưu.',
        'Compare meta description': 'So sánh sản phẩm theo từng tiêu chí.',
        'Contact meta description': 'Liên hệ để được hỗ trợ và tư vấn.',
        'Home meta description': 'Mua sắm sản phẩm công nghệ mới nhất với ưu đãi tốt.',
        'Products': 'Sản phẩm',
        'No products found': 'Không tìm thấy sản phẩm.',
        'Name': 'Tên',
        'Model': 'Mẫu',
        'Quantity': 'Số lượng',
        'Total': 'Tổng',
        'Max stock reached': 'Đã đạt số lượng tối đa',
        'Smartphone': 'Điện thoại',
        'Laptop': 'Máy tính xách tay',
        'Accessories': 'Phụ kiện',
        'Gaming': 'Đồ chơi game',
        'Tablet': 'Máy tính bảng',
        'Smartwatch': 'Đồng hồ thông minh',
        'Camera': 'Máy ảnh',
        'Audio': 'Âm thanh',
        'Log in to get the best web experience.': 'Đăng nhập để có trải nghiệm web tốt nhất.',
        'Log In': 'Đăng nhập',
        'Sign In': 'Đăng nhập',
        'Username': 'Tên đăng nhập',
        'Password': 'Mật khẩu',
        'Back to Shop': 'Trở về Cửa hàng',
        "Don't have an account?": 'Chưa có tài khoản?',
        'Register here': 'Đăng ký tại đây',
        'Create User Account': 'Tạo tài khoản',
        'Create Account': 'Tạo tài khoản',
        'Full Name': 'Họ và tên',
        'Email': 'Email',
        'Phone': 'Số điện thoại',
        'Already have an account?': 'Đã có tài khoản?',
        'Login here': 'Đăng nhập tại đây',
        'Loading...': 'Đang xử lý...',
        'Compare': 'So sánh',
        'Wishlist': 'Yêu thích',
        'Add To Cart': 'Thêm vào giỏ',
        'Electronics': 'Điện tử',
        'Your wishlist is empty': 'Danh sách yêu thích trống',
        'Continue Shopping': 'Tiếp tục mua sắm',
        'Compare Products': 'So sánh sản phẩm',
        'No products to compare': 'Chưa có sản phẩm để so sánh',
        'Features': 'Đặc điểm',
        'Remove': 'Xoá',
        'Price': 'Giá',
        'Category': 'Danh mục',
        'Availability': 'Tình trạng',
        'In Stock': 'Còn hàng',
        'Out of Stock': 'Hết hàng',
        'Description': 'Mô tả',
        'Action': 'Hành động'
    }
};

export const t = (key) => {
    const lang = localStorage.getItem('language') || 'English';
    return dictionary[lang]?.[key] || key;
};

export const resolveProductImage = (product) => {
    const imageUrl = product?.imageUrl?.trim();
    if (imageUrl) {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
            return imageUrl;
        }
        return `/${imageUrl.replace(/^\/+/, '')}`;
    }

    const fallbackIndex = ((product?.id || 1) - 1) % 18 + 1;
    return `/electro/img/product-${fallbackIndex}.png`;
};

export const getPostLoginPath = (user, requestedPath) => {
    const isAdmin = user?.role === 'Admin';

    if (requestedPath) {
        if (requestedPath.startsWith('/admin') && !isAdmin) {
            return '/';
        }
        return requestedPath;
    }

    return isAdmin ? '/admin' : '/orders';
};

export const setMetaDescription = (description) => {
    const content = String(description || '').trim();
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
};

export const setPageMeta = ({ title, description }) => {
    if (title) {
        document.title = title;
    }
    if (description) {
        setMetaDescription(description);
    }
};

export const toast = (message, variant = 'primary') => {
    window.dispatchEvent(
        new CustomEvent('store:toast', {
            detail: {
                message: String(message || ''),
                variant,
            },
        })
    );
};
