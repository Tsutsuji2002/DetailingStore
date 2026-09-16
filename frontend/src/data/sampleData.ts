import type {
  Service, ServiceCategory, Product, ProductCategory,
  Post, Notification, ScheduleShift, ChatConversation, ChatMessage, User, Job, MechanicDoc, ShopInfo
} from '@/types';

// ── Users ──────────────────────────────────────────────
export const SAMPLE_USERS: User[] = [
  {
    id: 'u1', username: 'admin', email: 'admin@61team.vn', firstName: 'Viên', lastName: 'Quản Trị', fullName: 'Quản Trị Viên',
    role: 'admin', phone: '0901234567',
    address: '123 Đường Lý Thường Kiệt, Q.10, TP.HCM', createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u2', username: 'minh_staff', email: 'minh@61team.vn', firstName: 'Minh', lastName: 'Nguyễn Văn', fullName: 'Nguyễn Văn Minh',
    role: 'staff', phone: '0912345678',
    address: 'Bình Thạnh, TP.HCM', createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'u3', username: 'customer1', email: 'khang@gmail.com', firstName: 'Khang', lastName: 'Trần Văn', fullName: 'Trần Văn Khang',
    role: 'customer', phone: '0923456789',
    address: 'Gò Vấp, TP.HCM', createdAt: '2024-06-20T00:00:00Z',
  },
];

// ── Shop Info ──────────────────────────────────────────
export const SHOP_INFO: ShopInfo = {
  name: 'Detailing Store',
  logoIcon: undefined,
  tagline: 'Chuyên Detailing & Sửa Chữa Xe Máy Cao Cấp',
  address: '123 Đường Lý Thường Kiệt, Phường 7, Quận 10, TP. Hồ Chí Minh',
  phone: '0901 234 567',
  email: 'contact@detailingstore.vn',
  taxId: '0315678901',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4508!2d106.6604!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM3LjAiTiAxMDbCsDM5JzM3LjQiRQ!5e0!3m2!1svi!2svn!4v1600000000000',
  workingHours: 'Thứ 2 – Thứ 7: 7:30 – 18:30 | Chủ nhật: 8:00 – 16:00',
  socialLinks: {
    facebook: 'https://facebook.com/detailingstore',
    instagram: 'https://instagram.com/detailingstore',
    zalo: 'https://zalo.me/detailingstore',
    youtube: 'https://youtube.com/@detailingstore',
  },
};

// ── Service Categories ─────────────────────────────────
export const SAMPLE_SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'sc1', name: 'Detailing', slug: 'detailing' },
  { id: 'sc2', name: 'Sửa Chữa', slug: 'repair' },
  { id: 'sc3', name: 'Bảo Dưỡng', slug: 'maintenance' },
  { id: 'sc4', name: 'Nâng Cấp', slug: 'upgrade' },
  { id: 'sc5', name: 'Đồng Sơn', slug: 'paint' },
];

