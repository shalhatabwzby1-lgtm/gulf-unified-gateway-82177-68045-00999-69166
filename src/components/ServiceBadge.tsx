import React from 'react';
import { getServiceBranding } from '@/lib/serviceLogos';
import { Shield, Star, Verified, Award } from 'lucide-react';

interface ServiceBadgeProps {
  serviceKey: string;
  serviceName: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ServiceBadge: React.FC<ServiceBadgeProps> = ({ 
  serviceKey, 
  serviceName, 
  size = 'md',
  showIcon = true 
}) => {
  const branding = getServiceBranding(serviceKey);
  
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5'
    }
  };

  const config = sizeConfig[size];

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${config.container} transition-all hover:scale-105 hover:shadow-lg animate-fade-in`}
      style={{
        background: `linear-gradient(135deg, ${branding.colors.primary}15, ${branding.colors.secondary}15)`,
        border: `2px solid ${branding.colors.primary}`,
        color: branding.colors.primary,
        boxShadow: `0 2px 8px ${branding.colors.primary}20`
      }}
    >
      {showIcon && (
        <Shield className={config.icon} />
      )}
      <span>{serviceName}</span>
      <Verified className={config.icon} style={{ color: branding.colors.secondary }} />
    </div>
  );
};

export default ServiceBadge;
