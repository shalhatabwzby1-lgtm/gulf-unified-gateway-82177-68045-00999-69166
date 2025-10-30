import React from 'react';
import { getServiceBranding } from '@/lib/serviceLogos';
import { Shield, CheckCircle, Lock, Award, BadgeCheck } from 'lucide-react';

interface OfficialStampProps {
  serviceKey: string;
  serviceName: string;
  transactionId?: string;
  type?: 'approved' | 'verified' | 'paid' | 'secured';
}

const OfficialStamp: React.FC<OfficialStampProps> = ({ 
  serviceKey, 
  serviceName, 
  transactionId,
  type = 'approved' 
}) => {
  const branding = getServiceBranding(serviceKey);
  
  const stampConfig = {
    approved: {
      icon: CheckCircle,
      text: 'مُعتمد',
      textEn: 'APPROVED',
      rotate: -15
    },
    verified: {
      icon: Shield,
      text: 'مُوثّق',
      textEn: 'VERIFIED',
      rotate: 12
    },
    paid: {
      icon: BadgeCheck,
      text: 'مدفوع',
      textEn: 'PAID',
      rotate: -8
    },
    secured: {
      icon: Lock,
      text: 'محمي',
      textEn: 'SECURED',
      rotate: 10
    }
  };

  const config = stampConfig[type];
  const Icon = config.icon;

  return (
    <div className="relative inline-block animate-stamp">
      {/* Official Stamp - Circular with Border */}
      <div 
        className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center transition-transform hover:scale-110"
        style={{
          transform: `rotate(${config.rotate}deg)`,
        }}
      >
        {/* Outer Circle - Double Border */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-dashed opacity-60"
          style={{ 
            borderColor: branding.colors.primary,
            animation: 'spin 20s linear infinite reverse'
          }}
        />
        <div 
          className="absolute inset-2 rounded-full border-2"
          style={{ borderColor: branding.colors.primary }}
        />
        
        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/95 rounded-full">
          {/* Icon */}
          <Icon 
            className="w-8 h-8 sm:w-10 sm:h-10 mb-1"
            style={{ color: branding.colors.primary }}
          />
          
          {/* Arabic Text */}
          <div 
            className="text-sm sm:text-base font-bold text-center mb-0.5"
            style={{ color: branding.colors.primary }}
          >
            {config.text}
          </div>
          
          {/* English Text */}
          <div 
            className="text-[10px] sm:text-xs font-semibold text-center tracking-wider"
            style={{ color: branding.colors.secondary }}
          >
            {config.textEn}
          </div>
          
          {/* Service Name */}
          <div className="text-[8px] sm:text-[10px] text-center mt-1 font-semibold opacity-70">
            {serviceName.split(' ')[0]}
          </div>
          
          {/* Date */}
          <div className="text-[7px] sm:text-[9px] text-center text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('ar-SA', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            })}
          </div>
        </div>

        {/* Decorative Stars */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <Award className="w-3 h-3" style={{ color: branding.colors.primary }} />
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <Award className="w-3 h-3" style={{ color: branding.colors.primary }} />
        </div>
      </div>
    </div>
  );
};

export default OfficialStamp;
