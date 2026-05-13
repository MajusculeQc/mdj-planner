import { z } from 'zod';
import { ActivityZod, ActivityTypeEnum, MaterialZod, BudgetZod, LogisticsZod, RiskManagementZod, StaffingZod, YouthInvolvementZod, ActivityDocumentZod, CommentZod, ChangelogEntryZod, InventoryItemZod, MaterialReservationZod, PurchaseRequestZod, MemberZod, MemberStatusEnum, MemberGenderEnum, BoardMemberZod, VaultDocumentZod, BoardRoleEnum, FinancialHealthZod } from './lib/schemas';

export type ActivityType = z.infer<typeof ActivityTypeEnum>;
export const ActivityType = {
  ACCUEIL: 'Accueil, Écoute & Milieu de Vie',
  AIDE_DEVOIRS: 'Aide aux Devoirs & Soutien Scolaire',
  ACCOMPAGNEMENT: 'Accompagnement Individualisé',
  INTERVENTION: 'Intervention & Gestion de Crise',
  ANIMATION: 'Animation (sorties, activités, séjours)',
  PREVENTION_INTERNE: 'Prévention & Sensibilisation (Interne)',
  PREVENTION_PARTENAIRE: 'Prévention & Sensibilisation (Partenaire)',
  VIE_ASSOCIATIVE: 'Vie Associative & Bénévolat Jeunes',
  PROMOTION: 'Promotion, Concertation & Gestion',
  PHYSIQUE: 'Activité physique',
  CULINAIRE: 'Atelier culinaire',
  DEMOCRATIQUE: 'Activité démocratique (CJ)'
} as const;

export type ActivityTypes = (keyof typeof ActivityType)[];

export type Material = MaterialZod;
export type Budget = BudgetZod;
export type Logistics = LogisticsZod;
export type RiskManagement = RiskManagementZod;
export type Staffing = StaffingZod;
export type YouthInvolvement = YouthInvolvementZod;
export type ActivityDocument = ActivityDocumentZod;
export type Activity = ActivityZod;
export type Member = MemberZod;
export type BoardMember = BoardMemberZod;
export type VaultDocument = VaultDocumentZod;
export type FinancialHealth = FinancialHealthZod;

export type MemberStatus = z.infer<typeof MemberStatusEnum>;
export type MemberGender = z.infer<typeof MemberGenderEnum>;
export type BoardRole = z.infer<typeof BoardRoleEnum>;

export type ActivityComment = CommentZod;
export type ChangelogEntry = ChangelogEntryZod;

export type InventoryItem = InventoryItemZod;
export type MaterialReservation = MaterialReservationZod;
export type PurchaseRequest = PurchaseRequestZod;

export interface BudgetItem {
  description: string;
  amount: number;
}