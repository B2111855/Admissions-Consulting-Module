// components/ui/search.tsx
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import useDebounce from '@/hooks/debounce';

interface SearchProps {
  onSearch: (searchTerm: string) => void;
  initialSearchTerm?: string;
}

export default function Search({
  onSearch,
  initialSearchTerm = '',
}: SearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Debug: Kiểm tra giá trị từ props và đồng bộ hóa
  useEffect(() => {
    console.log(
      'Search.tsx: initialSearchTerm prop received:',
      initialSearchTerm
    );
    if (initialSearchTerm !== searchTerm) {
      console.log(
        'Search.tsx: Updating internal searchTerm to match initialSearchTerm:',
        initialSearchTerm
      );
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Debug: Kiểm tra khi debouncedSearchTerm thay đổi và onSearch được gọi
  useEffect(() => {
    console.log('Search.tsx: Debounced search term:', debouncedSearchTerm);
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    console.log(
      'Search.tsx: Input changed, new internal searchTerm:',
      event.target.value
    );
  };

  return (
    <div className="relative w-80">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 o 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input
        type="text"
        placeholder="Tìm kiếm theo họ tên..."
        className="pl-12 pr-4"
        value={searchTerm} // Giá trị của input được quản lý bởi state nội bộ `searchTerm`
        onChange={handleInputChange}
      />
    </div>
  );
}