// ── Services ───────────────────────────────────────────
export const SAMPLE_SERVICES: Service[] = [
  {
    id: 's1', name: 'Detailing Toàn Diện Premium', slug: 'detailing-premium',
    categoryId: 'sc1', description: 'Dịch vụ làm đẹp xe toàn diện với các sản phẩm cao cấp. Bao gồm rửa xe chuyên nghiệp, đánh bóng sơn, dưỡng nhựa/cao su, vệ sinh khoang máy và phủ ceramic/wax bảo vệ lâu dài.',
    shortDescription: 'Detailing xe toàn diện với sản phẩm cao cấp, phủ ceramic bảo vệ.',
    priceFrom: 800000, priceTo: 2500000, duration: '4-8 giờ',
    images: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    tags: ['detailing', 'ceramic', 'cao cấp', 'bảo vệ sơn'], isActive: true,
    createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 's2', name: 'Rửa Xe & Dưỡng Xe Cơ Bản', slug: 'rua-xe-co-ban',
    categoryId: 'sc1', description: 'Rửa xe sạch sẽ, lau khoang máy, dưỡng nhựa, xi bóng bánh xe. Phù hợp cho xe máy các loại.',
    shortDescription: 'Rửa xe cơ bản + dưỡng xe sạch bóng.',
    priceFrom: 50000, priceTo: 150000, duration: '1-2 giờ',
    images: ['https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600'],
    tags: ['rửa xe', 'cơ bản'], isActive: true,
    createdAt: '2024-01-12T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z',
  },
  {
    id: 's3', name: 'Sửa Chữa Động Cơ Tổng Thể', slug: 'sua-chua-dong-co',
    categoryId: 'sc2', description: 'Chẩn đoán và sửa chữa toàn bộ hệ thống động cơ: bóc máy, vệ sinh kim phun, kiểm tra xu páp, thay các chi tiết bị mòn. Bảo hành 3 tháng sau sửa.',
    shortDescription: 'Sửa chữa động cơ toàn diện, bảo hành 3 tháng.',
    priceFrom: 500000, priceTo: 3000000, duration: '1-3 ngày',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600'],
    tags: ['động cơ', 'sửa chữa', 'bảo hành'], isActive: true,
    createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-08-05T00:00:00Z',
  },
  {
    id: 's4', name: 'Bảo Dưỡng Định Kỳ', slug: 'bao-duong-dinh-ky',
    categoryId: 'sc3', description: 'Thay nhớt, lọc nhớt, kiểm tra thắng, vòng bi, dây cu-roa, xích sên, đèn chiếu sáng. Tư vấn toàn bộ tình trạng xe.',
    shortDescription: 'Thay nhớt + kiểm tra toàn xe định kỳ.',
    priceFrom: 200000, priceTo: 500000, duration: '2-3 giờ',
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'],
    tags: ['bảo dưỡng', 'thay nhớt', 'định kỳ'], isActive: true,
    createdAt: '2024-02-15T00:00:00Z', updatedAt: '2024-07-10T00:00:00Z',
  },
  {
    id: 's5', name: 'Đồng Sơn & Phục Hồi Màu', slug: 'dong-son',
    categoryId: 'sc5', description: 'Sơn lại xe, thay tem decal, phục hồi màu sơn bị oxy hóa. Sử dụng sơn ô tô cao cấp, màu chính xác theo code.',
    shortDescription: 'Sơn xe, đồng sơn, thay tem decal cao cấp.',
    priceFrom: 1500000, priceTo: 8000000, duration: '3-7 ngày',
    images: ['https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600'],
    tags: ['đồng sơn', 'phục hồi', 'tem xe'], isActive: true,
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-08-10T00:00:00Z',
  },
  {
    id: 's6', name: 'Nâng Cấp Hệ Thống Đèn LED', slug: 'nang-cap-den-led',
    categoryId: 'sc4', description: 'Độ đèn LED bi cầu, đèn xi nhan LED, đèn hậu LED. Đảm bảo đúng chuẩn, sáng rõ, tiết kiệm điện.',
    shortDescription: 'Độ đèn bi cầu LED + LED toàn bộ xe.',
    priceFrom: 800000, priceTo: 3500000, duration: '2-6 giờ',
    images: ['https://images.unsplash.com/photo-1558098329-a11cff621064?w=600'],
    tags: ['led', 'đèn', 'nâng cấp', 'độ xe'], isActive: true,
    createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-08-12T00:00:00Z',
  },
];

// ── Product Categories ─────────────────────────────────
export const SAMPLE_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'pc1', name: 'Nhớt & Dầu', slug: 'oil' },
  { id: 'pc2', name: 'Phụ Tùng', slug: 'parts' },
  { id: 'pc3', name: 'Phụ Kiện', slug: 'accessories' },
  { id: 'pc4', name: 'Hóa Chất Detailing', slug: 'chemicals' },
  { id: 'pc5', name: 'Lốp & Vành', slug: 'tires' },
];

