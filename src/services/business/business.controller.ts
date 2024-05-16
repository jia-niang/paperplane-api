import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { Workplace, Company } from '@prisma/client'

import { BusinessService } from './business.service'

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('/company')
  async addCompany(company: Company) {
    return this.businessService.addCompany(company)
  }

  @Get('/company/:id')
  async getCompanyById(@Param('id') id: string) {
    return this.businessService.getCompanyById(id)
  }

  @Get('/company')
  async listCompanies() {
    return this.businessService.listCompanies()
  }

  @Put('/company/:id')
  async updateCompany(@Param('id') id: string, @Body() company: Company) {
    return this.businessService.updateCompany(id, company)
  }

  @Delete('/company/:id')
  async deleteCompany(@Param('id') id: string) {
    return this.businessService.deleteCompany(id)
  }

  @Post('/company/:companyId/workplace')
  async addWorkplaceToCompany(@Param('companyId') companyId: string, workplace: Workplace) {
    return this.businessService.addWorkplaceToCompany(companyId, workplace)
  }

  @Get('/company/:companyId/workplace')
  async listWorkCitiesOfCompany(@Param('companyId') companyId: string) {
    return this.businessService.listWorkCitiesOfCompany(companyId)
  }

  @Get('/company/:companyId/workplace/:workplaceId')
  async getWorkplaceOfCompanyById(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string
  ) {
    return this.businessService.getWorkplaceOfCompany(companyId, workplaceId)
  }

  @Put('/company/:companyId/workplace/:workplaceId')
  async updateWorkplaceOfCompany(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Body() workplace: Workplace
  ) {
    return this.businessService.updateWorkplaceOfCompany(companyId, workplaceId, workplace)
  }

  @Delete('/company/:companyId/workplace/:workplaceId')
  async deleteWorkplaceOfCompany(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string
  ) {
    return this.businessService.deleteWorkplaceOfCompany(companyId, workplaceId)
  }
}
