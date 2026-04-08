import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function DashboardWidget({ title, icon: Icon, linkTo, children }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => linkTo && navigate(linkTo)}
      className="bg-bg-secondary border border-border rounded-none p-5 hover:bg-bg-tertiary hover:-translate-y-[1px] transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-text-tertiary" />}
          <h3 className="text-xs font-body font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
        </div>
        {linkTo && (
          <ArrowRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      {children}
    </div>
  );
}
