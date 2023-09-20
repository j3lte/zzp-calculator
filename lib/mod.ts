// Calculates net income for Dutch freelancers
// Based on https://www.ikwordzzper.nl/zzp-stappenplan/handige-hulpmiddelen/netto-besteedbaar-inkomen-calculator-zzp/

// Year: 2023

import type {
  BerekenInputWithOmzet,
  BerekenInputWithUurTarief,
  BerekenOptions,
  BerekenResult,
} from "./types.ts";

import {
  calcArbeidskorting,
  calcHeffingsKorting,
  calcInkomstenBelasting,
  calcTariefAanpassing,
  calcZelfstandigenAftrek,
} from "./calc.ts";

import CONSTS from "./consts.ts";

const {
  STARTERS_AFTREK_WAARDE,
  MKB_VRIJSTELLING_PERCENTAGE,
  ZVW_BIJDRAGE_PERCENTAGE,
  ZVW_BIJDRAGE_MAX_BIJDRAGE,
} = CONSTS;

export const ZZPCalculator = ({
  input,
  inkoop = 0,
  kosten,
  startersaftrek = false,
  premie_aov = 0,
  inleg_pensioen = 0,
  rente_hypotheek = 0,
  bijtelling_auto = 0,
}: BerekenOptions): BerekenResult => {
  const omzet = (input as BerekenInputWithOmzet).omzet ||
    ((input as BerekenInputWithUurTarief).aantal_uur *
      (input as BerekenInputWithUurTarief).uurtarief);
  const bruto_winst = omzet - inkoop;
  const kostenSum = Object.values(kosten || {}).reduce((a, b) => a + b, 0);
  const winst_uit_onderneming = bruto_winst - kostenSum;
  const zelfstandigenaftrek = calcZelfstandigenAftrek(
    (input as BerekenInputWithUurTarief).aantal_uur ||
      (input as BerekenInputWithOmzet).urencriteria,
    winst_uit_onderneming,
  );
  const startersaftrekWaarde = startersaftrek ? STARTERS_AFTREK_WAARDE : 0;
  const winstvrijstellingTemp =
    (winst_uit_onderneming - zelfstandigenaftrek - startersaftrekWaarde) /
    100 * MKB_VRIJSTELLING_PERCENTAGE;
  const winstvrijstelling = winstvrijstellingTemp < 0 ? 0 : winstvrijstellingTemp;

  const belastbare_winst = winst_uit_onderneming - zelfstandigenaftrek - startersaftrekWaarde -
    winstvrijstelling - premie_aov - inleg_pensioen - rente_hypotheek + bijtelling_auto;
  const belastbare_winst_2 = winst_uit_onderneming + bijtelling_auto - zelfstandigenaftrek -
    startersaftrekWaarde - winstvrijstelling - premie_aov;

  const winst_voor_zvw = winst_uit_onderneming - zelfstandigenaftrek - startersaftrekWaarde -
    winstvrijstelling;

  const tariefaanpassing = calcTariefAanpassing(
    winst_uit_onderneming,
    zelfstandigenaftrek,
    startersaftrekWaarde,
    winstvrijstelling,
    rente_hypotheek,
  );

  const zvwTemp = belastbare_winst_2 / 100 * ZVW_BIJDRAGE_PERCENTAGE;
  const zvwMax = ZVW_BIJDRAGE_MAX_BIJDRAGE / 100 * ZVW_BIJDRAGE_PERCENTAGE;
  const zvw = zvwTemp < 0 ? 0 : (zvwTemp > zvwMax ? zvwMax : zvwTemp);

  const inkomstenbelasting = calcInkomstenBelasting(Math.floor(belastbare_winst));
  const heffingskorting = calcHeffingsKorting(Math.floor(belastbare_winst));
  const arbeidskorting = calcArbeidskorting(Math.floor(winst_uit_onderneming));

  let netto_inkomen = winst_uit_onderneming - premie_aov - inleg_pensioen - zvw;

  const extra_aftrekken = inkomstenbelasting - (heffingskorting + arbeidskorting);
  if (extra_aftrekken > 0) {
    netto_inkomen = netto_inkomen - extra_aftrekken;
  }
  if (tariefaanpassing > 0) {
    netto_inkomen = netto_inkomen - tariefaanpassing;
  }
  if (netto_inkomen < 0) {
    netto_inkomen = 0;
  }

  const netto_maandinkomen = netto_inkomen / 12;

  return {
    netto: {
      maand: Math.round(netto_maandinkomen * 100) / 100,
      jaar: Math.round(netto_inkomen * 100) / 100,
    },
    winst: {
      bruto: Math.round(bruto_winst * 100) / 100,
      voor_zvw: Math.round(winst_voor_zvw * 100) / 100,
      uit_onderneming: Math.round(winst_uit_onderneming * 100) / 100,
    },
    aftrek: {
      zelfstandigenaftrek: Math.round(zelfstandigenaftrek * 100) / 100,
      startersaftrek: Math.round(startersaftrekWaarde * 100) / 100,
      mkb_winstvrijstelling: Math.round(winstvrijstelling * 100) / 100,
    },
    kosten: Math.round(kostenSum * 100) / 100,
    belastbare_winst: Math.round(belastbare_winst * 100) / 100,
    inkomstenbelasting: Math.floor(inkomstenbelasting),
    heffingskorting: Math.round(heffingskorting * 100) / 100,
    arbeidskorting: Math.round(arbeidskorting * 100) / 100,
    zvw: Math.round(zvw * 100) / 100,
    tariefaanpassing: Math.round(tariefaanpassing * 100) / 100,
  };
};
