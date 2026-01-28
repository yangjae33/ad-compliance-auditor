"use client";

import { Building2, CreditCard, TrendingUp, Shield, Check } from "lucide-react";
import { Sector } from "@/data/mockData";

interface SectorSelectorProps {
  selectedSectors: Sector[];
  onSelectSector: (sector: Sector) => void;
}

const sectors: { value: Sector; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "은행",
    label: "은행",
    icon: <Building2 className="w-6 h-6" />,
    description: "예적금, 대출 상품 광고",
  },
  {
    value: "카드",
    label: "카드",
    icon: <CreditCard className="w-6 h-6" />,
    description: "신용카드, 체크카드 광고",
  },
  {
    value: "증권",
    label: "증권",
    icon: <TrendingUp className="w-6 h-6" />,
    description: "펀드, 주식, 채권 광고",
  },
  {
    value: "라이프",
    label: "라이프",
    icon: <Shield className="w-6 h-6" />,
    description: "생명보험 광고",
  },
];

export default function SectorSelector({ selectedSectors, onSelectSector }: SectorSelectorProps) {
  const isSelected = (sector: Sector) => selectedSectors.includes(sector);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">그룹사 선택</h2>
      <p className="text-gray-600">
        그룹사를 선택해주세요. <span className="text-blue-600 font-medium">여러 그룹사를 동시에 선택</span>할 수 있으며, 선택한 그룹사에 따라 규정이 적용됩니다.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sectors.map((sector) => {
          const selected = isSelected(sector.value);
          return (
            <button
              key={sector.value}
              onClick={() => onSelectSector(sector.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 relative ${
                selected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              {/* 선택 체크 표시 */}
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`p-3 rounded-full ${
                    selected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {sector.icon}
                </div>
                <span className="font-medium text-gray-800">{sector.label}</span>
                <span className="text-xs text-gray-500 text-center">{sector.description}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* 선택된 그룹사 표시 */}
      {selectedSectors.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">선택된 그룹사:</span>{" "}
            {selectedSectors.join(", ")}
            {selectedSectors.length > 1 && (
              <span className="ml-2 text-blue-600">
                ({selectedSectors.length}개 그룹사의 규정이 통합 적용됩니다)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
