'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRegisterPatient } from '../hooks/useFrontDeskAnalytics';
import { UserPlus, Search, Save } from 'lucide-react';

export function FrontDeskRegistrationPanel() {
  const { mutate: register, isPending } = useRegisterPatient();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    register({
      name: fd.get('name') as string,
      phone: fd.get('phone') as string,
      age: parseInt(fd.get('age') as string),
      gender: fd.get('gender') as 'Male' | 'Female' | 'Other',
      idProof: fd.get('idProof') as string,
    });
  };

  return (
    <Card className="border-emerald-500/25 shadow-glass bg-[#040a06] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">QUICK REGISTRATION</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto">
        {/* Phone-first lookup */}
        <div className="mb-5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Patient Lookup (Phone / MRN)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Enter phone number or MRN to auto-fill..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
          </div>
        </div>

        <div className="border-t border-white/5 pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Full Name *</label>
                <input name="name" required className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" placeholder="Patient full name" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Phone *</label>
                <input name="phone" required className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" placeholder="10-digit mobile" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Age *</label>
                <input name="age" type="number" required min={0} max={120} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" placeholder="Age" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Gender *</label>
                <select name="gender" required className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50 appearance-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">ID Proof</label>
                <select name="idProof" className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50 appearance-none">
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="DL">Driving License</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-6" leftIcon={<Save className="w-4 h-4"/>}>
                Save &amp; Generate MRN
              </Button>
            </div>
          </form>
        </div>
      </CardBody>
    </Card>
  );
}
