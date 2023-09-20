import CONSTS from "./consts.ts";

const {
  ZELFSTANDIGEN_AFTREK_UREN_CRITERIUM,
  ZELFSTANDIGEN_AFTREK_WAARDE,
  INKOMSTENBELASTING_SCHIJF_1_MAX,
  INKOMSTENBELASTING_SCHIJF_1_PERCENTAGE,
  INKOMSTENBELASTING_SCHIJF_2_PERCENTAGE,
  HEFFINGSKORTING_GRENS1,
  HEFFINGSKORTING_GRENS2,
  HEFFINGSKORTING_BEDRAG,
  HEFFINGSKORTING_PERCENTAGE,
  TARIEF_AANPASSING_MAX_WINST,
  TARIEF_AANPASSING_BELASTBARE_WINST_KORTING_PERCENTAGE,
} = CONSTS;

export const calcZelfstandigenAftrek = (
  aantal_uur: number | boolean,
  winst_uit_onderneming: number,
): number => {
  if (
    (typeof aantal_uur === "boolean" && !aantal_uur) ||
    (typeof aantal_uur === "number" && aantal_uur < ZELFSTANDIGEN_AFTREK_UREN_CRITERIUM)
  ) {
    return 0;
  }
  return Math.max(Math.min(winst_uit_onderneming, ZELFSTANDIGEN_AFTREK_WAARDE), 0);
};

export const calcInkomstenBelasting = (belastbare_winst: number): number => {
  const max1 = INKOMSTENBELASTING_SCHIJF_1_MAX;
  let schijf1 = 0;
  let schijf2 = 0;
  let inkomstenbelasting = 0;
  try {
    if (belastbare_winst > 0) {
      const calcVal = Math.min(belastbare_winst, max1);
      schijf1 = (calcVal / 100) * INKOMSTENBELASTING_SCHIJF_1_PERCENTAGE;
      if (belastbare_winst > max1) {
        schijf2 = ((belastbare_winst - max1) / 100) * INKOMSTENBELASTING_SCHIJF_2_PERCENTAGE;
      }
      inkomstenbelasting = schijf1 + schijf2;
    }
  } catch (e) {
    console.error(e);
  }
  return inkomstenbelasting;
};

export const calcHeffingsKorting = (belastbare_winst: number): number => {
  if (belastbare_winst > 0 && belastbare_winst <= HEFFINGSKORTING_GRENS1) {
    return HEFFINGSKORTING_BEDRAG;
  } else if (
    belastbare_winst > HEFFINGSKORTING_GRENS1 && belastbare_winst <= HEFFINGSKORTING_GRENS2
  ) {
    return HEFFINGSKORTING_BEDRAG -
      ((belastbare_winst - (HEFFINGSKORTING_GRENS1 - 1)) / 100 * HEFFINGSKORTING_PERCENTAGE);
  } else if (belastbare_winst > HEFFINGSKORTING_GRENS2) {
    // useless, as it's 0
    return 0;
  }
  return 0;
};

export const calcArbeidskorting = (belastbare_winst: number): number => {
  if (belastbare_winst >= 0 && belastbare_winst <= 10740) {
    return belastbare_winst / 100 * 8.231;
  } else if (belastbare_winst > 10740 && belastbare_winst <= 23201) {
    return 884 + ((belastbare_winst - 10740) / 100 * 29.861);
  } else if (belastbare_winst > 23201 && belastbare_winst <= 37691) {
    return 4605 + ((belastbare_winst - 23201) / 100 * 3.085);
  } else if (belastbare_winst > 37691 && belastbare_winst <= 115295) {
    return 5052 - ((belastbare_winst - 37691) / 100 * 6.51);
    // } else if (belastbare_winst > 115295) {
    //   return 0;
  }
  return 0;
};

export const calcArbeidskortingAOW = (belastbare_winst: number): number => {
  if (belastbare_winst >= 0 && belastbare_winst <= 10740) {
    return belastbare_winst / 100 * 4.241;
  } else if (belastbare_winst > 10740 && belastbare_winst <= 23201) {
    return 457 + ((belastbare_winst - 10740) / 100 * 15.388);
  } else if (belastbare_winst > 23201 && belastbare_winst <= 37691) {
    return 2374 + ((belastbare_winst - 23201) / 100 * 1.589);
  } else if (belastbare_winst > 37691 && belastbare_winst < 115295) {
    return 2604 - ((belastbare_winst - 37691) / 100 * 3.355);
    // } else if (belastbare_winst > 115295) {
    //   return 0;
  }
  return 0;
};

export const calcTariefAanpassing = (
  winst_uit_onderneming: number,
  zelfstandigenaftrek: number,
  startersaftrek: number,
  winstvrijstelling: number,
  rente_hypotheek: number,
): number => {
  const belastbarewinst_korting = TARIEF_AANPASSING_BELASTBARE_WINST_KORTING_PERCENTAGE / 100;
  if (winst_uit_onderneming > TARIEF_AANPASSING_MAX_WINST) {
    const totale_aftrekposten = zelfstandigenaftrek + startersaftrek + winstvrijstelling +
      rente_hypotheek;
    const bovengrens = winst_uit_onderneming - TARIEF_AANPASSING_MAX_WINST;
    if (bovengrens > totale_aftrekposten) {
      return totale_aftrekposten * belastbarewinst_korting;
    } else {
      return bovengrens * belastbarewinst_korting;
    }
  }
  return 0;
};
