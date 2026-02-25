import { Metadata } from 'next';
import ProfilePageClient from './ProfilePageClient';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'My Profile',
  description: 'Manage your profile settings, personal information, and preferences on Embuni Campus Market',
  keywords: ['profile', 'account settings', 'user profile', 'campus market'],
  canonical: '/profile',
  noIndex: true, // Don't index user profile pages
});

export default function ProfilePage() {
  return <ProfilePageClient />;
}
import { useRouter } from 'next/navigation';
import { Loader2, User as UserIcon, Mail, Phone, MapPin, Edit2, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { profileUpdateSchema, passwordChangeSchema, type ProfileUpdateFormData, type PasswordChangeFormData } from '@/lib/validations';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/Toaster';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile update form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    setError: setProfileError,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onBlur',
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    setError: setPasswordError,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onBlur',
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user, resetProfile]);

  const onProfileUpdate = useCallback(async (data: ProfileUpdateFormData) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await authAPI.updateProfile(data);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
      setSuccessMessage('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error
        ? (error as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update profile'
        : 'Failed to update profile';
      setErrorMessage(message);
      toast.error(message);
      setProfileError('root', { type: 'manual', message });
    }
  }, [authAPI, updateUser, setProfileError]);

  const onPasswordChange = useCallback(async (data: PasswordChangeFormData) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      setSuccessMessage('Password changed successfully!');
      setShowPasswordForm(false);
      resetPassword();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error
        ? (error as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to change password'
        : 'Failed to change password';
      setErrorMessage(message);
      toast.error(message);
      setPasswordError('root', { type: 'manual', message });
    }
  }, [authAPI, resetPassword, setPasswordError]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
    setErrorMessage('');
  }, [user, resetProfile]);

  const handleCancelPassword = useCallback(() => {
    setShowPasswordForm(false);
    resetPassword();
    setErrorMessage('');
  }, [resetPassword]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ProfileSkeleton showAvatar showStats={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
        </div>

        {/* Profile Information */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                aria-label="Edit profile"
                className="p-2"
              >
                <Edit2 className="h-5 w-5" />
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4" noValidate>
              {profileErrors.root && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {profileErrors.root.message}
                </div>
              )}

              <Input
                id="name"
                label="Name"
                type="text"
                error={profileErrors.name?.message}
                {...registerProfile('name')}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
                className="opacity-50"
              />
              <p className="text-xs text-muted-foreground -mt-3">Email cannot be changed</p>
              <Input
                id="phone"
                label="Phone"
                type="tel"
                error={profileErrors.phone?.message}
                {...registerProfile('phone')}
              />
              <Input
                id="location"
                label="Location"
                type="text"
                error={profileErrors.location?.message}
                {...registerProfile('location')}
              />
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  isLoading={isSubmittingProfile}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{user?.location || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          {!showPasswordForm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4" noValidate>
              {passwordErrors.root && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {passwordErrors.root.message}
                </div>
              )}

              <Input
                id="current-password"
                label="Current Password"
                type="password"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />
              <Input
                id="new-password"
                label="New Password"
                type="password"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <Input
                id="confirm-password"
                label="Confirm New Password"
                type="password"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              {/* Password Match Indicator */}
              {confirmPassword && newPassword && (
                <div className={`text-xs ${newPassword === confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  isLoading={isSubmittingPassword}
                  className="flex-1"
                >
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelPassword}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
