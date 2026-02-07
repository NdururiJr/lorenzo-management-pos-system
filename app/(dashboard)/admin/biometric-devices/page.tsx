/**
 * Biometric Devices Admin Page
 *
 * Manage biometric devices across all branches.
 * View device status, add/remove devices, configure webhooks,
 * enroll employees, and view attendance event logs.
 *
 * @module app/(dashboard)/admin/biometric-devices/page
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Fingerprint,
  Plus,
  Trash2,
  Settings,
  Activity,
  Wifi,
  WifiOff,
  Building2,
  Server,
  Copy,
  Loader2,
  RefreshCw,
  UserPlus,
  History,
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon,
  Download,
  Upload,
  Search,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BiometricDevice, BiometricVendor, BiometricDeviceType, Branch, User } from '@/lib/db/schema';

// Types for biometric events
interface BiometricEvent {
  eventId: string;
  deviceId: string;
  employeeId: string;
  employeeName?: string;
  eventType: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

// Types for employee enrollment
interface EmployeeEnrollment {
  id: string;
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;
  enrolledDevices: string[];
  enrolledAt: Date;
  status: 'enrolled' | 'pending' | 'failed';
}

const VENDOR_OPTIONS: { value: BiometricVendor; label: string }[] = [
  { value: 'zkteco', label: 'ZKTeco' },
  { value: 'suprema', label: 'Suprema' },
  { value: 'hikvision', label: 'Hikvision' },
  { value: 'generic', label: 'Generic/Other' },
];

const DEVICE_TYPE_OPTIONS: { value: BiometricDeviceType; label: string }[] = [
  { value: 'fingerprint', label: 'Fingerprint Scanner' },
  { value: 'facial', label: 'Face Recognition' },
  { value: 'rfid', label: 'RFID Card Reader' },
  { value: 'multi', label: 'Multi-Modal (Multiple)' },
];

export default function BiometricDevicesPage() {
  const [activeTab, setActiveTab] = useState<'devices' | 'enrollment' | 'events'>('devices');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<BiometricDevice | null>(null);
  const [deleteDevice, setDeleteDevice] = useState<BiometricDevice | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDeviceForEnroll, setSelectedDeviceForEnroll] = useState<string>('');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<'all' | 'clock_in' | 'clock_out'>('all');
  const queryClient = useQueryClient();

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    name: '',
    vendor: 'zkteco' as BiometricVendor,
    deviceType: 'fingerprint' as BiometricDeviceType,
    branchId: '',
    serialNumber: '',
    ipAddress: '',
    location: '',
  });

  // Fetch all devices
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['biometric-devices'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'biometricDevices'));
      return snapshot.docs.map((doc) => doc.data() as BiometricDevice);
    },
  });

  // Fetch branches for selection
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'branches'));
      return snapshot.docs.map((doc) => doc.data() as Branch);
    },
  });

  // Fetch staff for enrollment
  const { data: staff } = useQuery({
    queryKey: ['staff-for-biometric'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs
        .map((doc) => doc.data() as User)
        .filter((u) => u.role !== 'customer' && u.active);
    },
  });

  // Fetch biometric events
  const { data: biometricEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['biometric-events'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'biometricEvents'));
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          eventId: doc.id,
          deviceId: data.deviceId,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          eventType: data.eventType,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          status: data.status || 'success',
          errorMessage: data.errorMessage,
        } as BiometricEvent;
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
  });

  // Fetch employee enrollments
  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useQuery({
    queryKey: ['biometric-enrollments'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'biometricEnrollments'));
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          branchId: data.branchId,
          branchName: data.branchName,
          enrolledDevices: data.enrolledDevices || [],
          enrolledAt: data.enrolledAt?.toDate ? data.enrolledAt.toDate() : new Date(data.enrolledAt),
          status: data.status || 'enrolled',
        } as EmployeeEnrollment;
      });
    },
  });

  // Add device mutation
  const addDeviceMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const deviceId = `DEV-${Date.now()}`;
      const device: BiometricDevice = {
        deviceId,
        name: data.name,
        vendor: data.vendor,
        deviceType: data.deviceType,
        branchId: data.branchId,
        serialNumber: data.serialNumber || '',
        ipAddress: data.ipAddress || '',
        location: data.location || '',
        active: true,
        lastSync: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'admin',
      };
      await setDoc(doc(db, 'biometricDevices', deviceId), device);
      return device;
    },
    onSuccess: () => {
      toast.success('Device added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add device');
    },
  });

  // Update device mutation
  const updateDeviceMutation = useMutation({
    mutationFn: async ({ deviceId, updates }: { deviceId: string; updates: Partial<BiometricDevice> }) => {
      await updateDoc(doc(db, 'biometricDevices', deviceId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      toast.success('Device updated successfully');
      setEditDevice(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update device');
    },
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await deleteDoc(doc(db, 'biometricDevices', deviceId));
    },
    onSuccess: () => {
      toast.success('Device deleted successfully');
      setDeleteDevice(null);
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete device');
    },
  });

  // Toggle device active state
  const toggleDeviceMutation = useMutation({
    mutationFn: async ({ deviceId, active }: { deviceId: string; active: boolean }) => {
      await updateDoc(doc(db, 'biometricDevices', deviceId), {
        active,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] });
    },
  });

  // Enroll employee mutation
  const enrollEmployeeMutation = useMutation({
    mutationFn: async ({ userId, deviceId }: { userId: string; deviceId: string }) => {
      const user = staff?.find((s) => s.uid === userId);
      const device = devices?.find((d) => d.deviceId === deviceId);
      const branch = branches?.find((b) => b.branchId === device?.branchId);

      if (!user || !device) throw new Error('Invalid user or device');

      const enrollmentId = `ENR-${Date.now()}`;
      await setDoc(doc(db, 'biometricEnrollments', enrollmentId), {
        userId,
        userName: user.name,
        branchId: device.branchId,
        branchName: branch?.name || device.branchId,
        enrolledDevices: [deviceId],
        enrolledAt: Timestamp.now(),
        status: 'pending',
      });
      return enrollmentId;
    },
    onSuccess: () => {
      toast.success('Employee enrollment initiated');
      setIsEnrollDialogOpen(false);
      setSelectedEmployee('');
      setSelectedDeviceForEnroll('');
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollments'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll employee');
    },
  });

  // Manual sync mutation
  const syncDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      // In production, this would call the biometric service to sync
      // For now, we'll simulate by updating lastSync timestamp
      await updateDoc(doc(db, 'biometricDevices', deviceId), {
        lastSync: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      toast.success('Device sync initiated');
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] });
    },
    onError: () => {
      toast.error('Failed to sync device');
    },
  });

  // Remove enrollment mutation
  const removeEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      await deleteDoc(doc(db, 'biometricEnrollments', enrollmentId));
    },
    onSuccess: () => {
      toast.success('Enrollment removed');
      queryClient.invalidateQueries({ queryKey: ['biometric-enrollments'] });
    },
    onError: () => {
      toast.error('Failed to remove enrollment');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      vendor: 'zkteco',
      deviceType: 'fingerprint',
      branchId: '',
      serialNumber: '',
      ipAddress: '',
      location: '',
    });
  };

  const openEditDialog = (device: BiometricDevice) => {
    setFormData({
      name: device.name,
      vendor: device.vendor,
      deviceType: device.deviceType,
      branchId: device.branchId,
      serialNumber: device.serialNumber || '',
      ipAddress: device.ipAddress || '',
      location: device.location || '',
    });
    setEditDevice(device);
  };

  const handleSubmit = () => {
    if (editDevice) {
      updateDeviceMutation.mutate({
        deviceId: editDevice.deviceId,
        updates: formData,
      });
    } else {
      addDeviceMutation.mutate(formData);
    }
  };

  // Get branch name by ID
  const getBranchName = (branchId: string) => {
    return branches?.find((b) => b.branchId === branchId)?.name || branchId;
  };

  // Check if device is online (heartbeat within last 5 minutes)
  const isDeviceOnline = (device: BiometricDevice) => {
    if (!device.lastHeartbeat) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastHeartbeat = device.lastHeartbeat as any;
    const heartbeat = lastHeartbeat?.toDate ? lastHeartbeat.toDate() : new Date(lastHeartbeat);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return heartbeat > fiveMinutesAgo;
  };

  // Copy webhook URL
  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhooks/biometric`;
    navigator.clipboard.writeText(url);
    toast.success('Webhook URL copied to clipboard');
  };

  // Stats
  const totalDevices = devices?.length || 0;
  const onlineDevices = devices?.filter(isDeviceOnline).length || 0;
  const totalEnrolled = enrollments?.length || 0;
  const todayEvents = biometricEvents?.filter(
    (e) => e.timestamp.toDateString() === new Date().toDateString()
  ).length || 0;

  // Filter events
  const filteredEvents = biometricEvents?.filter((event) => {
    const matchesSearch = !eventSearchTerm ||
      event.employeeName?.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
      event.employeeId.toLowerCase().includes(eventSearchTerm.toLowerCase());
    const matchesFilter = eventFilter === 'all' || event.eventType === eventFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Biometric Devices</h1>
          <p className="text-gray-600">Manage attendance tracking devices, enrollments, and events</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'devices' && (
            <>
              <Button variant="outline" onClick={() => refetchDevices()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Biometric Device</DialogTitle>
                    <DialogDescription>
                      Register a new biometric device for attendance tracking.
                    </DialogDescription>
                  </DialogHeader>
                  <DeviceForm
                    formData={formData}
                    setFormData={setFormData}
                    branches={branches || []}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={addDeviceMutation.isPending || !formData.name || !formData.branchId}
                    >
                      {addDeviceMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Add Device
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {activeTab === 'enrollment' && (
            <>
              <Button variant="outline" onClick={() => refetchEnrollments()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enroll Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enroll Employee</DialogTitle>
                    <DialogDescription>
                      Register an employee's biometric data on a device.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Employee</Label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff?.map((s) => (
                            <SelectItem key={s.uid} value={s.uid}>
                              {s.name} - {s.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Select Device</Label>
                      <Select value={selectedDeviceForEnroll} onValueChange={setSelectedDeviceForEnroll}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a device" />
                        </SelectTrigger>
                        <SelectContent>
                          {devices?.filter((d) => d.active).map((d) => (
                            <SelectItem key={d.deviceId} value={d.deviceId}>
                              {d.name} ({getBranchName(d.branchId)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => enrollEmployeeMutation.mutate({
                        userId: selectedEmployee,
                        deviceId: selectedDeviceForEnroll,
                      })}
                      disabled={enrollEmployeeMutation.isPending || !selectedEmployee || !selectedDeviceForEnroll}
                    >
                      {enrollEmployeeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Start Enrollment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {activeTab === 'events' && (
            <Button variant="outline" onClick={() => refetchEvents()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDevices}</p>
                <p className="text-sm text-gray-500">Total Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onlineDevices}</p>
                <p className="text-sm text-gray-500">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEnrolled}</p>
                <p className="text-sm text-gray-500">Enrolled Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayEvents}</p>
                <p className="text-sm text-gray-500">Events Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(devices?.map((d) => d.branchId)).size || 0}
                </p>
                <p className="text-sm text-gray-500">Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="enrollment" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Event Log
          </TabsTrigger>
        </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure your biometric devices to send events to this URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm truncate">
              {typeof window !== 'undefined' && `${window.location.origin}/api/webhooks/biometric`}
            </div>
            <Button variant="outline" onClick={copyWebhookUrl}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Most devices can be configured to POST attendance events to this URL.
            Refer to your device vendor's documentation for setup instructions.
          </p>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {devicesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : devices && devices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
                  const online = isDeviceOnline(device);
                  return (
                    <TableRow key={device.deviceId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {online ? (
                            <Wifi className="w-4 h-4 text-green-500" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-gray-400" />
                          )}
                          <Badge variant={online ? 'default' : 'secondary'} className={cn(
                            online ? 'bg-green-100 text-green-800' : ''
                          )}>
                            {online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{device.deviceId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{device.deviceType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getBranchName(device.branchId)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {device.ipAddress || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {device.lastHeartbeat ? (
                          <span className="text-sm text-gray-600">
                            {formatDistanceToNow(
                              device.lastHeartbeat && typeof (device.lastHeartbeat as Timestamp).toDate === 'function'
                                ? (device.lastHeartbeat as Timestamp).toDate()
                                : new Date(device.lastHeartbeat as unknown as string | number),
                              { addSuffix: true }
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={device.active}
                          onCheckedChange={(checked) =>
                            toggleDeviceMutation.mutate({
                              deviceId: device.deviceId,
                              active: checked,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => syncDeviceMutation.mutate(device.deviceId)}
                            disabled={syncDeviceMutation.isPending}
                            title="Sync device"
                          >
                            <RefreshCw className={cn(
                              "w-4 h-4",
                              syncDeviceMutation.isPending && "animate-spin"
                            )} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(device)}
                            title="Edit device"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <AlertDialog
                            open={deleteDevice?.deviceId === device.deviceId}
                            onOpenChange={(open) => !open && setDeleteDevice(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setDeleteDevice(device)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Device?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{device.name}".
                                  Historical attendance data will be preserved.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => deleteDeviceMutation.mutate(device.deviceId)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Fingerprint className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No Devices Registered</p>
              <p className="text-sm mt-1">Add a biometric device to start tracking attendance.</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Enrollments</CardTitle>
              <CardDescription>
                Staff members enrolled for biometric attendance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : enrollments && enrollments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Devices</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{enrollment.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.branchName}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {enrollment.enrolledDevices.map((deviceId) => (
                              <Badge key={deviceId} variant="outline" className="text-xs">
                                {devices?.find((d) => d.deviceId === deviceId)?.name || deviceId}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {format(enrollment.enrolledAt, 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={enrollment.status === 'enrolled' ? 'default' : 'secondary'}
                            className={cn(
                              enrollment.status === 'enrolled' && 'bg-green-100 text-green-800',
                              enrollment.status === 'pending' && 'bg-amber-100 text-amber-800',
                              enrollment.status === 'failed' && 'bg-red-100 text-red-800'
                            )}
                          >
                            {enrollment.status === 'enrolled' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {enrollment.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {enrollment.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Enrollment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {enrollment.userName}'s biometric enrollment.
                                  They will need to re-enroll to use biometric attendance.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => removeEnrollmentMutation.mutate(enrollment.id)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No Enrollments Yet</p>
                  <p className="text-sm mt-1">Enroll employees to enable biometric attendance tracking.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                Enrollment Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Click "Enroll Employee" and select an employee and device</li>
                <li>Go to the physical biometric device at the selected location</li>
                <li>Have the employee scan their fingerprint/face on the device</li>
                <li>The enrollment status will update automatically once captured</li>
                <li>Repeat for additional devices if needed</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by employee name or ID..."
                value={eventSearchTerm}
                onChange={(e) => setEventSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as typeof eventFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="clock_in">Clock In</SelectItem>
                <SelectItem value="clock_out">Clock Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Event Log</CardTitle>
              <CardDescription>
                Real-time log of biometric attendance events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredEvents && filteredEvents.length > 0 ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.eventId}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        event.status === 'success' && 'bg-white',
                        event.status === 'failed' && 'bg-red-50 border-red-200',
                        event.status === 'pending' && 'bg-amber-50 border-amber-200'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'p-2 rounded-lg',
                          event.eventType === 'clock_in' && 'bg-green-100',
                          event.eventType === 'clock_out' && 'bg-blue-100',
                          event.eventType === 'break_start' && 'bg-amber-100',
                          event.eventType === 'break_end' && 'bg-purple-100'
                        )}>
                          {event.eventType === 'clock_in' && <Download className="w-4 h-4 text-green-600" />}
                          {event.eventType === 'clock_out' && <Upload className="w-4 h-4 text-blue-600" />}
                          {event.eventType === 'break_start' && <Clock className="w-4 h-4 text-amber-600" />}
                          {event.eventType === 'break_end' && <Clock className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {event.employeeName || event.employeeId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.eventType.replace('_', ' ')} • {devices?.find((d) => d.deviceId === event.deviceId)?.name || event.deviceId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(event.timestamp, 'h:mm a')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(event.timestamp, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No Events Recorded</p>
                  <p className="text-sm mt-1">
                    {eventSearchTerm || eventFilter !== 'all'
                      ? 'No events match your search criteria.'
                      : 'Attendance events will appear here when staff use biometric devices.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editDevice} onOpenChange={(open) => !open && setEditDevice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Update the device configuration.
            </DialogDescription>
          </DialogHeader>
          <DeviceForm
            formData={formData}
            setFormData={setFormData}
            branches={branches || []}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDevice(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateDeviceMutation.isPending || !formData.name || !formData.branchId}
            >
              {updateDeviceMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Device Form Component
interface DeviceFormProps {
  formData: {
    name: string;
    vendor: BiometricVendor;
    deviceType: BiometricDeviceType;
    branchId: string;
    serialNumber: string;
    ipAddress: string;
    location: string;
  };
  setFormData: (data: DeviceFormProps['formData']) => void;
  branches: Branch[];
}

function DeviceForm({ formData, setFormData, branches }: DeviceFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Device Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Main Entrance Scanner"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch">Branch *</Label>
          <Select
            value={formData.branchId}
            onValueChange={(v) => setFormData({ ...formData, branchId: v })}
          >
            <SelectTrigger id="branch">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.branchId} value={branch.branchId}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Select
            value={formData.vendor}
            onValueChange={(v) => setFormData({ ...formData, vendor: v as BiometricVendor })}
          >
            <SelectTrigger id="vendor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENDOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deviceType">Device Type</Label>
          <Select
            value={formData.deviceType}
            onValueChange={(v) => setFormData({ ...formData, deviceType: v as BiometricDeviceType })}
          >
            <SelectTrigger id="deviceType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEVICE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            placeholder="Optional"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ipAddress">IP Address</Label>
          <Input
            id="ipAddress"
            placeholder="e.g., 192.168.1.100"
            value={formData.ipAddress}
            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Physical Location</Label>
        <Input
          id="location"
          placeholder="e.g., Front door, Staff entrance"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>
    </div>
  );
}