// ── Products ───────────────────────────────────────────
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Nhớt Honda Ultra Gold 10W-30', slug: 'nhot-honda-ultra-gold',
    categoryId: 'pc1', description: 'Nhớt chính hãng Honda, loại bán tổng hợp 10W-30, dùng cho các dòng xe Honda. Bảo vệ động cơ tối ưu, phù hợp khí hậu Việt Nam.',
    shortDescription: 'Nhớt bán tổng hợp Honda chính hãng 10W-30 / 0.8L',
    price: 95000, stock: 200, brand: 'Honda',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    tags: ['nhớt', 'honda', 'bán tổng hợp'], rating: 4.7, reviewCount: 128, isActive: true,
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'p2', name: 'Lọc Nhớt Yamaha Original', slug: 'loc-nhot-yamaha',
    categoryId: 'pc2', description: 'Lọc nhớt chính hãng Yamaha, dùng cho các dòng Exciter, Sirius, Jupiter, NVX... Bộ lọc tiêu chuẩn nhà máy.',
    shortDescription: 'Lọc nhớt chính hãng Yamaha, đa dòng xe.',
    price: 35000, stock: 500, brand: 'Yamaha',
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=400'],
    tags: ['lọc nhớt', 'yamaha', 'phụ tùng'], rating: 4.5, reviewCount: 342, isActive: true,
    createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-07-15T00:00:00Z',
  },
  {
    id: 'p3', name: 'Bộ Hóa Chất Detailing CarPro Set', slug: 'hoa-chat-carpro',
    categoryId: 'pc4', description: 'Set hóa chất chuyên dụng CarPro bao gồm: dầu gội xe, dưỡng nhựa, xi bóng bánh, tẩy iron xe. Nhập khẩu chính hãng.',
    shortDescription: 'Set hóa chất detailing CarPro nhập khẩu (4 sản phẩm).',
    price: 650000, discountPrice: 580000, stock: 45, brand: 'CarPro',
    images: ['https://images.unsplash.com/photo-1607349913338-fca6f58f34cd?w=400'],
    tags: ['carpro', 'detailing', 'hóa chất', 'nhập khẩu'], rating: 4.9, reviewCount: 67, isActive: true,
    createdAt: '2024-02-10T00:00:00Z', updatedAt: '2024-08-05T00:00:00Z',
  },
  {
    id: 'p4', name: 'Lốp Michelin Pilot Street 2 100/80-14', slug: 'lop-michelin-pilot-street',
    categoryId: 'pc5', description: 'Lốp xe máy Michelin Pilot Street 2, size 100/80-14. Độ bám đường cao, chống trơn trượt, bền lâu. Phù hợp xe tay ga cỡ vừa.',
    shortDescription: 'Lốp Michelin Pilot Street 2 100/80-14 – bám đường tốt.',
    price: 890000, stock: 30, brand: 'Michelin',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],
    tags: ['michelin', 'lốp xe', 'pilot street'], rating: 4.8, reviewCount: 95, isActive: true,
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-08-08T00:00:00Z',
  },
  {
    id: 'p5', name: 'Kính Chắn Gió Universal Sport', slug: 'kinh-chan-gio-sport',
    categoryId: 'pc3', description: 'Kính chắn gió thể thao đa năng, kích thước vừa, chất liệu PC chống vỡ. Lắp vừa hầu hết các dòng xe tay ga.',
    shortDescription: 'Kính chắn gió thể thao kích thước vừa, chất liệu PC.',
    price: 280000, discountPrice: 240000, stock: 80, brand: 'Generic',
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400'],
    tags: ['kính chắn gió', 'phụ kiện', 'tay ga'], rating: 4.2, reviewCount: 43, isActive: true,
    createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-07-20T00:00:00Z',
  },
  {
    id: 'p6', name: 'Xích Sên DID 428 Standard 120L', slug: 'xich-sen-did-428',
    categoryId: 'pc2', description: 'Xích sên DID 428 Standard dài 120 mắt. Thép cao cấp, tải trọng bền, phù hợp xe côn số 100-150cc.',
    shortDescription: 'Xích sên DID 428 Standard 120 mắt cho xe côn số.',
    price: 195000, stock: 150, brand: 'DID',
    images: ['https://images.unsplash.com/photo-1563720221871-5b0b95b6c6ee?w=400'],
    tags: ['xích sên', 'did', 'phụ tùng', 'côn số'], rating: 4.6, reviewCount: 212, isActive: true,
    createdAt: '2024-05-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z',
  },
];

