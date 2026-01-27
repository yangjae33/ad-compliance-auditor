"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Shield,
  Ban,
  FileText,
} from "lucide-react";
import { Sector, SECTOR_GUIDELINES, SectorGuideline } from "@/data/mockData";

interface SectorGuidelinePanelProps {
  sector: Sector;
}

export default function SectorGuidelinePanel({
  sector,
}: SectorGuidelinePanelProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    checklist: true,
    prohibited: false,
    mandatory: false,
    process: false,
    warnings: false,
  });

  const guideline: SectorGuideline = SECTOR_GUIDELINES[sector];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader = ({
    section,
    title,
    icon: Icon,
    count,
    color,
  }: {
    section: string;
    title: string;
    icon: React.ElementType;
    count?: number;
    color: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
        expandedSections[section]
          ? `bg-${color}-50 border border-${color}-200`
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon
          className={`w-5 h-5 ${
            expandedSections[section] ? `text-${color}-600` : "text-gray-500"
          }`}
        />
        <span
          className={`font-medium ${
            expandedSections[section] ? `text-${color}-800` : "text-gray-700"
          }`}
        >
          {title}
        </span>
        {count !== undefined && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              expandedSections[section]
                ? `bg-${color}-100 text-${color}-700`
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {guideline.name} 업종 광고 가이드라인
            </h3>
            <p className="text-blue-100 text-sm">
              심의 기준 및 필수 확인 사항
            </p>
          </div>
        </div>
      </div>

      {/* Main Regulations */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          주요 관련 법규
        </h4>
        <div className="flex flex-wrap gap-2">
          {guideline.mainRegulations.map((reg, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
            >
              {reg}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-3">
        {/* Checklist Section */}
        <div>
          <SectionHeader
            section="checklist"
            title="의무 확인 사항"
            icon={CheckCircle2}
            count={guideline.checklist.length}
            color="green"
          />
          {expandedSections.checklist && (
            <div className="mt-2 ml-2 space-y-2">
              {Object.entries(
                guideline.checklist.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {} as Record<string, typeof guideline.checklist>)
              ).map(([category, items]) => (
                <div key={category} className="mb-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {category}
                  </h5>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 bg-gray-50 rounded-md mb-1 border-l-2 border-green-400"
                    >
                      <div className="flex items-start space-x-2">
                        <div
                          className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 ${
                            item.required
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300"
                          }`}
                        >
                          {item.required && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {item.item}
                            {item.required && (
                              <span className="ml-1 text-xs text-red-500">
                                *필수
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-0.5">
                            📋 {item.regulation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prohibited Expressions Section */}
        <div>
          <SectionHeader
            section="prohibited"
            title="금지 표현"
            icon={Ban}
            count={guideline.prohibitedExpressions.length}
            color="red"
          />
          {expandedSections.prohibited && (
            <div className="mt-2 ml-2 space-y-2">
              {guideline.prohibitedExpressions.map((expr) => (
                <div
                  key={expr.id}
                  className="p-3 bg-red-50 rounded-md border-l-2 border-red-400"
                >
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        &ldquo;{expr.pattern.replace(/\\/g, "").replace(/\./g, "").replace(/\{.*?\}/g, "...").replace(/\|/g, ", ")}&rdquo;
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {expr.description}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        📋 {expr.regulation}
                      </p>
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                        💡 <strong>권장:</strong> {expr.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mandatory Statements Section */}
        <div>
          <SectionHeader
            section="mandatory"
            title="필수 문구"
            icon={FileText}
            count={guideline.mandatoryStatements.length}
            color="blue"
          />
          {expandedSections.mandatory && (
            <div className="mt-2 ml-2 space-y-2">
              {guideline.mandatoryStatements.map((stmt) => (
                <div
                  key={stmt.id}
                  className="p-3 bg-blue-50 rounded-md border-l-2 border-blue-400"
                >
                  <p className="text-sm text-blue-800 font-medium">
                    &ldquo;{stmt.content}&rdquo;
                  </p>
                  {stmt.condition && (
                    <p className="text-xs text-blue-600 mt-1">
                      ⚡ 적용 조건: {stmt.condition}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    📋 {stmt.regulation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Process Section */}
        <div>
          <SectionHeader
            section="process"
            title="심의 절차"
            icon={Shield}
            count={guideline.reviewProcess.length}
            color="purple"
          />
          {expandedSections.process && (
            <div className="mt-2 ml-2">
              <div className="relative">
                {guideline.reviewProcess.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 pt-0.5">
                      {step.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Warnings Section */}
        <div>
          <SectionHeader
            section="warnings"
            title="주의사항"
            icon={AlertTriangle}
            count={guideline.warnings.length}
            color="yellow"
          />
          {expandedSections.warnings && (
            <div className="mt-2 ml-2 space-y-2">
              {guideline.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-yellow-50 rounded-md border-l-2 border-yellow-400 flex items-start space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">{warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
