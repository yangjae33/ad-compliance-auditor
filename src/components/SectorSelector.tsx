"use client";

import { Building2, CreditCard, TrendingUp, Shield } from "lucide-react";
import { Sector } from "@/data/mockData";

interface SectorSelectorProps {
  selectedSector: Sector | null;
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
    value: "투자",
    label: "투자",
    icon: <TrendingUp className="w-6 h-6" />,
    description: "펀드, 주식, 채권 광고",
  },
  {
    value: "보험",
    label: "보험",
    icon: <Shield className="w-6 h-6" />,
    description: "생명보험, 손해보험 광고",
  },
];

export default function SectorSelector({ selectedSector, onSelectSector }: SectorSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Step 0: 업종 선택</h2>
      <p className="text-gray-600">광고의 업종을 선택해주세요. 업종에 따라 적용되는 규정이 달라집니다.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sectors.map((sector) => (
          <button
            key={sector.value}
            onClick={() => onSelectSector(sector.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedSector === sector.value
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`p-3 rounded-full ${
                  selectedSector === sector.value ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {sector.icon}
              </div>
              <span className="font-medium text-gray-800">{sector.label}</span>
              <span className="text-xs text-gray-500 text-center">{sector.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
