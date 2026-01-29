import { QuoteStatus, RequestStatus } from '@/lib/api';

interface QuotationCardProps {
  companyName: string;
  pricePerUnit: number;
  totalPrice: number;
  deliveryDays: number;
  validUntil: string;
  status: QuoteStatus;

  requestStatus: RequestStatus;
  isBestOffer?: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function QuotationCard({
  companyName,
  pricePerUnit,
  totalPrice,
  deliveryDays,
  validUntil,
  status,
  requestStatus,
  isBestOffer = false,
  onAccept,
  onReject,
}: QuotationCardProps) {
  return (
    <div
      className={`relative p-6 rounded-2xl border transition-all duration-300 ${isBestOffer
        ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-500/10 scale-[1.02]'
        : 'glass-card hover:border-primary/30'
        } ${status === 'ACCEPTED' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 ring-2 ring-green-500/20' :
          status === 'REJECTED' ? 'opacity-60 grayscale bg-muted/20' : ''
        }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-lg">{companyName}</h3>
          {isBestOffer && status === 'PENDING' && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              Best Offer
            </span>
          )}
        </div>

        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${status === 'PENDING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
          {status}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Price / unit</span>
          <span className="font-medium font-mono">${pricePerUnit.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Total price</span>
          <span className="font-bold text-primary font-mono">${totalPrice.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Delivery</span>
          <span className="font-medium">{deliveryDays} days</span>
        </div>

        <div className="flex justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Valid until</span>
          <span className="font-medium">{new Date(validUntil).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      {status === 'PENDING' && requestStatus === 'OPEN' && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={onAccept}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 rounded-lg border border-border bg-background text-muted-foreground font-medium text-sm hover:bg-muted hover:text-foreground transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
