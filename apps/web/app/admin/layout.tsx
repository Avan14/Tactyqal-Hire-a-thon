import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="wrap flex flex-col gap-10 py-[clamp(40px,6cqi,80px)]">
      <p className="small self-start border-4 border-black bg-[#ff6b35] px-4 py-2">
        Blog admin · demo of the new blog API
      </p>
      {children}
    </div>
  );
}
