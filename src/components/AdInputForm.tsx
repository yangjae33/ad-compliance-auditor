"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Sparkles, X, Search } from "lucide-react";
import { Sector, SECTOR_FIELDS, PRODUCTS } from "@/data/mockData";

interface Product {
  id: string;
  product_name: string;
  payout_restrictions: string;
  data_access_right: string;
  important_notes: string;
  deposit_protection: string;
}

interface AdInputFormProps {
  sector: Sector;
  onAnalyze: (data: AdFormData) => void;
  isAnalyzing: boolean;
}

export interface AdFormData {
  title: string;
  content: string;
  imageFile: File | null;
  sectorFields: Record<string, boolean>;
}

export default function AdInputForm({ sector, onAnalyze, isAnalyzing }: AdInputFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sectorFields, setSectorFields] = useState<Record<string, boolean>>({});
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product search states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  const fields = SECTOR_FIELDS[sector];

  // Filter products by search query
  const filteredProducts = PRODUCTS.filter((product) => {
    const query = productSearchQuery.toLowerCase();
    return (
      product.product_name.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query)
    );
  });

  // Handle product selection from modal
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(false);
    setProductSearchQuery("");

    // Auto-fill mandatory disclosure text
    const mandatoryText = `${product.payout_restrictions}

${product.data_access_right}

${product.important_notes}

${product.deposit_protection}`;

    setContent((prev) => (prev ? `${prev}\n\n${mandatoryText}` : mandatoryText));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFieldChange = (label: string, checked: boolean) => {
    setSectorFields((prev) => ({ ...prev, [label]: checked }));
  };

  const handleAutoFill = async () => {
    if (!imageFile) {
      alert("AI 자동 채우기를 사용하려면 이미지를 먼저 업로드해주세요.");
      return;
    }

    setIsAutoFilling(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("sector", sector);

      const response = await fetch("/api/agent/draft", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        setTitle(result.data.productName || "");
        setContent(result.data.description || "");

        if (result.isMock) {
          console.log("Using mock data for auto-fill");
        }
      }
    } catch (error) {
      console.error("Auto-fill error:", error);
      alert("자동 채우기 중 오류가 발생했습니다.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ title, content, imageFile, sectorFields });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Step 1 & 2: 광고 입력 및 분류</h2>
        <p className="text-gray-600 mt-1">광고 정보를 입력하면 {sector} 업종 규정에 따라 분류됩니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-3">
            상품 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상품명
              </label>
              <input
                type="text"
                value={selectedProduct?.product_name || ""}
                readOnly
                placeholder="검색 버튼을 클릭하여 선택"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품 코드
                </label>
                <input
                  type="text"
                  value={selectedProduct?.id || ""}
                  readOnly
                  placeholder="-"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  검색
                </button>
              </div>
            </div>
          </div>
          {selectedProduct && (
            <p className="text-sm text-green-600 mt-2">
              ✓ 상품 선택 완료 - 필수 고지사항이 광고 내용에 자동 추가되었습니다.
            </p>
          )}
        </div>

        {/* Sector Essential Check - Hidden but still functional */}
        <div className="hidden">
          {fields.map((field) => (
            <input
              key={field.label}
              type="checkbox"
              checked={sectorFields[field.label] || false}
              onChange={(e) => handleFieldChange(field.label, e.target.checked)}
            />
          ))}
        </div>

        {/* Image Upload with AI Auto-Fill */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              광고 이미지
            </label>
            {imageFile && (
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {isAutoFilling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI 자동 채우기
                  </>
                )}
              </button>
            )}
          </div>

          {imagePreview ? (
            <div className="relative border-2 border-blue-300 rounded-lg p-2 bg-blue-50">
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 mx-auto rounded object-contain"
              />
              <p className="text-center text-sm text-blue-600 mt-2">{imageFile?.name}</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">클릭하여 이미지를 업로드하세요</p>
                <p className="text-xs text-gray-400 mt-1">이미지 업로드 후 AI 자동 채우기 사용 가능</p>
              </label>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            광고 제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 연 5% 고금리 적금 출시!"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            광고 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="광고 본문 내용을 입력하세요..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isAnalyzing || !title || !content}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isAnalyzing || !title || !content
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI 검토 중...
            </span>
          ) : (
            "검토 시작하기"
          )}
        </button>
      </form>

      {/* Product Search Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">상품 검색</h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setProductSearchQuery("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="상품명 또는 상품 코드로 검색..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Product List */}
            <div className="overflow-y-auto max-h-[50vh]">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상품명</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-32">상품 코드</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() => handleProductSelect(product as Product)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">{product.product_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{product.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
              총 {filteredProducts.length}개 상품
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
