'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileSpreadsheet, 
  Link, 
  Plus, 
  CheckCircle, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface GoogleSheetsIntegrationProps {
  toolType: 'orders' | 'faq';
  businessName: string;
  initialConfig?: {
    sheetId?: string;
    sheetUrl?: string;
    sheetName?: string;
    columnMappings?: Record<string, string>;
    isConnected?: boolean;
  } | null;
  onSheetConnected: (config: {
    sheetId: string;
    sheetUrl: string;
    sheetName: string;
    columnMappings: Record<string, string>;
  }) => void;
  onSheetDisconnected: () => void;
}

export default function GoogleSheetsIntegration({ 
  toolType, 
  businessName,
  initialConfig,
  onSheetConnected,
  onSheetDisconnected
}: GoogleSheetsIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [error, setError] = useState('');
  const [sheetAnalysis, setSheetAnalysis] = useState<any>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [connectedSheet, setConnectedSheet] = useState<{
    id: string;
    url: string;
    sheetName: string;
    columnMappings: Record<string, string>;
  } | null>(null);

  // Initialize with existing config and check for OAuth callback
  useEffect(() => {
    // Load initial config if provided
    if (initialConfig) {
      setIsGoogleConnected(!!initialConfig.isConnected);
      if (initialConfig.sheetId && initialConfig.sheetUrl && initialConfig.sheetName) {
        setConnectedSheet({
          id: initialConfig.sheetId,
          url: initialConfig.sheetUrl,
          sheetName: initialConfig.sheetName,
          columnMappings: initialConfig.columnMappings || {}
        });
      }
      if (initialConfig.columnMappings) {
        setColumnMappings(initialConfig.columnMappings);
      }
    }

    // Check for OAuth callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const googleConnected = urlParams.get('google_connected') === 'true';
      if (googleConnected) {
        setIsGoogleConnected(true);
        
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('google_connected');
        url.searchParams.delete('state');
        window.history.replaceState({}, '', url);
      }
    }
  }, [initialConfig]);

  const connectToGoogle = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Store current page URL to return to after OAuth
      const currentUrl = encodeURIComponent(window.location.href);
      const response = await fetch(`/api/google-sheets/auth?state=${currentUrl}`);
      const { authUrl } = await response.json();
      
      // Open Google auth in a new window
      window.open(authUrl, '_blank', 'width=500,height=600');
      
      // Listen for the callback
      window.addEventListener('message', handleAuthCallback);
    } catch (err) {
      setError('Failed to connect to Google. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAuthCallback = (event: MessageEvent) => {
    if (event.data.type === 'google-auth-success') {
      window.removeEventListener('message', handleAuthCallback);
      setIsGoogleConnected(true);
      setError('');
    }
  };

  const createTemplate = async () => {
    setIsCreating(true);
    setError('');
    
    try {
      const response = await fetch('/api/google-sheets/create-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: toolType,
          businessName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const { spreadsheetId, spreadsheetUrl } = await response.json();
      
      // Auto-analyze the created template (removed for now)
      
      // For templates, we know the structure
      const mappings: Record<string, string> = toolType === 'orders' ? {
        customer_name: 'Customer Name',
        phone_number: 'Phone Number',
        items: 'Items',
        total_amount: 'Total Amount',
        delivery_address: 'Delivery Address',
        order_status: 'Status',
        notes: 'Notes'
      } : {
        question: 'Question',
        answer: 'Answer',
        category: 'Category'
      };
      
      const config = {
        id: spreadsheetId as string,
        url: spreadsheetUrl as string,
        sheetName: toolType === 'orders' ? 'Orders' : 'FAQ',
        columnMappings: mappings
      };
      
      setConnectedSheet(config);
      onSheetConnected({
        sheetId: spreadsheetId,
        sheetUrl: spreadsheetUrl,
        sheetName: config.sheetName,
        columnMappings: mappings
      });
    } catch (err) {
      setError('Failed to create template. Please make sure you are connected to Google.');
    } finally {
      setIsCreating(false);
    }
  };

  const analyzeSheet = async (url: string) => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      const response = await fetch('/api/google-sheets/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetUrl: url,
          toolType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze sheet');
      }

      const data = await response.json();
      setSheetAnalysis(data);
      
      // Set initial column mappings from AI analysis
      if (data.analysis && data.analysis.columnMappings) {
        setColumnMappings(data.analysis.columnMappings);
      }
      
      return data;
    } catch (err) {
      setError('Failed to analyze sheet. Make sure you have access to it.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const connectExistingSheet = async () => {
    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    
    if (!sheetIdMatch) {
      setError('Invalid Google Sheets URL. Please provide a valid URL.');
      return;
    }

    const sheetId = sheetIdMatch[1];
    
    // Analyze the sheet first
    const analysis = await analyzeSheet(sheetUrl);
    
    if (analysis) {
      const config = {
        id: sheetId,
        url: sheetUrl,
        sheetName: analysis.sheetName || 'Sheet1',
        columnMappings: columnMappings
      };
      
      setConnectedSheet(config);
      onSheetConnected({
        sheetId: sheetId,
        sheetUrl: sheetUrl,
        sheetName: config.sheetName,
        columnMappings: columnMappings
      });
    }
  };

  const disconnectSheet = () => {
    setConnectedSheet(null);
    setIsGoogleConnected(false);
    setColumnMappings({});
    setSheetAnalysis(null);
    onSheetDisconnected();
  };

  if (connectedSheet) {
    return (
      <Card className="p-6 bg-green-500/10 border-green-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <h4 className="font-semibold text-white">Google Sheets Connected</h4>
              <p className="text-sm text-white/70">
                {toolType === 'orders' ? 'Orders' : 'FAQ'} will be saved to "{connectedSheet.sheetName}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 px-3"
              onClick={() => window.open(connectedSheet.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-300 hover:bg-red-500/20 px-3"
              onClick={disconnectSheet}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-800/50 border-gray-700/50">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">
            Connect Google Sheets for {toolType === 'orders' ? 'Order Management' : 'FAQ Management'}
          </h3>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
            <TabsTrigger value="create" className="data-[state=active]:bg-blue-500">
              Create New Sheet
            </TabsTrigger>
            <TabsTrigger value="existing" className="data-[state=active]:bg-blue-500">
              Use Existing Sheet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <p className="text-sm text-white/70">
              We'll create a pre-formatted Google Sheet template for your {toolType}.
            </p>
            
            <div className="space-y-3">
              {!isGoogleConnected && (
                <Button
                  onClick={connectToGoogle}
                  disabled={isConnecting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                  )}
                  Connect to Google Sheets
                </Button>
              )}

              {isGoogleConnected && (
                <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">✓ Connected to Google Sheets</span>
                  </div>
                </div>
              )}

              <Button
                onClick={createTemplate}
                disabled={isCreating || !isGoogleConnected}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create {toolType === 'orders' ? 'Orders' : 'FAQ'} Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="existing" className="space-y-4 mt-4">
            <p className="text-sm text-white/70">
              Paste the URL of your existing Google Sheet below.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-white">Google Sheets URL</Label>
                <Input
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="bg-slate-700/50 border-gray-600 text-white"
                />
              </div>

              <Button
                onClick={connectExistingSheet}
                disabled={!sheetUrl}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Link className="w-4 h-4 mr-2" />
                Connect Sheet
              </Button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-white/80 text-sm">
                Make sure your sheet has the required columns for {toolType === 'orders' ? 
                  'orders (Order ID, Date, Customer Name, etc.)' : 
                  'FAQ (Question, Answer, Category)'
                }
              </p>
            </div>

            {/* Column Mapping UI */}
            {sheetAnalysis && (
              <div className="space-y-4 mt-4 p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-white font-medium">Configure Column Mappings</h4>
                <p className="text-sm text-white/70">Map your sheet columns to the required fields:</p>
                
                {toolType === 'orders' ? (
                  <div className="space-y-3">
                    {[
                      { field: 'customer_name', label: 'Customer Name' },
                      { field: 'phone_number', label: 'Phone Number' },
                      { field: 'items', label: 'Order Items' },
                      { field: 'total_amount', label: 'Total Amount' },
                      { field: 'delivery_address', label: 'Delivery Address' },
                      { field: 'order_status', label: 'Order Status' },
                      { field: 'notes', label: 'Notes' }
                    ].map(({ field, label }) => (
                      <div key={field} className="grid grid-cols-2 gap-3 items-center">
                        <Label className="text-white">{label}</Label>
                        <Select
                          value={columnMappings[field] || ''}
                          onValueChange={(value) => setColumnMappings({
                            ...columnMappings,
                            [field]: value
                          })}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {sheetAnalysis.headers.map((header: string) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { field: 'question', label: 'Question' },
                      { field: 'answer', label: 'Answer' },
                      { field: 'category', label: 'Category' }
                    ].map(({ field, label }) => (
                      <div key={field} className="grid grid-cols-2 gap-3 items-center">
                        <Label className="text-white">{label}</Label>
                        <Select
                          value={columnMappings[field] || ''}
                          onValueChange={(value) => setColumnMappings({
                            ...columnMappings,
                            [field]: value
                          })}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {sheetAnalysis.headers.map((header: string) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  onClick={() => {
                    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                    if (sheetIdMatch) {
                      const sheetId = sheetIdMatch[1];
                      const config = {
                        id: sheetId,
                        url: sheetUrl,
                        sheetName: sheetAnalysis.sheetName || 'Sheet1',
                        columnMappings: columnMappings
                      };
                      
                      setConnectedSheet(config);
                      onSheetConnected({
                        sheetId: sheetId,
                        sheetUrl: sheetUrl,
                        sheetName: config.sheetName,
                        columnMappings: columnMappings
                      });
                    }
                  }}
                  disabled={isAnalyzing}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Column Mappings
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}