// ── Posts ──────────────────────────────────────────────
export const SAMPLE_POSTS: Post[] = [
  {
    id: 'post1', title: 'Tips Chăm Sóc Xe Mùa Mưa – Đừng Để Xe Bị Hỏng!',
    slug: 'tips-cham-soc-xe-mua-mua',
    content: `<h2>Mùa mưa đến – xe cần được bảo vệ đặc biệt!</h2>
<p>Mùa mưa là thời điểm xe máy phải đối mặt với nhiều nguy cơ nhất: rỉ sét, nước vào động cơ, thắng bị ăn mòn... Dưới đây là những tips quan trọng để bảo vệ xe yêu của bạn.</p>
<h3>1. Rửa xe sau mỗi ngày mưa</h3>
<p>Nước mưa chứa nhiều axit và tạp chất gây hại cho sơn xe. Hãy rửa xe ngay sau khi đi mưa về để tránh đọng lại các vết ố.</p>
<h3>2. Kiểm tra hệ thống thắng</h3>
<p>Má thắng ướt sẽ giảm hiệu quả phanh đáng kể. Hãy kiểm tra độ ăn mòn của má thắng thường xuyên hơn trong mùa mưa.</p>
<h3>3. Phủ ceramic cho sơn xe</h3>
<p>Ceramic coating giúp bảo vệ sơn xe khỏi các tác nhân bên ngoài, làm nước đọng thành hạt và tự trôi đi, giữ xe sạch bóng lâu hơn.</p>`,
    excerpt: 'Những tips bảo vệ xe máy trong mùa mưa mà bạn không thể bỏ qua!',
    mediaType: 'image', mediaUrls: ['https://images.unsplash.com/photo-1519121785383-3229633bb75b?w=800'],
    coverImage: 'https://images.unsplash.com/photo-1519121785383-3229633bb75b?w=800',
    authorId: 'u1', author: SAMPLE_USERS[0],
    tags: ['tips', 'mùa mưa', 'bảo vệ xe'],
    likes: 142, commentCount: 28, isLiked: false, isPublished: true,
    createdAt: '2024-08-10T08:00:00Z', updatedAt: '2024-08-10T08:00:00Z',
  },
  {
    id: 'post2', title: '61 Team Ra Mắt Dịch Vụ Detailing Nano Ceramic Mới!',
    slug: 'ra-mat-dich-vu-nano-ceramic',
    content: `<p>Chúng tôi vừa chính thức ra mắt gói dịch vụ <strong>Nano Ceramic Premium</strong> – đỉnh cao bảo vệ sơn xe với công nghệ ceramic thế hệ mới nhất từ Nhật Bản.</p>
<p>Gói dịch vụ bao gồm:</p>
<ul><li>Rửa xe 2 tầng (Two Bucket Method)</li><li>Điều chỉnh sơn (Paint Correction)  </li><li>Phủ Nano Ceramic 9H</li><li>Bảo hành 2 năm</li></ul>
<p>Đặt lịch ngay hôm nay để nhận ưu đãi khai trương!</p>`,
    excerpt: 'Ra mắt dịch vụ Nano Ceramic Premium – bảo vệ sơn xe với công nghệ đỉnh cao.',
    mediaType: 'image', mediaUrls: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800'],
    coverImage: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800',
    authorId: 'u1', author: SAMPLE_USERS[0],
    tags: ['ceramic', 'dịch vụ mới', 'nano'],
    likes: 98, commentCount: 15, isLiked: false, isPublished: true,
    createdAt: '2024-08-05T10:00:00Z', updatedAt: '2024-08-05T10:00:00Z',
  },
  {
    id: 'post3', title: 'Hướng Dẫn Tự Bảo Dưỡng Xe Máy Tại Nhà',
    slug: 'tu-bao-duong-xe-tai-nha',
    content: `<p>Bạn có thể tự bảo dưỡng xe máy tại nhà một cách dễ dàng với những bước cơ bản sau đây...</p>`,
    excerpt: 'Hướng dẫn từng bước tự bảo dưỡng xe máy đơn giản tại nhà.',
    mediaType: 'text', mediaUrls: [],
    coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    authorId: 'u2', author: SAMPLE_USERS[1],
    tags: ['hướng dẫn', 'bảo dưỡng', 'tự làm'],
    likes: 75, commentCount: 9, isLiked: true, isPublished: true,
    createdAt: '2024-07-28T14:00:00Z', updatedAt: '2024-07-28T14:00:00Z',
  },
];

