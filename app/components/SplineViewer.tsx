'use client';

import Spline from '@splinetool/react-spline';

export default function SplineViewer({ 
  scene = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode',
  className = ''
}: {
  scene?: string;
  className?: string;
}) {
  return (
    <div className={`w-full h-full min-h-[400px] ${className}`}>
      <Spline scene={scene} />
    </div>
  );
}
