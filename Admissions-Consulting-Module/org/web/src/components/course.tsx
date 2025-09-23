'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, ChevronDown, Check, X, BookOpen, Clock, DollarSign, Tag, Sparkles } from 'lucide-react';

// Import types from your service file
import type { Category, Course, CreateCourseData } from '@/services/course.service';
// Import the useCourseData hook, and then destructure its methods
import { useCourseData } from '@/hooks/useCourse'; // Assuming useCourse is the file where useCourseData is defined

type ProgramType = 'Aptech' | 'Arena' | 'Short_term___Steam';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// Define a local type for the form's course state
// This type reflects the data collected directly by the form inputs,
// without requiring category_id until submission.
type CourseFormState = Omit<CreateCourseData, 'category_id'>;

export default function CourseCreationForm() {
  // Destructure the individual hooks from useCourseData
  const {
    useGetAllCategories,
    useCreateCategoryWithCourses,
    useCreateCoursesForExistingCategory,
  } = useCourseData();

  // Fetch categories using the useGetAllCategories hook
  const { data: categoriesResponse, isLoading: isLoadingCategories, error: categoriesError } = useGetAllCategories();
  // Ensure categories is an array, even if data or categories property is null/undefined
  const categories = categoriesResponse?.categories || [];

  // Mutations - now correctly destructured from the hook's return
  const createCategoryMutation = useCreateCategoryWithCourses();
  const createCoursesForExistingCategoryMutation = useCreateCoursesForExistingCategory();

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<{ name: string; description: string }>({
    name: '',
    description: ''
  });
  // Use the new CourseFormState type for the course state
  const [course, setCourse] = useState<CourseFormState>({
    name: '',
    description: '', // description is optional in CreateCourseData, so '' is fine.
    duration_text: '',
    price: '',
    is_active: true, // is_active is optional in CreateCourseData, so true is fine.
    program_type: 'Short_term___Steam' // 'Short_term___Steam' is assignable to string
  });

  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Combine loading states from mutations
  const loading = createCategoryMutation.isPending || createCoursesForExistingCategoryMutation.isPending;

  // Effect for handling category creation success/error
  useEffect(() => {
    if (createCategoryMutation.isSuccess) {
      setLocalSuccess('Category created successfully!');
      setTimeout(() => setLocalSuccess(''), 3000);
      setShowNewCategoryForm(false);
      setNewCategory({ name: '', description: '' });
      // After successful creation, React Query's invalidation will handle the actual refetch
      // For a real API, the onSuccess of createCategoryMutation would return the new category
      // which you could then use to setSelectedCategory(newCategoryReturned)
    }
    if (createCategoryMutation.isError) {
      setLocalError(`Failed to create category: ${createCategoryMutation.error?.message}`);
    }
  }, [createCategoryMutation.isSuccess, createCategoryMutation.isError, createCategoryMutation.error]);

  // Effect for handling course creation success/error
  useEffect(() => {
    if (createCoursesForExistingCategoryMutation.isSuccess) {
      setLocalSuccess('Course created successfully!');
      setTimeout(() => setLocalSuccess(''), 3000);
      // Reset form fields after successful submission
      setCourse({
        name: '',
        description: '',
        duration_text: '',
        price: '',
        is_active: true,
        program_type: 'Short_term___Steam'
      });
      setSelectedCategory(null);
    }
    if (createCoursesForExistingCategoryMutation.isError) {
      setLocalError(`Failed to create course: ${createCoursesForExistingCategoryMutation.error?.message}`);
    }
  }, [createCoursesForExistingCategoryMutation.isSuccess, createCoursesForExistingCategoryMutation.isError, createCoursesForExistingCategoryMutation.error]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters first
    let value = e.target.value.replace(/\D/g, '');

    if (value === '') {
      setCourse({ ...course, price: '' });
      return;
    }

    // Convert to number for display formatting, but store as string
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      setCourse({ ...course, price: '' });
      return;
    }

    setCourse({ ...course, price: numericValue.toString() });
  };

  const formatPriceDisplay = (price: string) => {
    if (!price) return '';

    const numericValue = parseInt(price, 10);
    if (isNaN(numericValue)) return price; // Return original if not a valid number

    // Format with 'vi-VN' locale for Vietnamese currency format (e.g., 1.234.567)
    return new Intl.NumberFormat('vi-VN').format(numericValue);
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.description) {
      setLocalError('Category name and description are required');
      return;
    }
    setLocalError('');
    // Use the mutation to add a new category
    createCategoryMutation.mutate(newCategory); // Direct mutation of newCategory as it matches CreateCategoryWithCoursesData
  };

  const handleSubmit = () => {
    // Validate that a category is selected
    if (!selectedCategory) {
      setLocalError('Please select or create a category');
      return;
    }

    // Validate all required course fields
    if (!course.name || !course.description || !course.duration_text || !course.price) {
      setLocalError('All course fields are required');
      return;
    }
    setLocalError('');

    // Prepare data for mutation, combining form state with selected category ID
    const courseData: CreateCourseData = {
      name: course.name,
      description: course.description,
      duration_text: course.duration_text,
      price: course.price,
      is_active: course.is_active,
      program_type: course.program_type,
      category_id: selectedCategory.id, // Add the required category_id here
    };

    // Use the mutation to create courses for the existing category
    createCoursesForExistingCategoryMutation.mutate({
      categoryId: selectedCategory.id,
      courses: [courseData]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Thêm Khóa Học Mới
          </h1>
          <p className="text-gray-600">Xây dựng trải nghiệm học tập hấp dẫn cho học sinh của bạn</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Status Messages */}
          {(localError || categoriesError) && ( // Show local error or categories fetch error
            <div className="bg-red-50 border-l-4 border-red-400 p-6 m-6 rounded-lg">
              <div className="flex items-start">
                <X className="h-6 w-6 text-red-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  {/* Explicitly cast to String to resolve potential type conflict */}
                  <p className="text-red-700 mt-1">{String(localError || categoriesError?.message)}</p>
                </div>
              </div>
            </div>
          )}

          {localSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-6 m-6 rounded-lg">
              <div className="flex items-start">
                <Check className="h-6 w-6 text-green-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-medium">Success</h3>
                  <p className="text-green-700 mt-1">{localSuccess}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                Danh mục học phần
              </label>
              <div className="relative">
                <button
                  type="button"
                  className={cn(
                    "w-full flex justify-between items-center p-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-200",
                    "hover:border-indigo-400 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50",
                    showCategoryDropdown ? "border-indigo-500 ring-4 ring-indigo-200/50 shadow-md" : "border-gray-200",
                    (isLoadingCategories || categoriesError) ? "opacity-70 cursor-not-allowed" : "" // Changed this line
                  )}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  disabled={isLoadingCategories || categoriesError !== null} // Disable button if categories are loading or errored
                >
                  <span className={cn(
                    "text-base font-medium",
                    selectedCategory ? "text-gray-800" : "text-gray-400"
                  )}>
                    {isLoadingCategories ? 'Loading categories...' : selectedCategory ? selectedCategory.name : 'Select a category'}
                  </span>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-gray-400 transition-transform duration-200",
                    showCategoryDropdown ? "transform rotate-180 text-indigo-600" : ""
                  )} />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-20 mt-2 w-full bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      {categories.length === 0 && !isLoadingCategories ? (
                        <div className="px-4 py-3 text-gray-500 text-center">No categories found.</div>
                      ) : (
                        categories.map((category) => (
                          <div
                            key={category.id} // Use category.id for key
                            className={cn(
                              "px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors duration-150",
                              selectedCategory?.id === category.id ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500" : ""
                            )}
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                          </div>
                        ))
                      )}
                      <div
                        className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center text-indigo-600 font-medium border-t border-gray-100"
                        onClick={() => {
                          setShowNewCategoryForm(true);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Thêm danh mục mới
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* New Category Form */}
            {showNewCategoryForm && (
              <div className="p-6 border-2 border-indigo-100 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="flex items-center font-semibold mb-4 text-indigo-800">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Thêm danh mục mới
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      rows={3}
                      placeholder="Describe the category..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => setShowNewCategoryForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-md"
                      onClick={handleAddCategory}
                      disabled={createCategoryMutation.isPending}
                    >
                      {createCategoryMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Saving...
                        </>
                      ) : 'Save Category'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Course Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Name */}
              <div className="lg:col-span-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                  Tên khóa học
                </label>
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-lg"
                  placeholder="Enter course name..."
                  value={course.name}
                  onChange={(e) => setCourse({ ...course, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                  Mô Tả
                </label>
                <textarea
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  rows={4}
                  placeholder="Describe what students will learn..."
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  Thời lượng
                </label>
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="e.g., 40 giờ"
                  value={course.duration_text}
                  onChange={(e) => setCourse({ ...course, duration_text: e.target.value })}
                />
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                  Gía khóa học (VND)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg font-medium">₫</span>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-lg"
                    placeholder="0"
                    value={formatPriceDisplay(course.price)}
                    onChange={handlePriceChange}
                  />
                </div>
                {course.price && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg">
                    Value: {parseInt(course.price, 10).toLocaleString('vi-VN')} VND
                  </p>
                )}
              </div>
            </div>

            {/* Program Type */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                Loại chương trình
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Short_term___Steam', 'Aptech', 'Arena'] as ProgramType[]).map((type) => (
                  <div key={type} className="relative">
                    <input
                      type="radio"
                      id={type}
                      name="program_type"
                      className="peer sr-only"
                      checked={course.program_type === type}
                      onChange={() => setCourse({ ...course, program_type: type })}
                    />
                    <label
                      htmlFor={type}
                      className={cn(
                        "block w-full p-4 border-2 rounded-xl cursor-pointer text-center font-medium transition-all duration-200",
                        "hover:border-indigo-400 hover:shadow-md hover:scale-105",
                        "peer-checked:border-indigo-500 peer-checked:bg-gradient-to-r peer-checked:from-indigo-50 peer-checked:to-purple-50 peer-checked:text-indigo-700 peer-checked:shadow-lg peer-checked:scale-105",
                        course.program_type === type ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-lg scale-105" : "border-gray-200 bg-white/50"
                      )}
                    >
                      {type === 'Short_term___Steam' ? 'Short-Term' : type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Trạng thái</h3>
                <p className="text-gray-600">Làm cho khóa học này có sẵn cho sinh viên</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  course.is_active ? "text-gray-500" : "text-indigo-600"
                )}>
                  Đóng
                </span>
                <button
                  type="button"
                  onClick={() => setCourse({ ...course, is_active: !course.is_active })}
                  className={cn(
                    "relative inline-flex w-14 h-8 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200/50",
                    course.is_active
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
                      : "bg-gray-300"
                  )}
                >
                  <span className={cn(
                    "inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-200 shadow-lg",
                    course.is_active ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  course.is_active ? "text-indigo-600" : "text-gray-500"
                )}>
                  Mở
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !selectedCategory} // Disable if loading or no category selected
                className={cn(
                  "w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg",
                  "hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-105",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-200/50",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "flex justify-center items-center"
                )}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Creating Course...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    Thêm khóa học
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