// ── Jobs ───────────────────────────────────────────────
export const SAMPLE_JOBS: Job[] = [
  {
    id: 'j1', title: 'Thợ Kỹ Thuật Điện Xe Máy', type: 'full-time', department: 'Kỹ Thuật',
    location: 'TP. Hồ Chí Minh',
    description: 'Chẩn đoán và sửa chữa hệ thống điện xe máy, EFI, hệ thống đèn và phụ kiện điện. Sử dụng thiết bị chẩn đoán chuyên dụng.',
    requirements: ['Tốt nghiệp trường kỹ thuật ngành điện/điện lạnh/ô tô xe máy', 'Kinh nghiệm ≥ 2 năm', 'Ưu tiên biết chẩn đoán lỗi EFI', 'Có xe đi làm'],
    benefits: ['Lương cơ bản 8–12 triệu + thưởng KPI', 'BHXH đầy đủ', 'Thưởng lễ/tết', 'Môi trường chuyên nghiệp'],
    salary: '8.000.000 – 12.000.000 VNĐ', isActive: true,
    createdAt: '2024-08-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'j2', title: 'Kỹ Thuật Viên Detailing', type: 'full-time', department: 'Detailing',
    location: 'TP. Hồ Chí Minh',
    description: 'Thực hiện các dịch vụ detailing xe máy: rửa xe, đánh bóng sơn, phủ ceramic, vệ sinh khoang máy.',
    requirements: ['Đam mê xe và detailing', 'Cẩn thận, tỉ mỉ', 'Được đào tạo tại xưởng (có thể nhận sinh viên chưa có kinh nghiệm)', 'Sức khỏe tốt'],
    benefits: ['Lương 6–9 triệu', 'Đào tạo hoàn toàn miễn phí', 'Môi trường trẻ, năng động'],
    salary: '6.000.000 – 9.000.000 VNĐ', isActive: true,
    createdAt: '2024-08-05T00:00:00Z', updatedAt: '2024-08-05T00:00:00Z',
  },
  {
    id: 'j3', title: 'Học Nghề Sửa Xe (Apprentice)', type: 'apprentice', department: 'Kỹ Thuật',
    location: 'TP. Hồ Chí Minh',
    description: 'Chương trình học nghề 6 tháng tại 61 Team. Học viên sẽ được hướng dẫn trực tiếp bởi thợ lành nghề có trên 10 năm kinh nghiệm.',
    requirements: ['Từ 16 tuổi trở lên', 'Đam mê sửa xe', 'Có khả năng học hỏi', 'Không yêu cầu bằng cấp'],
    benefits: ['Trợ cấp học nghề 2–3 triệu/tháng', 'Được nhận vào làm toàn thời gian sau khi tốt nghiệp', 'Học phí: MIỄN PHÍ'],
    isActive: true, createdAt: '2024-08-08T00:00:00Z', updatedAt: '2024-08-08T00:00:00Z',
  },
];

// ── Notifications ──────────────────────────────────────
export const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'order', title: 'Đơn hàng đã được xác nhận', message: 'Đơn hàng #DH2024081401 của bạn đã được xác nhận và đang chuẩn bị.', isRead: false, createdAt: '2024-08-14T10:00:00Z', link: '/account' },
  { id: 'n2', type: 'info', title: 'Khuyến mãi mùa mưa', message: 'Giảm 20% toàn bộ dịch vụ detailing từ 15/8 đến 30/8!', isRead: false, createdAt: '2024-08-13T09:00:00Z', link: '/services' },
  { id: 'n3', type: 'success', title: 'Lịch hẹn được xác nhận', message: 'Lịch hẹn bảo dưỡng xe vào 9:00 sáng ngày 16/8 đã được xác nhận.', isRead: true, createdAt: '2024-08-12T15:00:00Z' },
  { id: 'n4', type: 'message', title: 'Tin nhắn mới từ 61 Team', message: 'Nhân viên CSKH đã trả lời câu hỏi của bạn.', isRead: true, createdAt: '2024-08-11T11:00:00Z' },
];

// ── Schedule Shifts ────────────────────────────────────
export const SAMPLE_SHIFTS: ScheduleShift[] = [
  { id: 'sh1', staffId: 'u2', shiftTypeId: 'morning', date: '2024-08-14', notes: 'Ca sáng – khu vực detailing' },
  { id: 'sh2', staffId: 'u2', shiftTypeId: 'morning', date: '2024-08-15' },
  { id: 'sh3', staffId: 'u3', shiftTypeId: 'afternoon', date: '2024-08-14', notes: 'Ca chiều – khu vực sửa chữa' },
  { id: 'sh4', staffId: 'u3', shiftTypeId: 'morning', date: '2024-08-16' },
];

