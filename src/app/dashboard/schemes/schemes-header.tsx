"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Sparkles, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SchemesHeader() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({
    scale: "Micro",
    sector: "Manufacturing",
    district: "Pune"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wider uppercase">AI Schemes Matcher</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Incentives & Subsidies</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Based on your enterprise profile, our Smart Matcher has identified government schemes you are highly eligible for. Applying for these can significantly reduce your capital costs.
        </p>
      </div>
      
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-4 shadow-sm">
        <div className="bg-[#b3401a]/10 p-2 rounded-full">
          <Filter className="w-5 h-5 text-[#b3401a]" />
        </div>
        <div className="text-sm">
          <p className="text-slate-500">Matching Profile:</p>
          <p className="font-semibold text-slate-900">{profile.scale} • {profile.sector} • {profile.district}</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" className="ml-2 border-slate-300 text-slate-700">Edit Profile</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>Edit Matching Profile</DialogTitle>
                <DialogDescription>
                  Update your business details to find more relevant schemes and subsidies.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="scale">Enterprise Scale</Label>
                  <Select value={profile.scale} onValueChange={(val) => setProfile({...profile, scale: val || ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Micro">Micro (Investment &lt; ₹1 Cr)</SelectItem>
                      <SelectItem value="Small">Small (Investment &lt; ₹10 Cr)</SelectItem>
                      <SelectItem value="Medium">Medium (Investment &lt; ₹50 Cr)</SelectItem>
                      <SelectItem value="Large">Large / Mega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select value={profile.sector} onValueChange={(val) => setProfile({...profile, sector: val || ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="IT/ITES">IT / ITES</SelectItem>
                      <SelectItem value="Agriculture">Agriculture / Food Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="district">District / Location</Label>
                  <Select value={profile.district} onValueChange={(val) => setProfile({...profile, district: val || ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pune">Pune</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Nashik">Nashik</SelectItem>
                      <SelectItem value="Nagpur">Nagpur</SelectItem>
                      <SelectItem value="Aurangabad">Aurangabad</SelectItem>
                      <SelectItem value="Gadchiroli">Gadchiroli (D+ Zone)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#b3401a] hover:bg-[#923315] text-white">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
