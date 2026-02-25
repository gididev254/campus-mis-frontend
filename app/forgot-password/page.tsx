'use client';

import Link from 'next/link';
import { ArrowLeft, KeyRound, Phone, Shield, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <KeyRound className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-2">Forgot Your Password?</h1>
          <p className="text-muted-foreground">
            Don't worry, we can help you reset it
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Contact Admin</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact our administrator via WhatsApp or email to request a password reset.
                    The admin will generate a new temporary password for you.
                  </p>
                  <div className="text-sm font-medium">
                    <p>WhatsApp: <a href="https://wa.me/254111938368" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">0111938368</a></p>
                    <p>Email: <a href="mailto:gedionmutua2024@gmail.com" className="text-primary hover:underline">gedionmutua2024@gmail.com</a></p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Secure Process</h3>
                  <p className="text-sm text-muted-foreground">
                    For your security, password resets are handled manually by administrators.
                    This prevents unauthorized access to your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Lock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Change After Login</h3>
                  <p className="text-sm text-muted-foreground">
                    After receiving your temporary password, log in and change it immediately
                    to something you can remember.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Remember your password?
                </p>
                <Link href="/login">
                  <Button className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
