'use client';

import { LogOut, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * User information for the menu
 */
interface UserInfo {
  name: string;
  email: string;
  role?: string;
}

/**
 * Props for the UserMenu component
 */
interface UserMenuProps {
  /**
   * User information
   */
  user: UserInfo;
  /**
   * Sign out callback
   */
  onSignOut: () => void;
  /**
   * Optional profile click callback
   */
  onProfileClick?: () => void;
  /**
   * Optional settings click callback
   */
  onSettingsClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * UserMenu component - dropdown menu with user profile, settings, and sign out
 *
 * @example
 * ```tsx
 * <UserMenu
 *   user={{ name: 'John Doe', email: 'john@example.com', role: 'Admin' }}
 *   onSignOut={handleSignOut}
 *   onProfileClick={() => router.push('/profile')}
 * />
 * ```
 */
export function UserMenu({
  user,
  onSignOut,
  onProfileClick,
  onSettingsClick,
  className,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black',
          className
        )}
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8 border-2 border-gray-200">
          <AvatarFallback className="bg-black text-white text-sm">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-black">{user.name}</p>
          <p className="text-xs text-gray-600">{user.role || user.email}</p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-600 font-normal">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {onProfileClick && (
          <DropdownMenuItem onClick={onProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        )}

        {onSettingsClick && (
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
