import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import RastercueLogo from '../icons/rastercue-logo';
import LanguageSwitcher from '../sidebar/settings-tab/language-switcher';
import SelectTheme from '../sidebar/settings-tab/select-theme';

export function OnboardingDialog() {
  const [open,setOpen]=useState(false);
  useEffect(()=>setOpen(localStorage.getItem('rastercueWelcomeSeen')!=='true'),[]);
  const close=()=>{ localStorage.setItem('rastercueWelcomeSeen','true');setOpen(false); };
  return <Dialog open={open} onOpenChange={value=>value?setOpen(true):close()}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
    <DialogHeader><RastercueLogo className="w-12 h-12 text-primary"/><DialogTitle>Welcome to Rastercue</DialogTitle><DialogDescription>Your image upscaling workspace, based on Upscayl’s proven engine.</DialogDescription></DialogHeader>
    <p className="text-sm">Choose an image and model on the left. Inspect before and after with the divider, wheel zoom and drag-to-pan. The right panel keeps job details and statistics close at hand.</p>
    <p className="text-sm text-warning">Check each model’s commercial-use notice before using it for client work. Unknown rights are not permission.</p>
    <LanguageSwitcher/><SelectTheme/>
    <p className="text-xs opacity-75">No analytics or cloud promotions. Images and job history remain local. Automatic updates check Rastercue’s own GitHub Releases; disable them in Application settings if needed.</p>
    <button className="btn btn-primary" onClick={close}>Open workspace</button>
  </DialogContent></Dialog>;
}
