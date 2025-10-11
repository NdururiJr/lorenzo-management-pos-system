/**
 * Development Setup Page
 *
 * One-time setup page to create a development user in Firebase.
 * Only accessible in development mode.
 *
 * @module app/(auth)/setup-dev/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAuthInstance } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export default function SetupDevPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    router.push('/login');
    return null;
  }

  const devEmail = process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL || 'dev@lorenzo.com';
  const devPassword = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD || 'DevPass123!';

  const createDevUser = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const auth = getAuthInstance();
      const db = getFirestore();

      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        devEmail,
        devPassword
      );

      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: devEmail,
        name: 'Dev Admin',
        role: 'admin',
        branchId: 'main-branch',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setSuccess(true);
      toast.success('Dev user created successfully! 🎉');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error creating dev user:', err);

      let errorMessage = 'Failed to create dev user';
      const error = err as { code?: string; message?: string };

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Dev user already exists! You can use the Dev Quick Login button.';
        // Redirect to login after showing error
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please update NEXT_PUBLIC_DEV_LOGIN_PASSWORD';
      } else {
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">
            Development Setup
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create a development user for quick testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-sm text-gray-700">
              <strong className="text-black">One-time setup:</strong> Click the button below to create a development user.
              After creation, you can use the &quot;Dev Quick Login&quot; button on the login page.
            </AlertDescription>
          </Alert>

          {/* Dev Credentials */}
          <div className="space-y-2 p-4 bg-gray-100 rounded-md border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Dev Credentials
            </p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium text-black">Email:</span>{' '}
                <code className="text-xs bg-white px-2 py-1 rounded">{devEmail}</code>
              </p>
              <p className="text-sm">
                <span className="font-medium text-black">Password:</span>{' '}
                <code className="text-xs bg-white px-2 py-1 rounded">{devPassword}</code>
              </p>
              <p className="text-sm">
                <span className="font-medium text-black">Role:</span>{' '}
                <code className="text-xs bg-white px-2 py-1 rounded">admin</code>
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-800">
                <strong>Success!</strong> Dev user created. Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={createDevUser}
              disabled={isCreating || success}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Dev User...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  User Created!
                </>
              ) : (
                'Create Dev User'
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              disabled={isCreating}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              Go to Login
            </Button>
          </div>

          {/* Warning */}
          <Alert variant="destructive" className="border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-xs text-yellow-800">
              <strong className="text-yellow-900">⚠️ Development Only:</strong> This page is only accessible in development mode.
              Never use these credentials in production.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
