export type Consts = {
  STARTERS_AFTREK_WAARDE: number;
  MKB_VRIJSTELLING_PERCENTAGE: number;
  ZVW_BIJDRAGE_PERCENTAGE: number;
  ZVW_BIJDRAGE_MAX_BIJDRAGE: number;
  ZELFSTANDIGEN_AFTREK_UREN_CRITERIUM: number;
  ZELFSTANDIGEN_AFTREK_WAARDE: number;
  INKOMSTENBELASTING_SCHIJF_1_MAX: number;
  INKOMSTENBELASTING_SCHIJF_1_PERCENTAGE: number;
  INKOMSTENBELASTING_SCHIJF_2_PERCENTAGE: number;
  HEFFINGSKORTING_GRENS1: number;
  HEFFINGSKORTING_GRENS2: number;
  HEFFINGSKORTING_BEDRAG: number;
  HEFFINGSKORTING_PERCENTAGE: number;
  TARIEF_AANPASSING_MAX_WINST: number;
  TARIEF_AANPASSING_BELASTBARE_WINST_KORTING_PERCENTAGE: number;
};

export type BerekenInputWithOmzet = {
  omzet: number;
  urencriteria: boolean;
};

export type BerekenInputWithUurTarief = {
  aantal_uur: number;
  uurtarief: number;
};

export interface BerekenOptions {
  input: BerekenInputWithOmzet | BerekenInputWithUurTarief;
  inkoop?: number;
  kosten?: {
    autokosten?: number;
    afschrijvingen?: number;
    rentelasten?: number;
    verzekeringen?: number;
    huisvesting?: number;
    kantoorkosten?: number;
    inventaris?: number;
    verkoopkosten?: number;
    overige_kosten?: number;
  };
  premie_aov?: number;
  inleg_pensioen?: number;
  rente_hypotheek?: number;
  bijtelling_auto?: number;
  startersaftrek?: boolean;
}

export interface BerekenResult {
  netto: {
    maand: number;
    jaar: number;
  };
  winst: {
    bruto: number;
    voor_zvw: number;
    uit_onderneming: number;
  };
  aftrek: {
    zelfstandigenaftrek: number;
    startersaftrek: number;
    mkb_winstvrijstelling: number;
  };
  kosten: number;
  belastbare_winst: number;
  inkomstenbelasting: number;
  heffingskorting: number;
  arbeidskorting: number;
  zvw: number;
  tariefaanpassing: number;
}
