/** Portal accent: business = crimson, professional = navy (Linkio design system). */
export const PORTALS = {
  business: {
    panelClass: "bg-red",
    panelGradient: "linkio-gradient-panel",
    primaryBtn: "btn-linkio-crimson",
    primaryBtnDisabled: "w-full py-3.5 rounded-linkio text-sm font-medium bg-red/40 text-white/80 cursor-not-allowed",
    textAccent: "text-red",
    hoverAccent: "hover:text-red",
    checkbox: "accent-red",
    stepperVariant: "red",
    badgePending: "bg-gold/15 text-navy border border-gold/30",
    iconBg: "bg-red/10",
    skillTag: "bg-red/10 text-red",
  },
  professional: {
    panelClass: "bg-gradient-to-br from-[#0f2540] to-[#091525]",
    panelGradient: "bg-gradient-to-br from-[#0f2540] to-[#091525]",
    primaryBtn: "btn-linkio-navy",
    primaryBtnDisabled: "w-full py-3.5 rounded-linkio text-sm font-medium bg-navy/40 text-white/80 cursor-not-allowed",
    textAccent: "text-navy",
    hoverAccent: "hover:text-navy",
    checkbox: "accent-navy",
    stepperVariant: "navy",
    badgePending: "bg-amber-light text-amber-900 border border-amber/30",
    iconBg: "bg-navy/10",
    skillTag: "bg-navy/10 text-navy",
  },
};

export function getPortal(portal) {
  return PORTALS[portal] || PORTALS.business;
}
