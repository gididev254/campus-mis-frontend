'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI } from '@/lib/api/products';
import { categoriesAPI } from '@/lib/api/categories';
import { uploadAPI } from '@/lib/api/upload';
import type { Category } from '@/types';
import { productSchema, type ProductFormData } from '@/lib/validations';
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

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
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
  const selectedCondition = watch('condition');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getCategories();
        setCategories(res.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories.');
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total limit
    if (images.length + files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    setUploading(true);

    try {
      // Upload to backend
      const response = await uploadAPI.uploadImages(Array.from(files));
      if (response.data.success) {
        const urls = response.data.data.map((item) => item.url);
        setImages([...images, ...urls]);
      }
    } catch (error: unknown) {
      console.error('Failed to upload images:', error);
        toast.error('Failed to upload images.');
      const err = error as { response?: { data?: { message?: string } } };
      setError('root', { type: 'manual', message: err.response?.data?.message || 'Failed to upload images' });
    } finally {
      setUploading(false);
    }
  }, [images, setError]);

  const removeImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }, [images]);

  const onSubmit = useCallback(async (data: ProductFormValues) => {
    // Validate images
    if (images.length === 0) {
      setError('root', { type: 'manual', message: 'At least one image is required' });
      return;
    }

    if (images.length > 5) {
      setError('root', { type: 'manual', message: 'Maximum 5 images allowed' });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('price', data.price);
      formDataToSend.append('category', data.category);
      formDataToSend.append('condition', data.condition);
      formDataToSend.append('location', data.location);
      formDataToSend.append('isNegotiable', (data.isNegotiable ?? false).toString());

      images.forEach((url) => {
        formDataToSend.append('images', url);
      });

      await productsAPI.createProduct(formDataToSend);
      toast.success('Product created successfully!');
      router.push('/seller');
    } catch (error: unknown) {
      console.error('Failed to create product:', error);
        toast.error('Failed to create product.');
      const err = error as { response?: { data?: { message?: string } } };
      setError('root', { type: 'manual', message: err.response?.data?.message || 'Failed to create product' });
    }
  }, [images, setError, router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/seller" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      {errors.root && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Product Images {images.length === 0 && <span className="text-destructive">*</span>}
          </label>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${images.length === 0 ? 'border-destructive/50' : ''}`}>
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
          {images.length === 0 && (
            <p className="mt-1 text-sm text-destructive">At least one image is required</p>
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
            Create Product
          </Button>
          <Link href="/seller">
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
