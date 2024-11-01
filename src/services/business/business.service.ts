import { Injectable } from '@nestjs/common'
import { Workplace, Company } from '@prisma/client'
import { omit } from 'lodash'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async addCompany(company: Company) {
    return this.prisma.company.create({ data: company })
  }

  async listCompanies() {
    return this.prisma.company.findMany()
  }

  async getCompanyById(id: string) {
    return this.prisma.company.findFirstOrThrow({ where: { id } })
  }

  async updateCompany(id: string, company: Company) {
    return this.prisma.company.update({ where: { id }, data: omit(company, ['id']) })
  }

  async deleteCompany(id: string) {
    await this.prisma.workplace.deleteMany({ where: { companyId: id } })

    return this.prisma.company.delete({ where: { id } })
  }

  async addWorkplaceToCompany(companyId: string, workplace: Workplace) {
    await this.prisma.company.findFirstOrThrow({ where: { id: companyId } })

    return this.prisma.workplace.create({ data: workplace })
  }

  async listWorkCitiesOfCompany(companyId: string) {
    await this.prisma.company.findFirstOrThrow({ where: { id: companyId } })

    return this.prisma.workplace.findMany({ where: { companyId } })
  }

  async getWorkplaceOfCompany(companyId: string, id: string) {
    return await this.prisma.workplace.findFirstOrThrow({ where: { id, companyId } })
  }

  async updateWorkplaceOfCompany(companyId: string, id: string, workplace: Workplace) {
    await this.prisma.workplace.findFirstOrThrow({ where: { id, companyId } })

    return this.prisma.workplace.update({
      where: { id, companyId },
      data: omit(workplace, ['id', 'companyId']),
    })
  }

  async deleteWorkplaceOfCompany(companyId: string, id: string) {
    return this.prisma.workplace.delete({ where: { id, companyId } })
  }

  async ensureCompanyAndWorkplace(
    companyId: string,
    workplaceId: string,
    throwError?: string | Error
  ) {
    const relation = await this.prisma.workplace.findFirst({
      where: { id: workplaceId, companyId },
    })

    if (relation) {
      return true
    } else if (throwError) {
      throw typeof throwError === 'string' ? new Error(throwError) : throwError
    }

    return false
  }
}