// ── Chat ───────────────────────────────────────────────
export const SAMPLE_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv1', participants: [SAMPLE_USERS[0], SAMPLE_USERS[1]],
    lastMessage: { id: 'm3', conversationId: 'conv1', senderId: 'u2', content: 'Ok anh, em sẽ xử lý ngay!', isRead: true, timestamp: '2024-08-14T09:30:00Z' },
    unreadCount: 0, isGroup: false,
  },
  {
    id: 'conv2', participants: [SAMPLE_USERS[0], SAMPLE_USERS[1]],
    lastMessage: { id: 'm5', conversationId: 'conv2', senderId: 'u1', content: 'Nhớ kiểm tra xe của khách VIP nhé!', isRead: false, timestamp: '2024-08-14T11:00:00Z' },
    unreadCount: 1, isGroup: true, groupName: 'Team 61', groupAvatar: 'https://i.pravatar.cc/40?img=50',
  },
];

// ── Chat Messages ──────────────────────────────────────
export const SAMPLE_MESSAGES: Record<string, ChatMessage[]> = {
  conv1: [
    { id: 'm1', conversationId: 'conv1', senderId: 'u1', senderName: 'Admin 61 Team', content: 'Minh ơi, hôm nay có xe Honda Winner cần detailing lúc 2h chiều nhé.', isRead: true, timestamp: '2024-08-14T08:00:00Z' },
    { id: 'm2', conversationId: 'conv1', senderId: 'u2', senderName: 'Nguyễn Văn Minh', content: 'Vâng anh, em đã ghi nhận rồi ạ.', isRead: true, timestamp: '2024-08-14T08:05:00Z' },
    { id: 'm3', conversationId: 'conv1', senderId: 'u2', senderName: 'Nguyễn Văn Minh', content: 'Ok anh, em sẽ xử lý ngay!', isRead: true, timestamp: '2024-08-14T09:30:00Z' },
  ],
  conv2: [
    { id: 'm4', conversationId: 'conv2', senderId: 'u2', senderName: 'Nguyễn Văn Minh', content: 'Chào mọi người! Sáng nay ca đông không ạ?', isRead: true, timestamp: '2024-08-14T10:30:00Z' },
    { id: 'm5', conversationId: 'conv2', senderId: 'u1', senderName: 'Admin 61 Team', content: 'Nhớ kiểm tra xe của khách VIP nhé!', isRead: false, timestamp: '2024-08-14T11:00:00Z' },
  ],
};

// ── Mechanic Docs ──────────────────────────────────────
export const SAMPLE_MECHANIC_DOCS: MechanicDoc[] = [
  {
    id: 'md1', brand: 'Honda', vehicleModel: 'Wave RSX 110 (2018-2024)', category: 'Hệ Thống Động Cơ & FI', errorCode: 'P0300',
    title: 'Lỗi P0300 – Động Cơ Đánh Lửa Ngẫu Nhiên (Misfire)',
    symptoms: 'Đèn FI nhấp nháy, xe nổ không đều, hụt ga khi tăng tốc',
    solutionSteps: [
      'Kiểm tra điện trở cuộn dây cao áp đánh lửa',
      'Vệ sinh kim phun xăng điện tử PGM-FI bằng sóng siêu âm',
      'Đo áp suất bơm xăng (tiêu chuẩn 2.9 bar)',
      'Thay thế bugi chân dài chính hãng Honda',
    ],
    diagrams: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600'],
    videoUrl: 'https://youtube.com',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'md2', brand: 'Yamaha', vehicleModel: 'Exciter 155 VVA', category: 'Hệ Thống Điện & ECU', errorCode: 'C00',
    title: 'Quy Trình Cài Đặt Lại ECU & Mã Lỗi Exciter 155 VVA',
    symptoms: 'Đèn VVA không sáng, xe tua máy bị ngắt sớm ở 7000rpm',
    solutionSteps: [
      'Kết nối máy chẩn đoán Y-Connect / Fi diagnostic kit',
      'Xóa mã lỗi lịch sử trong bộ nhớ ECU',
      'Kiểm tra tín hiệu van biến thiên VVA solenoid',
    ],
    diagrams: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=600'],
    videoUrl: 'https://youtube.com',
    updatedAt: '2024-07-20T00:00:00Z',
  },
];
