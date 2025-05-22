import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { SearchQueryDto, AdvancedSearchDto } from '@dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search courses' })
  async search(@Query() query: SearchQueryDto) {
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
  async advancedSearch(@Query() query: AdvancedSearchDto) {
    return this.searchService.advancedSearch(query);
  }
}
