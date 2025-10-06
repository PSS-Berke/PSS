'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ChevronDown, ChevronUp, Loader2, Copy, RefreshCw } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';

interface CallPrepModuleProps {
  className?: string;
}

export function CallPrepModule({ className }: CallPrepModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [company, setCompany] = useState('');
  const [product, setProduct] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { state, submitCompanyData, loadLatestAnalysis } = useCallPrep();

  useEffect(() => {
    // Auto-load on mount
    loadLatestAnalysis();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLatestAnalysis, 30000);
    return () => clearInterval(interval);
  }, [loadLatestAnalysis]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim() || !product.trim()) {
      setSubmitMessage('Please fill in both company and product fields');
      setTimeout(() => setSubmitMessage(''), 3000);
      return;
    }

    await submitCompanyData(company, product);

    setSubmitMessage('Submitted! Analysis will appear below shortly.');
    setTimeout(() => setSubmitMessage(''), 3000);

    setCompany('');
    setProduct('');
  };

  const handleCopyAnalysis = async () => {
    if (state.latestAnalysis?.analysis) {
      try {
        await navigator.clipboard.writeText(state.latestAnalysis.analysis);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading
        </Badge>
      );
    }
    if (state.latestAnalysis) {
      return <Badge variant="outline">Analysis Ready</Badge>;
    }
    return <Badge variant="secondary">No Analysis</Badge>;
  };

  return (
    <Card className={`w-full ${className} relative`}>
      {/* Expand Button - Positioned in top-right corner */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-[32px] right-[12px] z-10 px-[17px] py-3"
        onClick={toggleExpanded}
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between pr-28">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C33527]/10 rounded-lg">
              <Building2 className="h-5 w-5 text-[#C33527]" />
            </div>
            <div>
              <CardTitle className="text-lg">Call Prep Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered company analysis for sales calls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-2">
            <div className="px-1">
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Submission Form */}
          <div className="rounded-xl border border-border/80 bg-background/80 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Enter company name"
                    disabled={state.isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product">Product or Service</Label>
                  <Input
                    id="product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="Enter product or service"
                    disabled={state.isSubmitting}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={state.isSubmitting}
                    className="bg-[#C33527] hover:bg-[#DA857C]"
                  >
                    {state.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
                {submitMessage && (
                  <p className="text-sm text-muted-foreground">{submitMessage}</p>
                )}
              </div>
            </form>
          </div>

          {/* Results Viewer */}
          <div className="rounded-xl border border-border/80 bg-background/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Latest Analysis</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadLatestAnalysis()}
                disabled={state.isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {state.error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </div>
            ) : state.isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#C33527]" />
                <p className="text-sm text-muted-foreground">Loading latest results...</p>
              </div>
            ) : state.latestAnalysis ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                  {state.latestAnalysis.analysis}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAnalysis}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copySuccess ? 'Copied!' : 'Copy Analysis'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Building2 className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No analysis available yet. Submit a company lookup above.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
