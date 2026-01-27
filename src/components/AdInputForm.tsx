"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Sparkles, X, Search, Wand2 } from "lucide-react";
import { Sector, SECTOR_FIELDS, PRODUCTS } from "@/data/mockData";

interface Product {
  id: string;
  product_name: string;
  target_audience?: string;
  term?: string;
  savings_limit?: string;
  interest_payment_method?: string;
  partial_withdrawal_allowed?: string;
  joint_name_allowed?: boolean;
  reinvestment_allowed?: boolean;
  interest_rates?: {
    base_rate?: string;
    max_rate?: string;
  };
  payout_restrictions: string;
  data_access_right: string;
  important_notes: string;
  deposit_protection: string;
}

// 필드명 영어 -> 한글 매핑
const productFieldLabels: Record<string, string> = {
  id: "상품코드",
  product_name: "상품명",
  target_audience: "가입대상",
  term: "가입기간",
  savings_limit: "저축한도",
  interest_payment_method: "이자지급방식",
  partial_withdrawal_allowed: "중도해지",
  joint_name_allowed: "공동명의",
  reinvestment_allowed: "재예치",
  interest_rates: "금리",
  base_rate: "기본금리",
  max_rate: "최고금리",
  payout_restrictions: "지급제한사항",
  data_access_right: "자료열람권",
  important_notes: "유의사항",
  deposit_protection: "예금자보호",
};

interface AdInputFormProps {
  sector: Sector;
  onAnalyze: (data: AdFormData) => void;
  isAnalyzing: boolean;
  initialData?: AdFormData | null;
}

export interface AdFormData {
  title: string;
  content: string;
  imageFile: File | null;
  sectorFields: Record<string, boolean>;
}

