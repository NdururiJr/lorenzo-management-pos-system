import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Lorenzo Dry Cleaners - Premium Dry Cleaning Services';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #0a2e2e 0%, #1a4a4a 50%, #0d3535 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: '-2px',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Lorenzo
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#D4A574',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            Dry Cleaners
          </div>
          <div
            style={{
              width: '120px',
              height: '3px',
              background: '#2DD4BF',
              marginTop: '10px',
              marginBottom: '10px',
            }}
          />
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              opacity: 0.9,
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            Premium Dry Cleaning Services in Nairobi
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: '#2DD4BF',
              marginTop: '10px',
            }}
          >
            21+ Branches Across Nairobi
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
