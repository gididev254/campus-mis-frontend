'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI } from '@/lib/api/products';
import { categoriesAPI } from '@/lib/api/categories';
import { productSchema, type ProductFormData } from '@/lib/validations';
import type { Category, Product } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';

// Extend the schema for the form (images are handled separately)
const productFormSchema = productSchema
  .pick({
    title: true,
    description: true,
    price: true,
    category: true,
    condition: true,
    location: true,
  })
  .extend({
    isNegotiable: z.boolean().default(false),
  });

type ProductFormValues = {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  location: string;
  isNegotiable?: boolean;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    setValue,
    reset,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onBlur',
    defaultValues: {
      condition: 'good',
      location: user?.location || '',
      isNegotiable: false,
    },
  });

  const isNegotiable = watch('isNegotiable');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catsRes = await categoriesAPI.getCategories();
        setCategories(catsRes.data.categories);

        // Fetch product
        const prodRes = await productsAPI.getProduct(params.id as string);
        const p = prodRes.data.product;

        // Check ownership
        if (p.seller?._id !== user?._id && user?.role !== 'admin') {
          setError('You are not authorized to edit this product');
          setLoading(false);
          return;
        }

        setProduct(p);
        setImages(p.images || []);

        // Reset form with product data
        reset({
          title: p.title || '',
          description: p.description || '',
          price: p.price?.toString() || '',
          category: p.category?._id || '',
          condition: p.condition || 'good',
          location: p.location || '',
          isNegotiable: p.isNegotiable || false,
        });
      } catch (err: unknown) {
        console.error('Failed to fetch data:', err);
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [params.id, user, reset]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('image', file);

      try {
        // Upload to backend (which uploads to Cloudinary)
        const uploadRes = await fetch('http://localhost:5000/api/v1/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedUrls.push(uploadData.data.url);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        // Fallback to blob URL for demo
        const url = URL.createObjectURL(file);
        uploadedUrls.push(url);
      }
    }

    setImages([...images, ...uploadedUrls]);
    setUploading(false);
  }, [images]);

  const removeImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }, [images]);

  const onSubmit = useCallback(async (data: ProductFormValues) => {
    // Validate images
    if (images.length === 0) {
      setFormError('root', { type: 'manual', message: 'At least one image is required' });
      return;
    }

    if (images.length > 5) {
      setFormError('root', { type: 'manual', message: 'Maximum 5 images allowed' });
      return;
    }

    try {
      const updateData = new FormData();
      updateData.append('title', data.title);
      updateData.append('description', data.description);
      updateData.append('price', data.price);
      updateData.append('category', data.category);
      updateData.append('condition', data.condition);
      updateData.append('location', data.location);
      updateData.append('isNegotiable', (data.isNegotiable ?? false).toString());
      images.forEach((img) => updateData.append('images', img));

      await productsAPI.updateProduct(params.id as string, updateData);
      toast.success('Product updated successfully!');
      router.push(`/products/${params.id}`);
    } catch (err: unknown) {
      console.error('Failed to update product:', err);
        toast.error('Failed to update product.');
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to update product';
      setError(errorMessage);
      setFormError('root', { type: 'manual', message: errorMessage });
    }
  }, [images, params.id, router, setFormError]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive mb-6">
            {error}
          </div>
          <Link href="/seller/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/products/${params.id}`} className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Product</span>
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-3">Product Images</label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading || images.length >= 5}
            />
            <label htmlFor="images" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Uploading...' : 'Click to upload images (max 5)'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each</p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mt-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <Input
          label="Title"
          type="text"
          placeholder="e.g., iPhone 13 Pro - Excellent Condition"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            {...register('description')}
            placeholder="Describe your product in detail..."
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
              errors.description ? 'border-destructive focus:ring-destructive' : 'border-input'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Price (KES)"
              type="number"
              placeholder="5000"
              error={errors.price?.message}
              {...register('price')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              {...register('category')}
              className={`w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.category ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Condition & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <select
              {...register('condition')}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
            {errors.condition && (
              <p className="mt-1 text-sm text-destructive">{errors.condition.message}</p>
            )}
          </div>

          <Input
            label="Location"
            type="text"
            placeholder="e.g., Main Campus, Hostel A"
            error={errors.location?.message}
            {...register('location')}
          />
        </div>

        {/* Negotiable */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="negotiable"
            {...register('isNegotiable')}
            checked={isNegotiable}
            onChange={(e) => setValue('isNegotiable', e.target.checked)}
            className="w-4 h-4 rounded border-input"
          />
          <label htmlFor="negotiable" className="text-sm font-medium">
            Price is negotiable
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center space-x-4 pt-4">
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Save Changes
          </Button>
          <Link href={`/products/${params.id}`}>
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
