import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="wrap page flex flex-col gap-10 pb-[10vh]" data-hdr="dark">
      <p className="badge self-start">
        Blog admin · demo of the new blog API
      </p>
      {children}
    </div>
  );
}