export default function AdInputForm({ sector, onAnalyze, isAnalyzing, initialData }: AdInputFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageFile, setImageFile] = useState<File | null>(initialData?.imageFile || null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sectorFields, setSectorFields] = useState<Record<string, boolean>>(initialData?.sectorFields || {});
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product search states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  
  // New product states
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");

  // AI Recommend states
  const [isRecommending, setIsRecommending] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendResult, setRecommendResult] = useState<{
    improvedContent: string;
    suggestions: string[];
    complianceScore: number;
  } | null>(null);

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

    // Auto-fill title with product name
    setTitle(product.product_name);

    // 모든 필드를 한글 필드명: 값 형식으로 변환
    const formatProductFields = (prod: Product): string => {
      const lines: string[] = [];

      // 기본 정보
      if (prod.id) lines.push(`${productFieldLabels.id}: ${prod.id}`);
      if (prod.product_name) lines.push(`${productFieldLabels.product_name}: ${prod.product_name}`);
      if (prod.target_audience) lines.push(`${productFieldLabels.target_audience}: ${prod.target_audience}`);
      if (prod.term) lines.push(`${productFieldLabels.term}: ${prod.term}`);
      if (prod.savings_limit) lines.push(`${productFieldLabels.savings_limit}: ${prod.savings_limit}`);
      if (prod.interest_payment_method) lines.push(`${productFieldLabels.interest_payment_method}: ${prod.interest_payment_method}`);
      if (prod.partial_withdrawal_allowed) lines.push(`${productFieldLabels.partial_withdrawal_allowed}: ${prod.partial_withdrawal_allowed}`);
      if (prod.joint_name_allowed !== undefined) lines.push(`${productFieldLabels.joint_name_allowed}: ${prod.joint_name_allowed ? "가능" : "불가"}`);
      if (prod.reinvestment_allowed !== undefined) lines.push(`${productFieldLabels.reinvestment_allowed}: ${prod.reinvestment_allowed ? "가능" : "불가"}`);

      // 금리 정보
      if (prod.interest_rates) {
        if (prod.interest_rates.base_rate) lines.push(`${productFieldLabels.base_rate}: ${prod.interest_rates.base_rate}`);
        if (prod.interest_rates.max_rate) lines.push(`${productFieldLabels.max_rate}: ${prod.interest_rates.max_rate}`);
      }

      // 필수 고지사항
      lines.push(""); // 빈 줄 추가
      lines.push("【필수 고지사항】");
      if (prod.payout_restrictions) lines.push(`${productFieldLabels.payout_restrictions}: ${prod.payout_restrictions}`);
      if (prod.data_access_right) lines.push(`${productFieldLabels.data_access_right}: ${prod.data_access_right}`);
      if (prod.important_notes) lines.push(`${productFieldLabels.important_notes}: ${prod.important_notes}`);
      if (prod.deposit_protection) lines.push(`${productFieldLabels.deposit_protection}: ${prod.deposit_protection}`);

      return lines.join("\n");
    };

    const productContent = formatProductFields(product);
    setContent(productContent);
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
        const data = result.data;

        // OCR로 추출한 상품명을 제목으로 설정
        setTitle(data.productName || "");

        // OCR로 추출한 텍스트만 광고 내용에 설정 (순수 텍스트 추출)
        let contentText = "";

        // 추출된 상세 정보가 있으면 추가
        const details: string[] = [];
        if (data.interestRate) details.push(`금리: ${data.interestRate}`);
        if (data.period) details.push(`가입기간: ${data.period}`);
        if (data.targetAudience) details.push(`가입대상: ${data.targetAudience}`);

        if (details.length > 0) {
          contentText = details.join("\n") + "\n\n";
        }

        // OCR로 추출한 텍스트 추가
        if (data.description || data.extractedText) {
          contentText += data.description || data.extractedText;
        }

        setContent(contentText);

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

  const handleAIRecommend = async () => {
    if (!content) {
      alert("AI 추천을 받으려면 광고 내용을 먼저 입력해주세요.");
      return;
    }

    setIsRecommending(true);
    setShowRecommendModal(true);
    setRecommendResult(null);

    try {
      const response = await fetch("/api/agent/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          sector,
          title,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setRecommendResult(result.data);
      } else {
        alert("AI 추천 생성에 실패했습니다.");
        setShowRecommendModal(false);
      }
    } catch (error) {
      console.error("AI Recommend error:", error);
      alert("AI 추천 중 오류가 발생했습니다.");
      setShowRecommendModal(false);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleApplyRecommendation = () => {
    if (recommendResult?.improvedContent) {
      setContent(recommendResult.improvedContent);
      setShowRecommendModal(false);
      setRecommendResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">광고 내용 입력</h2>
        <p className="text-gray-600 mt-1">{sector} 그룹사 광고 내용을 입력해주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-blue-800">
              상품 정보
            </h3>
            <div className="flex bg-white rounded-lg p-1 border border-blue-200">
              <button
                type="button"
                onClick={() => {
                  setIsNewProduct(false);
                  setNewProductName("");
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  !isNewProduct
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                기존 상품
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNewProduct(true);
                  setSelectedProduct(null);
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  isNewProduct
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                신상품
              </button>
            </div>
          </div>
          
          {isNewProduct ? (
            // 신상품 입력 UI
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  신상품명
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="신상품명을 입력해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {newProductName && (
                <p className="text-sm text-blue-600">
                  ✓ 신상품 &quot;{newProductName}&quot; 입력 완료
                </p>
              )}
            </div>
          ) : (
            // 기존 상품 검색 UI
            <>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-not-allowed"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-not-allowed"
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
            </>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 inline mr-1" />
              광고 내용
            </label>
            {content && (
              <button
                type="button"
                onClick={handleAIRecommend}
                disabled={isRecommending}
                className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
              >
                {isRecommending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-1" />
                    AI 내용 추천
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="광고 본문 내용을 입력하세요..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* AI Recommend Modal */}
      {showRecommendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-500 to-teal-500">
              <div className="flex items-center gap-2 text-white">
                <Wand2 className="w-5 h-5" />
                <h3 className="text-lg font-semibold">AI 광고 내용 추천</h3>
              </div>
              <button
                onClick={() => {
                  setShowRecommendModal(false);
                  setRecommendResult(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {isRecommending ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">AI가 광고 내용을 분석하고 있습니다...</p>
                  <p className="mt-1 text-sm text-gray-400">잠시만 기다려주세요</p>
                </div>
              ) : recommendResult ? (
                <div className="space-y-6">
                  {/* Compliance Score */}
                  <div className="bg-slate-800 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">현재 컴플라이언스 점수</span>
                      <div>
                        <span className={`text-3xl font-bold ${
                          recommendResult.complianceScore >= 80 ? "text-green-400" :
                          recommendResult.complianceScore >= 50 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {recommendResult.complianceScore}
                        </span>
                        <span className="text-slate-400">/100</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          recommendResult.complianceScore >= 80 ? "bg-green-500" :
                          recommendResult.complianceScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${recommendResult.complianceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Suggestions */}
                  {recommendResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">💡 개선 제안</h4>
                      <ul className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                        {recommendResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Content Comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">📝 원본 내용</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-48 overflow-y-auto">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-emerald-700 mb-2">✨ AI 추천 내용</h4>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 h-48 overflow-y-auto">
                        <p className="text-sm text-emerald-800 whitespace-pre-wrap">{recommendResult.improvedContent}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            {recommendResult && (
              <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRecommendModal(false);
                    setRecommendResult(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleApplyRecommendation}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  추천 내용 적용하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
