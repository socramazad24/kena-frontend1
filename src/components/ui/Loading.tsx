interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loading({ size = 'md', text }: LoadingProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div
        className={`animate-spin rounded-full ${sizes[size]} border-b-2 border-primary-600`}
      ></div>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
