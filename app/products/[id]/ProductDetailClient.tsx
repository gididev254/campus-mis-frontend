'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductImage from '@/components/ProductImage';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Eye,
  Calendar,
  MessageCircle,
  ShoppingCart,
  Star,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import { productsAPI } from '@/lib/api/products';
import type { Product } from '@/types';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { ProductDetailSkeleton } from '@/components/ui/skeleton';
import StructuredData from '@/components/StructuredData';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';

interface ProductDetailClientProps {
  productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      console.log('[ProductDetailClient] Fetching product:', { productId, userId: user?._id });
      try {
        const res = await productsAPI.getProduct(productId);
        console.log('[ProductDetailClient] Product fetched successfully:', { _id: res.data.product?._id, title: res.data.product?.title });

        if (!res.data.product) {
          console.error('[ProductDetailClient] Product data is null');
          router.push('/products');
          return;
        }

        setProduct(res.data.product);
        setLiked(res.data.product.likes?.includes(user?._id || '') || false);

        // Fetch related products (with error handling)
        try {
          const relatedRes = await productsAPI.getRelatedProducts(productId);
          setRelatedProducts(relatedRes.data.products?.filter(Boolean) || []);
        } catch (relatedError) {
          console.warn('[ProductDetailClient] Failed to fetch related products:', relatedError);
          setRelatedProducts([]);
        }
      } catch (error: any) {
        console.error('[ProductDetailClient] Failed to fetch product:', error);

        // Check if it's a 404 error
        if (error.response?.status === 404) {
          console.log('[ProductDetailClient] Product not found, redirecting');
          toast.error('Product not found');
          router.push('/products');
          return;
        }

        // For other errors, still show the error but don't redirect
        toast.error(error.response?.data?.message || 'Failed to load product');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user, router]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const res = await productsAPI.toggleLike(product!._id);
      setLiked(res.data.liked);
    } catch (error) {
      console.error('Failed to like product:', error);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/buyer/checkout?productId=${product?._id}&quantity=${quantity}`);
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!product?.seller?._id) {
      toast.error('Seller information not available');
      return;
    }
    router.push(`/messages?userId=${product.seller._id}&productId=${product._id}`);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product!._id);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error: unknown) {
      console.error('Failed to add to cart:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) return null;

  // Generate structured data
  const productSchema = product ? generateProductSchema({
    _id: product._id,
    title: product.title || 'Unknown Product',
    description: product.description || '',
    price: product.price || 0,
    images: product.images || [],
    condition: product.condition || 'good',
    category: product.category?.name || 'Uncategorized',
    location: product.location || '',
    seller: product.seller,
    createdAt: product.createdAt,
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product?.title || 'Product', url: `/products/${product?._id}` },
  ]);

  return (
    <>
      {productSchema && <StructuredData data={productSchema} />}
      <StructuredData data={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <ProductImage
                src={product.images?.[selectedImage]}
                alt={product.title || 'Product'}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.filter(Boolean).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0',
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    )}
                  >
                    <ProductImage
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title & price */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.isNegotiable && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    Negotiable
                  </span>
                )}
              </div>
            </div>

            {/* Seller info */}
            {product.seller && (
              <Link
                href={`/users/${product.seller._id}`}
                className="flex items-center space-x-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {product.seller.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{product.seller.name || 'Unknown Seller'}</div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.seller.averageRating || 'New'}</span>
                    {(product.seller.totalReviews || 0) > 0 && (
                      <span>({product.seller.totalReviews || 0} reviews)</span>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{product.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{product.likes?.length || 0} likes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(product.createdAt)}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>

            {/* Category & condition */}
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                {product.category?.name || 'Uncategorized'}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm capitalize">
                {product.condition.replace('-', ' ')}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{product.location}</span>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t">
              {/* Quantity selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border hover:bg-accent transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                <Button onClick={handleBuyNow} className="flex-1" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleLike}
                  variant={liked ? 'primary' : 'outline'}
                  size="lg"
                  className={cn(liked && 'bg-destructive hover:bg-destructive/90')}
                >
                  <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
                </Button>
                <Button
                  onClick={handleContact}
                  variant="outline"
                  size="lg"
                  disabled={!product?.seller?._id}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{formatPrice((product?.price || 0) * quantity)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.filter(Boolean).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
