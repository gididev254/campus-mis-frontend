'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, Menu, X, Sun, Moon, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';
import Logo from './Logo';
import ConnectionStatus from './ConnectionStatus';

// Static navigation config - moved outside component to prevent recreation
const STATIC_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Categories', href: '/categories' },
] as const;

const Header = memo(function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Memoized dashboard link - only recalculates when roles change
  const dashboardLink = useMemo(() => {
    return isAdmin ? '/admin' : isSeller ? '/seller' : '/buyer';
  }, [isAdmin, isSeller]);

  // Stable toggle function with useCallback
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Stable close function with useCallback
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Stable logout handler with useCallback
  const handleLogout = useCallback(() => {
    logout();
    closeMobileMenu();
  }, [logout, closeMobileMenu]);

  // Memoize cart badge display to avoid re-renders
  const cartBadgeDisplay = useMemo(() => {
    if (cartCount > 0) {
      return (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-white flex items-center justify-center" aria-label={`${cartCount} items in cart`}>
          <span className="sr-only">{cartCount} items in cart</span>
          <span aria-hidden="true">{cartCount > 9 ? '9+' : cartCount}</span>
        </span>
      );
    }
    return null;
  }, [cartCount]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="Embuni Campus Market Home" className="focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <Logo width={45} height={45} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
            {STATIC_NAVIGATION.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary rounded-lg px-2 py-1 -mx-2',
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Connection status indicator */}
            <ConnectionStatus />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" aria-hidden="true" /> : <Sun className="h-5 w-5" aria-hidden="true" />}
            </button>

            {/* Search */}
            <Link
              href="/products"
              className="hidden sm:flex p-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Link>

            {isAuthenticated ? (
              <>
                {/* Dashboard */}
                <Link
                  href={dashboardLink}
                  className="hidden sm:flex p-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Go to dashboard"
                >
                  <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                </Link>

                {/* Cart */}
                <Link
                  href="/buyer/cart"
                  className="relative p-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={`Shopping cart ${cartCount > 0 ? `with ${cartCount} items` : ''}`}
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  {cartBadgeDisplay}
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* User menu */}
                <div className="relative group">
                  <button
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-expanded="false"
                    aria-haspopup="menu"
                    aria-label={`User menu for ${user?.name || 'Account'}`}
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                  </button>

                  {/* Dropdown */}
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-popover border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all focus-within:opacity-100 focus-within:visible"
                    role="menu"
                    aria-label="User menu"
                    tabIndex={-1}
                  >
                    <div className="py-1" role="none">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none rounded-lg mx-1"
                        role="menuitem"
                        tabIndex={0}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent focus:bg-accent text-destructive flex items-center space-x-2 rounded-lg mx-1 focus:outline-none"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden py-4 space-y-2 border-t"
            aria-label="Mobile navigation"
            role="navigation"
          >
            {STATIC_NAVIGATION.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={closeMobileMenu}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardLink}
                  className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={closeMobileMenu}
                  aria-label="Go to dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  href="/buyer/cart"
                  className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={closeMobileMenu}
                  aria-label={`Shopping cart ${cartCount > 0 ? `with ${cartCount} items` : ''}`}
                >
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Logout from your account"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
});

export default Header;
