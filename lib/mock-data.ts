// Mock data for development without database

export const mockCategories = [
  {
    id: '1',
    name: 'iPhone',
    slug: 'iphone',
    image: '/img/16black.jpg.webp',
  },
  {
    id: '2', 
    name: 'MacBook',
    slug: 'macbook',
    image: '/img/16blue.jpg.webp',
  },
  {
    id: '3',
    name: 'iPad',
    slug: 'ipad', 
    image: '/img/16green.jpg.webp',
  },
  {
    id: '4',
    name: 'AirPods',
    slug: 'airpods',
    image: '/img/16pink.jpg.webp',
  },
  {
    id: '5',
    name: 'Apple Watch',
    slug: 'apple-watch',
    image: '/img/16white.jpg.webp',
  },
  {
    id: '6',
    name: 'Аксессуары',
    slug: 'accessories',
    image: '/img/aaf891bb9bd2e85d9f42c857050d91c87a1cc49830176911f7c6c261e6294098.jpg.webp',
  },
]

export const mockProducts = [
  {
    id: '1',
    name: 'iPhone 17 Pro Max',
    slug: 'iphone-17-pro-max',
    price: 149990,
    oldPrice: 159990,
    images: [
      { url: '/img/16black.jpg.webp', alt: 'iPhone 17 Pro Max' },
      { url: '/img/16blue.jpg.webp', alt: 'iPhone 17 Pro Max Blue' },
    ],
    variants: [
      { id: '1', color: 'Черный', colorCode: '#000000', memory: '256GB', stock: 10 },
      { id: '2', color: 'Синий', colorCode: '#0066CC', memory: '512GB', stock: 5 },
    ],
    isNew: true,
    isHit: true,
    isFeatured: true,
    stock: 15,
  },
  {
    id: '2',
    name: 'iPhone 17 Pro',
    slug: 'iphone-17-pro',
    price: 129990,
    oldPrice: 139990,
    images: [
      { url: '/img/16green.jpg.webp', alt: 'iPhone 17 Pro' },
      { url: '/img/16pink.jpg.webp', alt: 'iPhone 17 Pro Pink' },
    ],
    variants: [
      { id: '3', color: 'Зеленый', colorCode: '#00AA00', memory: '256GB', stock: 8 },
      { id: '4', color: 'Розовый', colorCode: '#FF69B4', memory: '512GB', stock: 3 },
    ],
    isNew: true,
    isHit: false,
    isFeatured: true,
    stock: 11,
  },
  {
    id: '3',
    name: 'iPhone 17',
    slug: 'iphone-17',
    price: 99990,
    oldPrice: null,
    images: [
      { url: '/img/16white.jpg.webp', alt: 'iPhone 17' },
    ],
    variants: [
      { id: '5', color: 'Белый', colorCode: '#FFFFFF', memory: '128GB', stock: 12 },
    ],
    isNew: true,
    isHit: false,
    isFeatured: false,
    stock: 12,
  },
  {
    id: '4',
    name: 'iPhone 16 Pro Max',
    slug: 'iphone-16-pro-max',
    price: 119990,
    oldPrice: 129990,
    images: [
      { url: '/img/1c011e50364ca06348e7158c1c9075a3a580dcfc8054cf47cf76558f20c344c6.jpg.webp', alt: 'iPhone 16 Pro Max' },
    ],
    variants: [
      { id: '6', color: 'Титановый', colorCode: '#C0C0C0', memory: '256GB', stock: 6 },
    ],
    isNew: false,
    isHit: true,
    isFeatured: true,
    stock: 6,
  },
]

export const mockBanners = [
  {
    id: '1',
    title: 'iPhone 17 Pro Max',
    subtitle: 'Новое поколение',
    imageDesktop: '/img/16black.jpg.webp',
    imageMobile: '/img/16black.jpg.webp',
    link: '/product/iphone-17-pro-max',
    buttonText: 'Купить сейчас',
  },
]

export const mockReviews = [
  {
    id: '1',
    authorName: 'Алексей М.',
    rating: 5,
    title: 'Отличный телефон!',
    text: 'Очень доволен покупкой. Камера супер, батарея держит долго.',
    images: [],
    product: { name: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max' },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    authorName: 'Мария К.',
    rating: 4,
    title: 'Хороший выбор',
    text: 'Качество на высоте, доставка быстрая. Рекомендую!',
    images: [],
    product: { name: 'iPhone 17 Pro', slug: 'iphone-17-pro' },
    createdAt: new Date().toISOString(),
  },
]