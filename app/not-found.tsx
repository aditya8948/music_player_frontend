import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center'>
      <div className='text-6xl font-semibold text-lime-300'>404</div>
      <div className='mt-4 text-xl'>This page is not found</div>
      <Link href='/' className='mt-6 rounded-full bg-lime-300 px-6 py-3 text-black font-semibold'>Return to library</Link>
    </div>
  );
}
