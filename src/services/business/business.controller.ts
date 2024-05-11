import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { City, Company } from '@prisma/client'

import { BusinessService } from './business.service'

@Controller('business')
export class BusinessController {
  constructor(private readonly companyService: BusinessService) {}

  @Post('/company')
  async addCompany(company: Company) {
    return this.companyService.addCompany(company)
  }

  @Get('/company/:id')
  async getCompanyById(@Param('id') id: string) {
    return this.companyService.getCompanyById(id)
  }

  @Get('/company')
  async listCompanies() {
    return this.companyService.listCompanies()
  }

  @Put('/company/:id')
  async updateCompany(@Param('id') id: string, @Body() company: Company) {
    return this.companyService.updateCompany(id, company)
  }

  @Post('/company/:companyId/city')
  async addWorkCityToCompany(@Param('companyId') companyId: string, city: City) {
    return this.companyService.addWorkCityToCompany(companyId, city)
  }

  @Get('/company/:companyId/city')
  async listWorkCitiesOfCompany(@Param('companyId') companyId: string) {
    return this.companyService.listWorkCitiesOfCompany(companyId)
  }

  @Get('/company/:companyId/city/:cityId')
  async getWorkCityOfCompanyById(
    @Param('companyId') companyId: string,
    @Param('cityId') cityId: string
  ) {
    return this.companyService.getWorkCityOfCompany(companyId, cityId)
  }

  @Put('/company/:companyId/city/:cityId')
  async updateWorkCityOfCompany(
    @Param('companyId') companyId: string,
    @Param('cityId') cityId: string,
    @Body() city: City
  ) {
    return this.companyService.updateWorkCityOfCompany(companyId, cityId, city)
  }
}
