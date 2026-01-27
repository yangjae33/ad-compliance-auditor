"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Sparkles, X } from "lucide-react";
import { Sector, SECTOR_FIELDS } from "@/data/mockData";

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

  const fields = SECTOR_FIELDS[sector];

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
        <p className="text-gray-600 mt-1">광고 정보를 입력하면 {sector} 그룹사 규정에 따라 분류됩니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">
            {sector} 그룹사 필수 체크사항
          </h3>
          <div className="space-y-2">
            {fields.map((field) => (
              <label key={field.label} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sectorFields[field.label] || false}
                  onChange={(e) => handleFieldChange(field.label, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </label>
            ))}
          </div>
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
    </div>
  );
}
