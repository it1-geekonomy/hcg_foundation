import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from '../donors/entities/donor.entity';
import { Project } from '../projects/entities/project.entity';
import { FundraisingCampaign } from '../fundraising-campaigns/entities/fundraising-campaign.entity';
import { LeadsContact } from '../leads-contact/entities/leads-contact.entity';
import { Event } from '../events/entities/event.entity';
import { PartnershipInquiry } from '../partnership-inquiries/entities/partnership-inquiry.entity';
import { User } from '../users/entities/user.entity';
import { DonationStatus } from '../../common/enums/donation-status.enum';
import { ContentStatus } from '../../common/enums/content-status.enum';
import { CampaignStatus } from '../../common/enums/campaign-status.enum';
import { InquiryStatus } from '../../common/enums/inquiry-status.enum';

export interface DashboardStats {
  totalDonors: number;
  totalDonationsAmount: number;
  activeProjects: number;
  activeCampaigns: number;
  activeEvents: number;
  pendingPartnerships: number;
  totalUsers: number;
  recentDonations: Partial<Donor>[];
  recentContacts: Partial<LeadsContact>[];
  topDonors: Partial<Donor>[];
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Donor)
    private readonly donorRepo: Repository<Donor>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(FundraisingCampaign)
    private readonly campaignRepo: Repository<FundraisingCampaign>,
    @InjectRepository(LeadsContact)
    private readonly contactRepo: Repository<LeadsContact>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(PartnershipInquiry)
    private readonly partnershipRepo: Repository<PartnershipInquiry>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    try {
      const totalDonors = await this.donorRepo.count({
        where: { status: DonationStatus.PAID },
      });

      const amountResult = await this.donorRepo
        .createQueryBuilder('donor')
        .select('SUM(donor.amount)', 'total')
        .where('donor.status = :status', { status: DonationStatus.PAID })
        .getRawOne();
        
      const totalDonationsAmount = amountResult?.total ? parseFloat(amountResult.total) : 0;

      const activeProjects = await this.projectRepo.count({
        where: { status: ContentStatus.PUBLISHED },
      });

      const activeCampaigns = await this.campaignRepo.count({
        where: { status: CampaignStatus.APPROVED },
      });
      
      const activeEvents = await this.eventRepo.count({
        where: { status: ContentStatus.PUBLISHED },
      });

      const pendingPartnerships = await this.partnershipRepo.count({
        where: { status: InquiryStatus.PENDING },
      });

      const totalUsers = await this.userRepo.count();

      const recentDonations = await this.donorRepo.find({
        where: { status: DonationStatus.PAID },
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'fullName', 'amount', 'currency', 'createdAt'],
      });

      const topDonors = await this.donorRepo.find({
        where: { status: DonationStatus.PAID },
        order: { amount: 'DESC' },
        take: 5,
        select: ['id', 'fullName', 'amount', 'currency', 'createdAt'],
      });

      const recentContacts = await this.contactRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'fullName', 'email', 'createdAt'],
      });

      return {
        totalDonors,
        totalDonationsAmount,
        activeProjects,
        activeCampaigns,
        activeEvents,
        pendingPartnerships,
        totalUsers,
        recentDonations,
        topDonors,
        recentContacts,
      };
    } catch (err) {
      this.logger.error(`Error fetching dashboard stats: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }
}
