import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Star, TrendingUp, Zap } from 'lucide-react';
import { useCreateCheckoutSessionMutation } from '@/api/promotionApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const PLANS = [
    {
        id: 'FEATURED_7D',
        title: 'Featured (7 Days)',
        price: 49,
        type: 'FEATURED',
        features: ['Highlighted Badge', 'Homepage Feature', 'Email Boost']
    },
    {
        id: 'FEATURED_30D',
        title: 'Featured (30 Days)',
        price: 149,
        type: 'FEATURED',
        features: ['Highlighted Badge', 'Homepage Feature', 'Email Boost', '30 Days Duration']
    },
    {
        id: 'PROMOTED_7D',
        title: 'Promoted (7 Days)',
        price: 99,
        type: 'PROMOTED',
        features: ['📌 Top of Search (Pinned)', '5x Reach', 'Highlighted Badge', 'Homepage Feature', 'Email Boost'],
        bestValue: false
    },
    {
        id: 'PROMOTED_30D',
        title: 'Promoted (30 Days)',
        price: 299,
        type: 'PROMOTED',
        features: ['📌 Top of Search (Pinned)', '🚀 Maximum Reach', 'Highlighted Badge', 'Homepage Feature', 'Email Boost'],
        bestValue: true
    }
];

const PromoteModal = ({ isOpen, onClose, jobId, jobTitle }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [createSession, { isLoading }] = useCreateCheckoutSessionMutation();

    const handlePayment = async () => {
        if (!selectedPlan) return;
        
        try {
            const response = await createSession({ jobId, planId: selectedPlan }).unwrap();
            if (response.data?.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            toast.error(error?.data?.message || "Failed to initiate payment");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        Promote Job: <span className="text-emerald-600">{jobTitle}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Boost visibility and get up to 5x more applicants.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {PLANS.map((plan) => (
                        <div 
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                                selectedPlan === plan.id 
                                ? 'border-emerald-500 bg-emerald-50/50' 
                                : 'border-gray-200 hover:border-emerald-200'
                            }`}
                        >
                            {plan.bestValue && (
                                <span className="absolute -top-3 right-4 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                    BEST VALUE
                                </span>
                            )}
                            
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{plan.title}</h3>
                                    <div className="text-emerald-700 font-bold text-xl">${plan.price}</div>
                                </div>
                                {plan.type === 'PROMOTED' ? <TrendingUp className="text-purple-500" /> : <Star className="text-amber-500" />}
                            </div>

                            <ul className="space-y-2 mt-4">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-600">
                                        <Check className="w-4 h-4 mr-2 text-emerald-500 text-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <DialogFooter className="sm:justify-between items-center border-t pt-4">
                   <div className="text-sm text-gray-500">
                        Secure payment via Stripe
                   </div>
                   <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700" 
                            disabled={!selectedPlan || isLoading}
                            onClick={handlePayment}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                            {selectedPlan ? `Pay $${PLANS.find(p => p.id === selectedPlan).price}` : 'Select a Plan'}
                        </Button>
                   </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PromoteModal;
