'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, FolderOpen, Plus, Edit, Trash2, Check, X, Package, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesAPI } from '@/lib/api/categories';
import { categorySchema, type CategoryFormData } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { TableSkeleton, PageHeaderSkeleton } from '@/components/ui/skeleton';
import type { Category } from '@/types';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { toast } from '@/components/ui/Toaster';

interface CategoriesResponse {
  success: boolean;
  categories: (Category & { productCount: number })[];
}

export default function AdminCategories() {
  return (
    <ClientErrorBoundary>
      <AdminCategoriesContent />
    </ClientErrorBoundary>
  );
}

function AdminCategoriesContent() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<(Category & { productCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<(Category & { productCount: number }) | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    mode: 'onBlur',
    defaultValues: {
      isActive: true,
    } as Partial<CategoryFormData>,
  });

  useEffect(() => {
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Access denied. Admin only.' });
      setLoading(false);
      return;
    }

    fetchCategories();
  }, [isAdmin]);

  const fetchCategories = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const response = await categoriesAPI.getCategories();
      const data = response.data as CategoriesResponse;

      let filteredCategories = data.categories;

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredCategories = filteredCategories.filter(
          c =>
            c.name.toLowerCase().includes(term) ||
            (c.description && c.description.toLowerCase().includes(term))
        );
      }

      setCategories(filteredCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories. Please try again.');
      setMessage({ type: 'error', text: 'Failed to load categories. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchCategories]);

  const openCreateModal = () => {
    reset({
      name: '',
      description: '',
      icon: '',
      image: '',
      isActive: true,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (category: Category & { productCount: number }) => {
    setSelectedCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      isActive: category.isActive,
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCategory(null);
    reset({
      name: '',
      description: '',
      icon: '',
      image: '',
      isActive: true,
    });
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setSubmitting(true);

      if (showEditModal && selectedCategory) {
        // Update existing category
        await categoriesAPI.updateCategory(selectedCategory._id, {
          name: data.name,
          description: data.description || undefined,
          icon: data.icon || undefined,
          image: data.image || undefined,
          isActive: data.isActive,
        });

        setCategories(
          categories.map(c =>
            c._id === selectedCategory._id
              ? { ...c, ...data, productCount: c.productCount }
              : c
          )
        );
        setMessage({ type: 'success', text: 'Category updated successfully' });
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const response = await categoriesAPI.createCategory({
          name: data.name,
          description: data.description || undefined,
          icon: data.icon || undefined,
          image: data.image || undefined,
        });

        const newCategory = { ...response.data.category, productCount: 0 };
        setCategories([...categories, newCategory]);
        setMessage({ type: 'success', text: 'Category created successfully' });
        toast.success('Category created successfully');
      }

      closeModals();
    } catch (error) {
      console.error('Failed to save category:', error);
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save category'
        : 'Failed to save category';
      setMessage({ type: 'error', text: errorMessage });
      setError('root', { type: 'manual', message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);

    if (category && category.productCount > 0) {
      const errorMessage = `Cannot delete category with ${category.productCount} products. Please reassign products first.`;
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
      return;
    }

    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingCategory(categoryId);
      await categoriesAPI.deleteCategory(categoryId);

      setCategories(categories.filter(c => c._id !== categoryId));
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      const errorMessage = 'Failed to delete category. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setDeletingCategory(null);
    }
  };

  const toggleCategoryStatus = async (category: Category & { productCount: number }) => {
    try {
      await categoriesAPI.updateCategory(category._id, {
        isActive: !category.isActive,
      });

      setCategories(
        categories.map(c =>
          c._id === category._id ? { ...c, isActive: !c.isActive } : c
        )
      );
      setMessage({
        type: 'success',
        text: `Category ${category.isActive ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      toast.error('Failed to update category status. Please try again.');
      setMessage({ type: 'error', text: 'Failed to update category status. Please try again.' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-8">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeaderSkeleton showSubtitle showActions={true} />
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  const activeCategories = categories.filter(c => c.isActive).length;
  const inactiveCategories = categories.filter(c => !c.isActive).length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">Manage product categories</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200'
              : 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-4 hover:opacity-70">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <X className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search terms.'
                    : 'Get started by creating your first category.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          categories.map(category => (
            <Card key={category._id} className={!category.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {category.icon ? (
                      <div className="text-3xl">{category.icon}</div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Products:</span>
                    <span className="font-medium">{category.productCount || 0}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="font-mono text-xs">{category.slug}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Button
                      onClick={() => toggleCategoryStatus(category)}
                      disabled={deletingCategory === category._id}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      {category.isActive ? (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => openEditModal(category)}
                      disabled={deletingCategory === category._id}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCategory(category._id)}
                      disabled={deletingCategory === category._id || (category.productCount || 0) > 0}
                      size="sm"
                      variant="danger"
                    >
                      {deletingCategory === category._id ? (
                        '...'
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {showEditModal ? 'Edit Category' : 'Create New Category'}
            </h2>

            {errors.root && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {errors.root.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Name"
                type="text"
                placeholder="e.g., Electronics"
                error={errors.name?.message}
                {...register('name')}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Brief description of the category..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                    errors.description ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <Input
                label="Icon (Emoji)"
                type="text"
                placeholder="e.g., 💻"
                error={errors.icon?.message}
                {...register('icon')}
              />

              <Input
                label="Image URL"
                type="url"
                placeholder="https://example.com/image.jpg"
                error={errors.image?.message}
                {...register('image')}
              />

              {showEditModal && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (visible to users)
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={closeModals}
                  variant="outline"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {submitting ? 'Saving...' : showEditModal ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
