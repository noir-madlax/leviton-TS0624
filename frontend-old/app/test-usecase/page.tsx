'use client';

import React, { useState } from 'react';
import CategoryUseCaseBar from '@/components/CategoryUseCaseBar';
import { getTopUseCases, ProductType } from '@/lib/categoryFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewPanelProvider, useReviewPanel } from '@/lib/review-panel-context';
import { ReviewPanel } from '@/components/ui/review-panel';

// 内部组件，用于访问 ReviewPanel context
function TestUseCaseContent() {
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('dimmer');
  const reviewPanel = useReviewPanel(); // 获取 ReviewPanel context
  
  const useCases = getTopUseCases(selectedProductType, 10);
  
  // 添加数据安全检查，确保有有效数据
  if (!useCases || !Array.isArray(useCases)) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading use case data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>使用场景满意度分析测试页面</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                当前产品类型: <strong>{selectedProductType === 'dimmer' ? 'Dimmer Switches' : 'Light Switches'}</strong>
              </p>
              <p className="text-sm text-gray-600">
                使用场景数量: <strong>{useCases.length}</strong>
              </p>
            </div>
            
            <CategoryUseCaseBar 
              data={useCases}
              title={`${selectedProductType === 'dimmer' ? 'Dimmer' : 'Light'} Switches - Use Case Analysis`}
              description="Bar height shows mention frequency, color indicates satisfaction level"
              productType={selectedProductType}
              onProductTypeChange={setSelectedProductType}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* 添加 ReviewPanel 组件用于显示评论详情 */}
      <ReviewPanel
        isOpen={reviewPanel.isOpen}
        onClose={reviewPanel.closePanel}
        reviews={reviewPanel.reviews}
        title={reviewPanel.title}
        subtitle={reviewPanel.subtitle}
        showFilters={reviewPanel.showFilters}
      />
    </>
  );
}

export default function TestUseCasePage() {
  return (
    <ReviewPanelProvider>
      <TestUseCaseContent />
    </ReviewPanelProvider>
  );
} 