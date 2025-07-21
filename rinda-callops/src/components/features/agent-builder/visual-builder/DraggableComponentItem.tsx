import { DragEvent } from 'react';
import { motion } from 'framer-motion';

interface DraggableComponentItemProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  onDragStart: (event: DragEvent, nodeType: string, label: string) => void;
}

export default function DraggableComponentItem({
  id,
  name,
  description,
  icon,
  category,
  onDragStart
}: DraggableComponentItemProps) {
  const handleDragStart = (event: DragEvent) => {
    const nodeType = category === 'Integrations' ? 'integrationNode' : 'toolNode';
    onDragStart(event, nodeType, name);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 bg-slate-700/50 rounded-lg border border-gray-600 hover:border-blue-500 cursor-move transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">{name}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
          <span className="text-xs text-gray-500 mt-2 inline-block">
            {category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}