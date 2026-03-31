import React from 'react';
import { 
  MessageSquare, 
  FileSignature, 
  Truck, 
  Settings2 
} from 'lucide-react';
import { Container } from './ui/Container';

interface ProcessStep {
  step: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: ProcessStep[] = [
  {
    step: "01",
    title: "상담",
    description: "규모를 파악 후 사용목적에 적합한 맞춤형 컨설팅 제공 및 견적서 발송",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "계약",
    description: "최적화된 렌탈 플랜 확정 및 간편한 온라인 계약 체결 프로세스 진행",
    icon: FileSignature,
  },
  {
    step: "03",
    title: "설치",
    description: "약속된 일정에 맞춰 전문 인력이 직접 방문하여 안전하고 신속하게 설치",
    icon: Truck,
  },
  {
    step: "04",
    title: "관리",
    description: "사용 기간 중 정기 점검 및 장애 발생 시 즉각적인 A/S와 사후 관리 지원",
    icon: Settings2,
  },
];

export const RentalProcessSection: React.FC = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl font-medium leading-tight tracking-tight text-black md:text-4xl">
            체계적인 렌탈 프로세스
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-10 text-center transition-all hover:border-brand-primary/10 hover:shadow-xl hover:shadow-black/[0.03] md:items-start md:text-left"
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-brand-primary/5 group-hover:text-brand-primary">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                
                <span className="mb-2 block text-sm font-medium tracking-wider text-brand-primary opacity-50">
                  STEP {item.step}
                </span>
                <h3 className="mb-4 text-xl font-medium text-black transition-colors group-hover:text-brand-primary">
                  {item.title}
                </h3>
                <p className="text-[15px] font-normal leading-relaxed text-black/60">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
