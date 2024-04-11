"use client";
export default function Error({ message }: { message: string }) {
  return <p className='w-full text-center text-red-500'>{message}</p>;
}
