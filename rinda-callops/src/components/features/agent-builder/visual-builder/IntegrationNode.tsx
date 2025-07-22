import { NodeProps, Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { 
  Database,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface IntegrationNodeData {
  label: string;
  integrationType: string;
  connectionStatus?: 'connected' | 'pending' | 'disconnected';
  platform?: string;
}

const integrationIcons: Record<string, React.ReactNode> = {
  'crm-update': <Database className="w-5 h-5 text-white" />,
  'calendar-integration': <Calendar className="w-5 h-5 text-white" />,
  'slack-notification': <MessageSquare className="w-5 h-5 text-white" />,
  'proposal-generator': <FileText className="w-5 h-5 text-white" />,
  'competitor-analysis': <BarChart3 className="w-5 h-5 text-white" />,
};

const platformColors: Record<string, string> = {
  salesforce: 'from-blue-500 to-blue-600',
  hubspot: 'from-orange-500 to-orange-600',
  google: 'from-green-500 to-green-600',
  slack: 'from-purple-500 to-purple-600',
  notion: 'from-gray-600 to-gray-700',
  pipedrive: 'from-green-600 to-emerald-600',
  default: 'from-indigo-500 to-purple-600'
};

export default function IntegrationNode({ data, selected }: NodeProps<IntegrationNodeData>) {
  const icon = integrationIcons[data.integrationType] || <Link2 className="w-5 h-5 text-white" />;
  const colorClass = platformColors[data.platform || 'default'] || platformColors.default;
  
  const getStatusIcon = () => {
    switch (data.connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (data.connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'pending':
        return 'Connecting...';
      default:
        return 'Click to connect';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br ${colorClass} p-4 rounded-xl shadow-lg border-2 ${
        selected ? 'border-white shadow-2xl' : 'border-transparent'
      } min-w-[220px] cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <div>
            <h3 className="text-white font-semibold">{data.label}</h3>
            <p className="text-white/70 text-xs">{data.platform}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/20">
        <p className="text-white/80 text-sm flex items-center gap-2">
          {getStatusText()}
        </p>
      </div>
    </motion.div>
  );
}