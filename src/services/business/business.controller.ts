import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { City, Company } from '@prisma/client'

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

  @Post('/company/:companyId/city')
  async addWorkCityToCompany(@Param('companyId') companyId: string, city: City) {
    return this.businessService.addWorkCityToCompany(companyId, city)
  }

  @Get('/company/:companyId/city')
  async listWorkCitiesOfCompany(@Param('companyId') companyId: string) {
    return this.businessService.listWorkCitiesOfCompany(companyId)
  }

  @Get('/company/:companyId/city/:cityId')
  async getWorkCityOfCompanyById(
    @Param('companyId') companyId: string,
    @Param('cityId') cityId: string
  ) {
    return this.businessService.getWorkCityOfCompany(companyId, cityId)
  }

  @Put('/company/:companyId/city/:cityId')
  async updateWorkCityOfCompany(
    @Param('companyId') companyId: string,
    @Param('cityId') cityId: string,
    @Body() city: City
  ) {
    return this.businessService.updateWorkCityOfCompany(companyId, cityId, city)
  }

  @Delete('/company/:companyId/city/:cityId')
  async deleteWorkCityOfCompany(
    @Param('companyId') companyId: string,
    @Param('cityId') cityId: string
  ) {
    return this.businessService.deleteWorkCityOfCompany(companyId, cityId)
  }
}
