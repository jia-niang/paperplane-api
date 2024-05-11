import { Injectable } from '@nestjs/common'
import { City, Company } from '@prisma/client'
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
    await this.prisma.city.deleteMany({ where: { companyId: id } })

    return this.prisma.company.delete({ where: { id } })
  }

  async addWorkCityToCompany(companyId: string, city: City) {
    await this.prisma.company.findFirstOrThrow({ where: { id: companyId } })

    return this.prisma.city.create({ data: city })
  }

  async listWorkCitiesOfCompany(companyId: string) {
    await this.prisma.company.findFirstOrThrow({ where: { id: companyId } })

    return this.prisma.city.findMany({ where: { companyId } })
  }

  async getWorkCityOfCompany(companyId: string, cityId: string) {
    return await this.prisma.city.findFirstOrThrow({ where: { id: cityId, companyId } })
  }

  async updateWorkCityOfCompany(companyId: string, cityId: string, city: City) {
    await this.prisma.city.findFirstOrThrow({ where: { id: cityId, companyId } })

    return this.prisma.city.update({
      where: { id: cityId, companyId },
      data: omit(city, ['id', 'companyId']),
    })
  }

  async deleteWorkCityOfCompany(companyId: string, cityId: string) {
    return this.prisma.city.delete({ where: { id: cityId, companyId } })
  }
}
