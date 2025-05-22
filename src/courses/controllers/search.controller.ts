/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search courses' })
  async search(@Query() query) {
    return this.searchService.search(query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  async getSuggestions(@Query('term') term: string) {
    return this.searchService.getSuggestions(term);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get search filters' })
  async getFilters() {
    return this.searchService.getFilters();
  }

  @Get('advanced')
  @ApiOperation({ summary: 'Advanced search' })
  async advancedSearch(@Query() query) {
    return this.searchService.advancedSearch(query);
  }
}
