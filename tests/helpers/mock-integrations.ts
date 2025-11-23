/**
 * Mock Integrations
 *
 * Mock implementations of external service integrations for testing
 */

/**
 * Mock Wati.io WhatsApp API
 */
export const mockWatiService = {
  sendWhatsAppMessage: jest.fn().mockResolvedValue({
    success: true,
    notificationId: 'mock-notif-123',
    attemptsMade: 1,
  }),

  sendOrderConfirmation: jest.fn().mockResolvedValue({
    success: true,
    notificationId: 'mock-notif-123',
    attemptsMade: 1,
  }),

  sendOrderStatusUpdate: jest.fn().mockResolvedValue({
    success: true,
    notificationId: 'mock-notif-124',
    attemptsMade: 1,
  }),

  testWatiConnection: jest.fn().mockResolvedValue({
    success: true,
    message: 'Connected to Wati.io API',
  }),

  getMessageTemplates: jest.fn().mockResolvedValue({
    success: true,
    templates: [
      'order_confirmation',
      'order_ready',
      'driver_dispatched',
      'driver_nearby',
      'order_delivered',
      'payment_reminder',
    ],
  }),
};

/**
 * Mock Pesapal Payment API
 */
export const mockPesapalService = {
  initiatePayment: jest.fn().mockResolvedValue({
    success: true,
    redirectUrl: 'https://pesapal.test/pay/mock-123',
    trackingId: 'mock-tracking-123',
    orderTrackingId: 'mock-order-tracking-123',
  }),

  verifyPayment: jest.fn().mockResolvedValue({
    success: true,
    status: 'COMPLETED',
    amount: 2100,
    currency: 'KES',
    reference: 'mock-ref-123',
  }),

  processRefund: jest.fn().mockResolvedValue({
    success: true,
    refundId: 'mock-refund-123',
    status: 'PENDING',
  }),
};

/**
 * Mock Google Maps API
 */
export const mockGoogleMapsService = {
  geocodeAddress: jest.fn().mockResolvedValue({
    success: true,
    coordinates: {
      lat: -1.2921,
      lng: 36.7872,
    },
    formattedAddress: 'Argwings Kodhek Road, Kilimani, Nairobi, Kenya',
  }),

  calculateRoute: jest.fn().mockResolvedValue({
    success: true,
    distance: 15000, // meters
    duration: 1800, // seconds
    polyline: 'mock_encoded_polyline_data',
  }),

  optimizeRoute: jest.fn().mockResolvedValue({
    success: true,
    optimizedOrder: [0, 2, 1, 3], // Optimized stop indices
    totalDistance: 15000,
    totalDuration: 1800,
    routes: [],
  }),

  validateAddress: jest.fn().mockResolvedValue({
    success: true,
    isValid: true,
    suggestions: [],
  }),
};

/**
 * Mock Email Service (Resend)
 */
export const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-email-123',
  }),

  sendOrderConfirmation: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-email-124',
  }),

  sendReceipt: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-email-125',
  }),
};

/**
 * Mock Firebase Services
 */
export const mockFirebaseAuth = {
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      emailVerified: true,
    },
  }),

  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'new-user-id',
      email: 'new@example.com',
      emailVerified: false,
    },
  }),

  signOut: jest.fn().mockResolvedValue(undefined),

  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),

  verifyPhoneNumber: jest.fn().mockResolvedValue({
    success: true,
    verificationId: 'mock-verification-id',
  }),
};

export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
};

/**
 * Mock Storage Service
 */
export const mockFirebaseStorage = {
  uploadFile: jest.fn().mockResolvedValue({
    success: true,
    url: 'https://storage.test/mock-file-url',
    path: 'uploads/mock-file.jpg',
  }),

  deleteFile: jest.fn().mockResolvedValue({
    success: true,
  }),

  getDownloadURL: jest.fn().mockResolvedValue('https://storage.test/mock-file-url'),
};

/**
 * Mock AI Service (OpenAI)
 */
export const mockOpenAIService = {
  estimateCompletionTime: jest.fn().mockResolvedValue({
    success: true,
    estimatedMinutes: 120,
    confidence: 0.85,
    factors: ['garment_type', 'current_workload', 'historical_data'],
  }),

  generateInsights: jest.fn().mockResolvedValue({
    success: true,
    insights: [
      {
        type: 'bottleneck',
        message: 'Ironing station is experiencing higher than average workload',
        recommendation: 'Consider assigning additional staff to ironing',
      },
    ],
  }),
};

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  Object.values(mockWatiService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockPesapalService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockGoogleMapsService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockEmailService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockFirebaseAuth).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockFirestore).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockFirebaseStorage).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockOpenAIService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
}

/**
 * Mock service failures (for testing error handling)
 */
export const mockServiceFailures = {
  watiFailure: () => {
    mockWatiService.sendWhatsAppMessage.mockRejectedValueOnce(
      new Error('Wati API unavailable')
    );
  },

  pesapalFailure: () => {
    mockPesapalService.initiatePayment.mockRejectedValueOnce(
      new Error('Pesapal API timeout')
    );
  },

  googleMapsFailure: () => {
    mockGoogleMapsService.calculateRoute.mockRejectedValueOnce(
      new Error('Google Maps API quota exceeded')
    );
  },

  firestoreFailure: () => {
    mockFirestore.addDoc.mockRejectedValueOnce(new Error('Firestore write failed'));
  },
};
